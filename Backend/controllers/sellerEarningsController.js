// backend/controllers/sellerEarningsController.js
//
// Seller-facing Earnings/Payouts dashboard data. Every financial figure
// here is derived from the CommissionTransaction ledger via
// commissionService — nothing here recomputes gross/commission/net from
// order.items directly, and nothing here trusts a client-supplied amount.
//
// getSellerOrderRows() below is UNCHANGED and still exported — it backs
// getSellerDashboard() in sellerController.js and sellerCustomersController.js,
// neither of which this feature touches. This file's ledger-based rewrite
// is scoped to the Earnings/Payouts section only, which must show
// POST-COMMISSION seller net, not gross item subtotals.
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
import CommissionTransaction, {
  COMMISSION_TXN_STATUS,
} from "../models/CommissionTransaction.js";
import commissionService from "../services/commissionService.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// Ledger statuses that represent a line item that was actually placed
// and paid for, whether or not it was later refunded — excludes rows
// that never became a real sale (voided before ever going eligible, or
// failed to even attribute a seller).
const REALIZED_SALE_STATUSES = [
  COMMISSION_TXN_STATUS.pending,
  COMMISSION_TXN_STATUS.eligible,
  COMMISSION_TXN_STATUS.processing,
  COMMISSION_TXN_STATUS.paid,
  COMMISSION_TXN_STATUS.refunded,
];

// ✅ UNCHANGED — reused by sellerController.js (dashboard summary) and
// sellerCustomersController.js. Left exactly as it was so the main
// seller Dashboard and Customers tab keep computing their own numbers
// exactly as before — this file's rewrite below only changes the
// Earnings/Payouts section.
export async function getSellerOrderRows(sellerId, { from, to } = {}) {
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

// Original (non-reversal) ledger rows for this seller representing a
// real, placed sale — used for "best day", "best product", order counts
// and month-over-month comparisons. The headline money TOTALS on the
// dashboard always come from commissionService.getSellerPayoutSummary,
// which nets out reversals correctly by status bucket; these rows are
// only for the descriptive/analytical figures below.
async function getSellerRealizedSaleRows(sellerId, { from, to } = {}) {
  const match = {
    seller: toObjectId(sellerId),
    reversalOf: { $exists: false },
    status: { $in: REALIZED_SALE_STATUSES },
  };
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = from;
    if (to) match.createdAt.$lte = to;
  }
  return CommissionTransaction.find(match).lean();
}

