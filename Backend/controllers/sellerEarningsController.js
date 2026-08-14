// backend/controllers/sellerEarningsController.js
// Every earnings figure funnels through getSellerOrderRows() — the ONE
// place that isolates a seller's own item subtotal out of an order that
// could (schema-wise) contain other sellers' items too. Nothing here ever
// reads order.totalAmount as if it were the seller's revenue.
//
// sellerId always comes from req.seller._id (set by protectSeller from the
// verified JWT) — never from req.query/req.body/req.params. This is what
// makes it impossible for Seller A to see Seller B's earnings by editing
// a URL.

import mongoose from "mongoose";
import Order from "../models/Order.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import Seller from "../models/Seller.js";
import SellerPayout from "../models/SellerPayout.js";
import PlatformSettings from "../models/PlatformSettings.js";

// Orders that reached these orderStatus values had money collected and
// then given back. There's no partial-refund field on Order, so the FULL
// seller-subtotal of the order is treated as refunded — an approximation
// until partial-refund tracking exists.
const REFUNDED_ORDER_STATUSES = ["cancelled", "returned", "rto"];
// The only orderStatus this codebase currently uses to mean "delivery is
// confirmed, unlikely to be reversed" — used as the payout-eligibility line.
const FINAL_ORDER_STATUS = "delivered";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

