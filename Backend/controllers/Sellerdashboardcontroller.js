// backend/controllers/sellerDashboardController.js
//
// All REAL, seller-scoped dashboard data. Nothing here is hardcoded.
// Every query is scoped through req.seller._id (from protectSeller) —
// never a client-supplied id. A seller can only ever see rows where
// items.seller (or seller.sellerId for products) equals their own id.
//
// REVENUE RULE (documented, not invented from nothing):
// "Revenue" = sum of seller-specific item subtotals for orders that are
// paymentStatus:"paid" AND whose orderStatus is NOT cancelled/returned/rto.
// This is intentionally stricter than sellerCustomersController's
// "totalSpent" (which includes paid-but-later-cancelled orders, because
// that field represents historical customer lifetime spend, not live
// seller income). The two numbers can legitimately differ — that's by
// design, not a bug. If you want them to match exactly, remove the
// orderStatus exclusion below.
//
// ORDER STATUS: the Order schema's orderStatus enum is exactly:
// placed, processing, ready_to_ship, shipped, in_transit,
// out_for_delivery, delivered, rto, return_initiated, returned, cancelled
// There is no "pending" or "confirmed" value in this enum — fulfillment
// confirmation is tracked separately via fulfillmentStatus. The compact
// "order status" section therefore reports real orderStatus buckets
// (labelled for display) plus a separate "awaiting your confirmation"
// count sourced from fulfillmentStatus. Nothing here invents a status
// that doesn't exist in the schema.

import mongoose from "mongoose";
import Order from "../models/Order.js";
import JewelleryProduct from "../models/JewelleryProduct.js";
import {
  getSellerOrderRowsForCustomers,
  buildCustomerRecords,
} from "./sellerCustomersController.js";

const REVENUE_EXCLUDED_STATUSES = ["cancelled", "returned", "rto"];
const ORDER_STATUS_VALUES = [
  "placed",
  "processing",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "rto",
  "return_initiated",
  "returned",
  "cancelled",
];
const ORDER_STATUS_LABELS = {
  placed: "Placed",
  processing: "Processing",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rto: "RTO",
  return_initiated: "Return Initiated",
  returned: "Returned",
  cancelled: "Cancelled",
};

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfPrevMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

// ============================================
// Seller-specific item subtotal aggregation, same pattern used across
// sellerEarningsController / sellerCustomersController — one row per
// order with THIS seller's slice isolated. Optional extra $match stages
// can be layered on for revenue-specific filtering.
// ============================================
async function getSellerItemRows(
  sellerId,
  { onlyPaid = false, excludeRefunded = false, since = null } = {},
) {
  const sellerOid = toObjectId(sellerId);
  const match = { "items.seller": sellerOid };
  if (onlyPaid) match.paymentStatus = "paid";
  if (excludeRefunded) match.orderStatus = { $nin: REVENUE_EXCLUDED_STATUSES };
  if (since) match.createdAt = { $gte: since };

  return Order.aggregate([
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
        user: 1,
        customerName: 1,
        customerEmail: 1,
        customerPhone: 1,
        createdAt: 1,
        orderStatus: 1,
        fulfillmentStatus: 1,
        totalAmount: 1,
        statusHistory: 1,
        sellerItems: 1,
        sellerSubtotal: { $sum: "$sellerItems.subtotal" },
        sellerItemCount: { $size: "$sellerItems" },
      },
    },
  ]);
}