// ============================================
// GET /api/seller/earnings/summary
// The authoritative source for the Earnings page's summary cards. Every
// amount is post-commission and comes from the ledger — never from raw
// order.items subtotals.
// ============================================
export const getEarningsSummary = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const settings = await PlatformSettings.getSettings();

    const summary = await commissionService.getSellerPayoutSummary(sellerId);
    const realizedRows = await getSellerRealizedSaleRows(sellerId);

    const distinctOrderIds = new Set(
      realizedRows.map((r) => r.order.toString()),
    );
    const totalSalesCount = distinctOrderIds.size;
    const averageOrderValue =
      totalSalesCount > 0 ? summary.totalNetEarnings / totalSalesCount : 0;

    // Best day — by calendar date, summing net earnings.
    const byDay = {};
    for (const r of realizedRows) {
      const key = new Date(r.createdAt).toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + r.sellerNetAmount;
    }
    let bestDay = null;
    for (const [date, amount] of Object.entries(byDay)) {
      if (!bestDay || amount > bestDay.amount) bestDay = { date, amount };
    }

    // Best product — by net revenue / units sold.
    const byProduct = {};
    for (const r of realizedRows) {
      const key = r.product.toString();
      if (!byProduct[key]) {
        byProduct[key] = {
          name: r.productNameSnapshot,
          unitsSold: 0,
          revenue: 0,
        };
      }
      byProduct[key].unitsSold += r.quantity;
      byProduct[key].revenue += r.sellerNetAmount;
    }
    let bestProduct = null;
    for (const p of Object.values(byProduct)) {
      if (!bestProduct || p.revenue > bestProduct.revenue) bestProduct = p;
    }

    // Month-over-month change, computed from the same realized rows.
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sumRange = (start, end) =>
      realizedRows
        .filter(
          (r) =>
            new Date(r.createdAt) >= start &&
            (!end || new Date(r.createdAt) < end),
        )
        .reduce((s, r) => s + r.sellerNetAmount, 0);
    const thisMonthTotal = sumRange(thisMonthStart, null);
    const lastMonthTotal = sumRange(lastMonthStart, thisMonthStart);
    const monthOverMonthChangePercent =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : null;

    // Rating — from this seller's own product review aggregates. There
    // is no separate Review model in this codebase.
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
        label: `Bank Transfer •••• ${last4}${
          seller.bankDetails.bankName ? " • " + seller.bankDetails.bankName : ""
        }`,
      };
    }

    const minimumPayoutAmount = settings.minimumPayoutAmount;
    const payoutEligible =
      summary.availableBalance > 0 &&
      summary.availableBalance >= (minimumPayoutAmount || 0) &&
      !!payoutMethod;

    return res.status(200).json({
      success: true,
      data: {
        // ---- Required summary cards ----
        totalSalesCount,
        grossEarnings: summary.totalGrossSales,
        platformFees: summary.totalCommission,
        netEarnings: summary.totalNetEarnings,
        pendingEarnings: summary.pendingBalance,
        availableBalance: summary.availableBalance,
        paidOut: summary.paidOut,
        processingBalance: summary.processingBalance,
        reversedAmount: summary.reversedAmount,
        cancelledAmount: summary.cancelledAmount,

        // ---- Descriptive / secondary fields ----
        totalEarnings: summary.totalNetEarnings,
        totalOrders: totalSalesCount,
        averageOrderValue,
        monthOverMonthChangePercent,
        commission: {
          percent: settings.commissionPercent,
          amount: summary.totalCommission,
          configured: true,
        },
        refunds: Math.abs(summary.reversedAmount || 0),
        bestDay,
        bestProduct,
        rating,
        reviewCount: ratingReviewCount,
        conversionRate: null, // no visitor/session tracking exists yet
        payout: {
          method: payoutMethod,
          minimumPayoutAmount,
          eligible: payoutEligible,
          totalPaidOut: summary.paidOut,
          totalAwaitingProcessing: summary.processingBalance,
        },
      },
    });
  } catch (error) {
    console.error("❌ Get earnings summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load earnings summary",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/seller/earnings/chart?period=this-week|this-month|this-year
// Buckets NET seller earnings (post-commission) from realized ledger
// rows, so the chart is always consistent with "Net Earnings" above.
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
    const rows = await getSellerRealizedSaleRows(sellerId, { from, to });

    let buckets = [];

    if (period === "this-week") {
      const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const totals = new Array(7).fill(0);
      const orders = new Array(7).fill(0);
      for (const r of rows) {
        const idx = (new Date(r.createdAt).getDay() + 6) % 7;
        totals[idx] += r.sellerNetAmount;
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
      for (const r of rows) {
        const m = new Date(r.createdAt).getMonth();
        totals[m] += r.sellerNetAmount;
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
      for (const r of rows) {
        const d = new Date(r.createdAt).getDate() - 1;
        totals[d] += r.sellerNetAmount;
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
    return res.status(500).json({
      success: false,
      message: "Failed to load earnings chart",
      error: error.message,
    });
  }
};

// ============================================
// ✅ UNCHANGED — GET /api/seller/dashboard/performance
// Backs the main Dashboard's "Sales Performance" widget, a gross-sales
// view scoped to the whole seller dashboard (not the Earnings/Payouts
// section). Still backed by getSellerOrderRows so the main dashboard's
// existing numbers don't shift as a side effect of this feature.
// ============================================
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = [
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

export const getDashboardPerformance = async (req, res) => {
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

    let data = [];

    if (period === "this-week") {
      const totals = new Array(7).fill(0);
      const orders = new Array(7).fill(0);
      for (const r of paidRows) {
        const idx = (new Date(r.effectiveDate).getDay() + 6) % 7;
        totals[idx] += r.sellerSubtotal;
        orders[idx] += 1;
      }
      data = WEEKDAY_LABELS.map((label, i) => ({
        label,
        revenue: totals[i],
        orders: orders[i],
      }));
    } else if (period === "this-year") {
      const totals = new Array(12).fill(0);
      const orders = new Array(12).fill(0);
      for (const r of paidRows) {
        const m = new Date(r.effectiveDate).getMonth();
        totals[m] += r.sellerSubtotal;
        orders[m] += 1;
      }
      data = MONTH_LABELS.map((label, i) => ({
        label,
        revenue: totals[i],
        orders: orders[i],
      }));
    } else {
      const now = new Date();
      const monthLabel = MONTH_LABELS[now.getMonth()];
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
      data = totals.map((revenue, i) => ({
        label: `${i + 1} ${monthLabel}`,
        revenue,
        orders: orders[i],
      }));
    }

    return res.status(200).json({ success: true, period, data });
  } catch (error) {
    console.error("❌ Get dashboard performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load performance data",
      error: error.message,
    });
  }
};

// ============================================
// POST /api/seller/earnings/payout/request
// Recomputes the eligible balance server-side straight from the ledger —
// never trusts a client-supplied amount. Links the created SellerPayout
// to the exact CommissionTransaction rows it covers and flips those rows
// to "processing" so they can never be pulled into a second concurrent
// payout request.
// ============================================
export const requestPayout = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const settings = await PlatformSettings.getSettings();

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

    const eligibleRows = await CommissionTransaction.find({
      seller: sellerId,
      status: COMMISSION_TXN_STATUS.eligible,
      reversalOf: { $exists: false },
    });

    const availableBalance = eligibleRows.reduce(
      (s, r) => s + r.sellerNetAmount,
      0,
    );

    if (eligibleRows.length === 0 || availableBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "No eligible earnings are available for payout right now.",
      });
    }

    if (availableBalance < (settings.minimumPayoutAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Available balance (₹${availableBalance.toLocaleString(
          "en-IN",
        )}) is below the minimum payout amount (₹${(
          settings.minimumPayoutAmount || 0
        ).toLocaleString("en-IN")}).`,
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
      commissionTransactionIds: eligibleRows.map((r) => r._id),
    });

    await CommissionTransaction.updateMany(
      { _id: { $in: eligibleRows.map((r) => r._id) } },
      {
        $set: {
          status: COMMISSION_TXN_STATUS.processing,
          payoutReference: payout._id,
        },
        $push: {
          statusHistory: {
            status: COMMISSION_TXN_STATUS.processing,
            previousStatus: COMMISSION_TXN_STATUS.eligible,
            role: "seller",
            changedBy: sellerId,
            timestamp: new Date(),
          },
        },
      },
    );

    return res.status(201).json({
      success: true,
      message:
        "Payout requested. Our team will process this and confirm once the transfer is completed.",
      data: payout,
    });
  } catch (error) {
    console.error("❌ Request payout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to request payout",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/seller/earnings/payout/history
// The seller's own payout REQUESTS (SellerPayout docs). Distinct from
// the line-item ledger, which is available via GET /api/seller/payouts.
// ============================================
export const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await SellerPayout.find({ seller: req.seller._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, data: payouts });
  } catch (error) {
    console.error("❌ Get payout history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load payout history",
      error: error.message,
    });
  }
};