async function getSellerOrderRows(sellerId, { from, to } = {}) {
  const sellerOid = toObjectId(sellerId);

  const match = { "items.seller": sellerOid };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = from;
    if (to) match.createdAt.$lte = to;
  }

  const rows = await Order.aggregate([
    { $match: match },
    {
      $addFields: {
        sellerItems: {
          $filter: {
            input: "$items",
            as: "it",
            cond: { $eq: ["$$it.seller", sellerOid] },
          },
        },
      },
    },
    {
      $project: {
        orderNumber: 1,
        customerName: 1,
        paymentStatus: 1,
        orderStatus: 1,
        fulfillmentStatus: 1,
        createdAt: 1,
        placedAt: 1,
        sellerItems: 1,
        sellerSubtotal: { $sum: "$sellerItems.subtotal" },
        sellerQuantity: { $sum: "$sellerItems.quantity" },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return rows.map((r) => ({
    ...r,
    effectiveDate: r.placedAt || r.createdAt,
  }));
}

function periodToRange(period) {
  const now = new Date();
  if (period === "this-week") {
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const start = new Date(now);
    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    return { from: start, to: now };
  }
  if (period === "this-year") {
    return { from: new Date(now.getFullYear(), 0, 1), to: now };
  }
  return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
}

// ============================================
// GET /api/seller/earnings/summary
// Everything here is LIFETIME (not period-scoped) — the This Week/Month/
// Year toggle only drives the chart. See getEarningsChart below.
// ============================================
export const getEarningsSummary = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const settings = await PlatformSettings.getSettings();

    const allRows = await getSellerOrderRows(sellerId);
    const paidRows = allRows.filter((r) => r.paymentStatus === "paid");
    const deliveredPaid = paidRows.filter(
      (r) => r.orderStatus === FINAL_ORDER_STATUS,
    );
    const refundedPaid = paidRows.filter((r) =>
      REFUNDED_ORDER_STATUSES.includes(r.orderStatus),
    );
    const inPipelinePaid = paidRows.filter(
      (r) =>
        r.orderStatus !== FINAL_ORDER_STATUS &&
        !REFUNDED_ORDER_STATUSES.includes(r.orderStatus),
    );

    const sum = (rows) => rows.reduce((s, r) => s + (r.sellerSubtotal || 0), 0);

    const totalEarnings = sum(paidRows) - sum(refundedPaid);
    const pendingBalance = sum(inPipelinePaid);
    const deliveredEarnings = sum(deliveredPaid);
    const refundsTotal = sum(refundedPaid);

    const [paidOutAgg, processingAgg] = await Promise.all([
      SellerPayout.aggregate([
        { $match: { seller: toObjectId(sellerId), status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      SellerPayout.aggregate([
        {
          $match: {
            seller: toObjectId(sellerId),
            status: { $in: ["requested", "processing"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    const totalPaidOut = paidOutAgg[0]?.total || 0;
    const totalAwaitingProcessing = processingAgg[0]?.total || 0;
    const availableBalance = Math.max(
      0,
      deliveredEarnings - totalPaidOut - totalAwaitingProcessing,
    );

    const totalOrders = paidRows.length;
    const averageOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;

    // Commission — never invented. Null until a super admin configures it.
    const commissionPercent = settings.commissionPercent;
    const commissionAmount =
      commissionPercent != null
        ? Math.round((totalEarnings * commissionPercent) / 100)
        : null;

    // Best day — lifetime, grouped by calendar date of paid orders.
    const byDay = {};
    for (const r of paidRows) {
      const key = new Date(r.effectiveDate).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + r.sellerSubtotal;
    }
    let bestDay = null;
    for (const [date, amount] of Object.entries(byDay)) {
      if (!bestDay || amount > bestDay.amount) bestDay = { date, amount };
    }

    // Best product — unwind seller items across paid orders.
    const byProduct = {};
    for (const r of paidRows) {
      for (const it of r.sellerItems) {
        const key = it.product?.toString() || it.name;
        if (!byProduct[key])
          byProduct[key] = { name: it.name, unitsSold: 0, revenue: 0 };
        byProduct[key].unitsSold += it.quantity;
        byProduct[key].revenue += it.subtotal;
      }
    }
    let bestProduct = null;
    for (const p of Object.values(byProduct)) {
      if (!bestProduct || p.revenue > bestProduct.revenue) bestProduct = p;
    }

    // Rating — derived from this seller's own JewelleryProduct.reviews
    // fields. There is no separate Review model in this codebase. Null if
    // nothing has a review yet, rather than a fabricated figure.
    const sellerProducts = await JewelleryProduct.find({
      "seller.sellerId": sellerId,
    }).select("reviews.averageRating reviews.totalReviews");
    let ratingWeightedSum = 0;
    let ratingReviewCount = 0;
    for (const p of sellerProducts) {
      const count = p.reviews?.totalReviews || 0;
      ratingWeightedSum += (p.reviews?.averageRating || 0) * count;
      ratingReviewCount += count;
    }
    const rating =
      ratingReviewCount > 0 ? ratingWeightedSum / ratingReviewCount : null;

    // Month-over-month change — real comparison, computed from the same
    // rows, not a guessed percentage.
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthTotal =
      sum(paidRows.filter((r) => new Date(r.effectiveDate) >= thisMonthStart)) -
      sum(
        refundedPaid.filter((r) => new Date(r.effectiveDate) >= thisMonthStart),
      );
    const lastMonthTotal =
      sum(
        paidRows.filter(
          (r) =>
            new Date(r.effectiveDate) >= lastMonthStart &&
            new Date(r.effectiveDate) < thisMonthStart,
        ),
      ) -
      sum(
        refundedPaid.filter(
          (r) =>
            new Date(r.effectiveDate) >= lastMonthStart &&
            new Date(r.effectiveDate) < thisMonthStart,
        ),
      );
    const monthOverMonthChangePercent =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : null;

    // Payout method snapshot for the Payout Summary card.
    const seller = await Seller.findById(sellerId).select("bankDetails");
    let payoutMethod = null;
    if (seller?.bankDetails?.upiId) {
      payoutMethod = {
        type: "upi",
        label: `UPI • ${seller.bankDetails.upiId}`,
      };
    } else if (seller?.bankDetails?.accountNumber) {
      const last4 = seller.bankDetails.accountNumber.slice(-4);
      payoutMethod = {
        type: "bank_transfer",
        label: `Bank Transfer •••• ${last4}${seller.bankDetails.bankName ? " • " + seller.bankDetails.bankName : ""}`,
      };
    }

    const minimumPayoutAmount = settings.minimumPayoutAmount;
    const payoutEligible =
      minimumPayoutAmount != null &&
      availableBalance >= minimumPayoutAmount &&
      !!payoutMethod;

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        availableBalance,
        pendingBalance,
        totalOrders,
        averageOrderValue,
        monthOverMonthChangePercent,
        commission: {
          percent: commissionPercent,
          amount: commissionAmount,
          configured: commissionPercent != null,
        },
        refunds: refundsTotal,
        refundedOrderCount: refundedPaid.length,
        bestDay,
        bestProduct,
        rating,
        reviewCount: ratingReviewCount,
        conversionRate: null, // no visitor/session tracking exists yet
        payout: {
          method: payoutMethod,
          minimumPayoutAmount,
          eligible: payoutEligible,
          totalPaidOut,
          totalAwaitingProcessing,
        },
        dataNotes: {
          codOrdersExcluded: allRows.some((r) => r.paymentStatus !== "paid"),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get earnings summary error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load earnings summary",
        error: error.message,
      });
  }
};

// ============================================
// GET /api/seller/earnings/chart?period=this-week|this-month|this-year
// ============================================
export const getEarningsChart = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const period = ["this-week", "this-month", "this-year"].includes(
      req.query.period,
    )
      ? req.query.period
      : "this-month";

    const { from, to } = periodToRange(period);
    const rows = await getSellerOrderRows(sellerId, { from, to });
    const paidRows = rows.filter((r) => r.paymentStatus === "paid");

    let buckets = [];

    if (period === "this-week") {
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const totals = new Array(7).fill(0);
      const orders = new Array(7).fill(0);
      for (const r of paidRows) {
        const idx = (new Date(r.effectiveDate).getDay() + 6) % 7;
        totals[idx] += r.sellerSubtotal;
        orders[idx] += 1;
      }
      buckets = labels.map((label, i) => ({
        label,
        earnings: totals[i],
        orders: orders[i],
      }));
    } else if (period === "this-year") {
      const labels = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const totals = new Array(12).fill(0);
      const orders = new Array(12).fill(0);
      for (const r of paidRows) {
        const m = new Date(r.effectiveDate).getMonth();
        totals[m] += r.sellerSubtotal;
        orders[m] += 1;
      }
      buckets = labels.map((label, i) => ({
        label,
        earnings: totals[i],
        orders: orders[i],
      }));
    } else {
      const now = new Date();
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const totals = new Array(daysInMonth).fill(0);
      const orders = new Array(daysInMonth).fill(0);
      for (const r of paidRows) {
        const d = new Date(r.effectiveDate).getDate() - 1;
        totals[d] += r.sellerSubtotal;
        orders[d] += 1;
      }
      buckets = totals.map((earnings, i) => ({
        label: String(i + 1),
        earnings,
        orders: orders[i],
      }));
    }

    return res.status(200).json({ success: true, data: buckets, period });
  } catch (error) {
    console.error("❌ Get earnings chart error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load earnings chart",
        error: error.message,
      });
  }
};

// ============================================
// GET /api/seller/earnings/transactions?page=&limit=
// ============================================
export const getEarningsTransactions = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const rows = await getSellerOrderRows(sellerId);
    const relevant = rows.filter(
      (r) =>
        r.paymentStatus === "paid" ||
        REFUNDED_ORDER_STATUSES.includes(r.orderStatus),
    );

    const total = relevant.length;
    const pageRows = relevant.slice((page - 1) * limit, page * limit);

    const shaped = pageRows.map((r) => {
      const isRefund = REFUNDED_ORDER_STATUSES.includes(r.orderStatus);
      const status = isRefund
        ? "refunded"
        : r.orderStatus === FINAL_ORDER_STATUS
          ? "completed"
          : "pending";
      return {
        id: r.orderNumber,
        date: r.effectiveDate,
        customer: r.customerName,
        amount: r.sellerSubtotal,
        status,
        type: isRefund ? "refund" : "sale",
      };
    });

    return res.status(200).json({
      success: true,
      data: shaped,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total,
      },
    });
  } catch (error) {
    console.error("❌ Get earnings transactions error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load transactions",
        error: error.message,
      });
  }
};

// ============================================
// POST /api/seller/earnings/payout/request
// ============================================
export const requestPayout = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const settings = await PlatformSettings.getSettings();

    if (settings.minimumPayoutAmount == null) {
      return res.status(400).json({
        success: false,
        message:
          "Payouts are not configured yet on this platform. Please contact support.",
      });
    }

    const seller = await Seller.findById(sellerId).select("bankDetails");
    const hasUpi = !!seller?.bankDetails?.upiId;
    const hasBank = !!seller?.bankDetails?.accountNumber;
    if (!hasUpi && !hasBank) {
      return res.status(400).json({
        success: false,
        message:
          "Add your bank or UPI details in your profile before requesting a payout.",
      });
    }

    // Recompute available balance server-side — never trust a client amount.
    const rows = await getSellerOrderRows(sellerId);
    const paidRows = rows.filter((r) => r.paymentStatus === "paid");
    const deliveredPaid = paidRows.filter(
      (r) => r.orderStatus === FINAL_ORDER_STATUS,
    );
    const deliveredEarnings = deliveredPaid.reduce(
      (s, r) => s + r.sellerSubtotal,
      0,
    );

    const [paidOutAgg, processingAgg] = await Promise.all([
      SellerPayout.aggregate([
        { $match: { seller: toObjectId(sellerId), status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      SellerPayout.aggregate([
        {
          $match: {
            seller: toObjectId(sellerId),
            status: { $in: ["requested", "processing"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);
    const availableBalance = Math.max(
      0,
      deliveredEarnings -
        (paidOutAgg[0]?.total || 0) -
        (processingAgg[0]?.total || 0),
    );

    if (availableBalance < settings.minimumPayoutAmount) {
      return res.status(400).json({
        success: false,
        message: `Available balance (₹${availableBalance.toLocaleString("en-IN")}) is below the minimum payout amount (₹${settings.minimumPayoutAmount.toLocaleString("en-IN")}).`,
      });
    }

    const method = hasUpi
      ? { type: "upi", upiId: seller.bankDetails.upiId }
      : {
          type: "bank_transfer",
          accountHolderName: seller.bankDetails.accountHolderName,
          bankName: seller.bankDetails.bankName,
          accountNumberMasked: `••••${seller.bankDetails.accountNumber.slice(-4)}`,
          ifscCode: seller.bankDetails.ifscCode,
        };

    const payout = await SellerPayout.create({
      seller: sellerId,
      amount: availableBalance,
      status: "requested",
      method,
    });

    return res.status(201).json({
      success: true,
      message:
        "Payout requested. Our team will process this manually — you'll be notified once it's completed.",
      data: payout,
    });
  } catch (error) {
    console.error("❌ Request payout error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to request payout",
        error: error.message,
      });
  }
};

// ============================================
// GET /api/seller/earnings/payout/history
// ============================================
export const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await SellerPayout.find({ seller: req.seller._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    console.error("❌ Get payout history error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load payout history",
        error: error.message,
      });
  }
};