// ============================================
// GET /api/seller/dashboard
// Main stat cards + order status breakdown + low stock.
// ============================================
export const getDashboardOverview = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const sellerOid = toObjectId(sellerId);
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const prevMonthStart = startOfPrevMonth(now);

    // ---------- PRODUCTS ----------
    const [totalProducts, activeProducts, productsThisMonth] =
      await Promise.all([
        JewelleryProduct.countDocuments({ "seller.sellerId": sellerOid }),
        JewelleryProduct.countDocuments({
          "seller.sellerId": sellerOid,
          status: "Published",
          isActive: true,
        }),
        JewelleryProduct.countDocuments({
          "seller.sellerId": sellerOid,
          createdAt: { $gte: thisMonthStart },
        }),
      ]);

    // ---------- ORDERS (all orders touching this seller, any payment status) ----------
    const [totalOrders, pendingConfirmation] = await Promise.all([
      Order.countDocuments({ "items.seller": sellerOid }),
      Order.countDocuments({
        "items.seller": sellerOid,
        fulfillmentStatus: "PENDING_SELLER_CONFIRMATION",
      }),
    ]);

    const statusAgg = await Order.aggregate([
      { $match: { "items.seller": sellerOid } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);
    const statusCountMap = Object.fromEntries(
      statusAgg.map((s) => [s._id, s.count]),
    );
    const orderStatusCounts = ORDER_STATUS_VALUES.map((status) => ({
      status,
      label: ORDER_STATUS_LABELS[status],
      count: statusCountMap[status] || 0,
    }));

    // ---------- REVENUE (paid, non-refunded, seller-specific subtotal) ----------
    const revenueRows = await getSellerItemRows(sellerId, {
      onlyPaid: true,
      excludeRefunded: true,
    });
    const totalRevenue = revenueRows.reduce((s, r) => s + r.sellerSubtotal, 0);
    const thisMonthRevenue = revenueRows
      .filter((r) => r.createdAt >= thisMonthStart)
      .reduce((s, r) => s + r.sellerSubtotal, 0);
    const lastMonthRevenue = revenueRows
      .filter(
        (r) => r.createdAt >= prevMonthStart && r.createdAt < thisMonthStart,
      )
      .reduce((s, r) => s + r.sellerSubtotal, 0);

    let revenueChangePercent = null;
    if (lastMonthRevenue > 0) {
      revenueChangePercent =
        Math.round(
          ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000,
        ) / 10;
    }
    // If there's no last-month baseline, we deliberately return null rather
    // than inventing a percentage — the frontend shows a neutral fallback.

    // ---------- CUSTOMERS (reuse the exact logic from /seller/customers) ----------
    const customerRows = await getSellerOrderRowsForCustomers(sellerId);
    const customers = buildCustomerRecords(customerRows);
    const totalCustomers = customers.length;
    const newCustomersThisMonth = customers.filter(
      (c) => new Date(c.firstOrderAt) >= thisMonthStart,
    ).length;

    // ---------- LOW STOCK (uses the schema's own per-product threshold) ----------
    const lowStockProducts = await JewelleryProduct.aggregate([
      {
        $match: {
          "seller.sellerId": sellerOid,
          isActive: true,
          status: { $ne: "Archived" },
          $expr: {
            $lte: ["$inventory.stockQuantity", "$inventory.lowStockThreshold"],
          },
        },
      },
      { $sort: { "inventory.stockQuantity": 1 } },
      { $limit: 10 },
      {
        $project: {
          productName: 1,
          thumbnail: 1,
          stockQuantity: "$inventory.stockQuantity",
          lowStockThreshold: "$inventory.lowStockThreshold",
          availability: "$inventory.availability",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          newThisMonth: productsThisMonth,
        },
        orders: {
          total: totalOrders,
          pendingConfirmation,
        },
        revenue: {
          total: Math.round(totalRevenue),
          thisMonth: Math.round(thisMonthRevenue),
          lastMonth: Math.round(lastMonthRevenue),
          changePercent: revenueChangePercent,
        },
        customers: {
          total: totalCustomers,
          newThisMonth: newCustomersThisMonth,
        },
        orderStatusCounts,
        lowStockProducts,
        // Legacy fields kept for any other consumer of this endpoint
        status: req.seller.status,
        isVerified: req.seller.isVerified,
        kycStatus: req.seller.kyc?.status || "not_submitted",
        emailVerified: req.seller.emailVerified,
        phoneVerified: req.seller.phoneVerified,
      },
    });
  } catch (error) {
    console.error("❌ Get dashboard overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/seller/dashboard/performance?period=week|month|year
// Revenue-over-time for the chart. Labels/values are 100% derived from
// real Order data — nothing is a static array of month names.
// ============================================
export const getPerformanceChart = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const period = ["week", "month", "year"].includes(req.query.period)
      ? req.query.period
      : "month";
    const now = new Date();

    let since, bucketFormat, buckets;

    if (period === "week") {
      since = new Date(now);
      since.setDate(since.getDate() - 6);
      since.setHours(0, 0, 0, 0);
      bucketFormat = "%Y-%m-%d";
      buckets = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        buckets.push({
          key: d.toISOString().slice(0, 10),
          label: d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
        });
      }
    } else if (period === "month") {
      since = startOfMonth(now);
      bucketFormat = "%Y-%m-%d";
      buckets = [];
      const lastDay = now.getDate(); // partial month up to today
      for (let day = 1; day <= lastDay; day++) {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        buckets.push({
          key: d.toISOString().slice(0, 10),
          label: d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
        });
      }
    } else {
      since = new Date(now.getFullYear(), 0, 1);
      bucketFormat = "%Y-%m";
      buckets = [];
      const lastMonth = now.getMonth(); // 0-indexed, up to current month
      for (let m = 0; m <= lastMonth; m++) {
        const d = new Date(now.getFullYear(), m, 1);
        buckets.push({
          key: `${d.getFullYear()}-${String(m + 1).padStart(2, "0")}`,
          label: d.toLocaleDateString("en-IN", { month: "short" }),
        });
      }
    }

    const rows = await getSellerItemRows(sellerId, {
      onlyPaid: true,
      excludeRefunded: true,
      since,
    });

    const revenueByBucket = new Map();
    const ordersByBucket = new Map();
    for (const r of rows) {
      const d = new Date(r.createdAt);
      const key =
        bucketFormat === "%Y-%m-%d"
          ? d.toISOString().slice(0, 10)
          : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      revenueByBucket.set(
        key,
        (revenueByBucket.get(key) || 0) + r.sellerSubtotal,
      );
      ordersByBucket.set(key, (ordersByBucket.get(key) || 0) + 1);
    }

    const data = buckets.map((b) => ({
      label: b.label,
      revenue: Math.round(revenueByBucket.get(b.key) || 0),
      orders: ordersByBucket.get(b.key) || 0,
    }));

    return res.status(200).json({ success: true, period, data });
  } catch (error) {
    console.error("❌ Get performance chart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load performance data",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/seller/dashboard/top-products?limit=5
// ============================================
export const getTopProducts = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const sellerOid = toObjectId(sellerId);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));

    const topAgg = await Order.aggregate([
      {
        $match: {
          "items.seller": sellerOid,
          paymentStatus: "paid",
          orderStatus: { $nin: REVENUE_EXCLUDED_STATUSES },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.seller": sellerOid } },
      {
        $group: {
          _id: "$items.product",
          unitsSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "jewelleryproducts",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productId: "$_id",
          unitsSold: 1,
          revenue: 1,
          productName: "$product.productName",
          thumbnail: "$product.thumbnail",
          stockQuantity: "$product.inventory.stockQuantity",
          availability: "$product.inventory.availability",
          status: "$product.status",
        },
      },
    ]);

    return res.status(200).json({ success: true, data: topAgg });
  } catch (error) {
    console.error("❌ Get top products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load top products",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/seller/orders/recent?limit=5
// Replaces the old dummy implementation with real seller-scoped orders.
// ============================================
export const getRecentOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));

    const rows = await getSellerItemRows(sellerId);
    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recent = rows.slice(0, limit).map((r) => ({
      _id: r._id,
      orderNumber: r.orderNumber,
      customer: r.customerName || "Unknown",
      sellerAmount: Math.round(r.sellerSubtotal),
      orderTotal: r.totalAmount,
      status: r.orderStatus,
      date: r.createdAt,
      items: r.sellerItemCount,
    }));

    return res.status(200).json({ success: true, data: recent });
  } catch (error) {
    console.error("❌ Get recent orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// ============================================
// GET /api/seller/activities/recent?limit=10
// Real activity feed sourced from Order.statusHistory entries on orders
// that contain this seller's items.
// ============================================
export const getRecentActivities = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const sellerOid = toObjectId(sellerId);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const events = await Order.aggregate([
      { $match: { "items.seller": sellerOid } },
      { $unwind: "$statusHistory" },
      { $sort: { "statusHistory.timestamp": -1 } },
      { $limit: limit },
      {
        $project: {
          orderNumber: 1,
          status: "$statusHistory.status",
          role: "$statusHistory.role",
          reason: "$statusHistory.reason",
          timestamp: "$statusHistory.timestamp",
        },
      },
    ]);

    const ICONS = {
      placed: "🆕",
      processing: "⚙️",
      ready_to_ship: "📦",
      shipped: "🚚",
      in_transit: "🚚",
      out_for_delivery: "📮",
      delivered: "✅",
      cancelled: "❌",
      returned: "↩️",
      rto: "↩️",
      return_initiated: "↩️",
    };

    const activities = events.map((e) => ({
      _id: `${e.orderNumber}-${new Date(e.timestamp).getTime()}`,
      type: "order",
      message: `Order #${e.orderNumber} — ${ORDER_STATUS_LABELS[e.status] || e.status}`,
      timestamp: e.timestamp,
      icon: ICONS[e.status] || "📦",
    }));

    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    console.error("❌ Get recent activities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error.message,
    });
  }
};
