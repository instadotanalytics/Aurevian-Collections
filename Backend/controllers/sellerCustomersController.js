// backend/controllers/sellerCustomersController.js
// A "customer" here means: a distinct Order.user who has at least one
// PAID order containing an item belonging to the logged-in seller. This
// file never trusts a client-supplied sellerId/customerId as authorization
// — everything is scoped through req.seller._id (from protectSeller) and
// customer detail lookups are only permitted for users who actually
// appear in THIS seller's own aggregated customer set.
//
// ⚠️ SEGMENT / STATUS THRESHOLDS BELOW ARE PROPOSED DEFAULTS, NOT
// EXISTING BUSINESS LOGIC. Nothing in the current schema defines what
// "VIP" or "inactive" means for a customer. Adjust these constants (or
// wire them into PlatformSettings for admin control) as needed.
const VIP_THRESHOLD = 50000; // lifetime spend with this seller
const PREMIUM_THRESHOLD = 20000;
const NEW_CUSTOMER_WINDOW_DAYS = 30; // first order within this window + only 1 order = "new"
const ACTIVE_WINDOW_DAYS = 90; // no order in this window = "inactive"

import mongoose from "mongoose";
import Order from "../models/Order.js";

const REFUNDED_ORDER_STATUSES = ["cancelled", "returned", "rto"];
const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const daysBetween = (a, b) => (a - b) / (1000 * 60 * 60 * 24);

// ============================================
// Core aggregation: one row per PAID order-item-group belonging to this
// seller, with the seller-specific subtotal isolated (same pattern as
// sellerEarningsController.js's getSellerOrderRows).
// ============================================
async function getSellerOrderRowsForCustomers(sellerId) {
  const sellerOid = toObjectId(sellerId);

  return Order.aggregate([
    { $match: { "items.seller": sellerOid, paymentStatus: "paid" } },
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
        user: 1,
        customerName: 1,
        customerEmail: 1,
        customerPhone: 1,
        createdAt: 1,
        orderStatus: 1,
        sellerSubtotal: { $sum: "$sellerItems.subtotal" },
      },
    },
    { $sort: { createdAt: 1 } }, // oldest first, so "first seen" wins naturally below
  ]);
}

// ============================================
// Groups order rows into one record per customer (per Order.user), then
// classifies segment/status per the heuristic documented above.
// ============================================
function buildCustomerRecords(rows) {
  const byUser = new Map();

  for (const r of rows) {
    if (!r.user) continue; // guest/anonymous edge case — skip, no identity to group by
    const key = r.user.toString();

    if (!byUser.has(key)) {
      byUser.set(key, {
        userId: key,
        name: r.customerName,
        email: r.customerEmail,
        phone: r.customerPhone,
        totalOrders: 0,
        totalSpent: 0,
        refundedOrders: 0,
        firstOrderAt: r.createdAt,
        lastOrderAt: r.createdAt,
      });
    }

    const c = byUser.get(key);
    c.totalOrders += 1;
    c.totalSpent += r.sellerSubtotal;
    if (REFUNDED_ORDER_STATUSES.includes(r.orderStatus)) c.refundedOrders += 1;
    if (r.createdAt < c.firstOrderAt) c.firstOrderAt = r.createdAt;
    if (r.createdAt >= c.lastOrderAt) {
      c.lastOrderAt = r.createdAt;
      // Keep the most recent contact details — a customer's name/email/phone
      // on file may have changed between orders.
      c.name = r.customerName;
      c.email = r.customerEmail;
      c.phone = r.customerPhone;
    }
  }

  const now = new Date();
  return [...byUser.values()].map((c) => {
    const daysSinceLast = daysBetween(now, new Date(c.lastOrderAt));
    const daysSinceFirst = daysBetween(now, new Date(c.firstOrderAt));

    const status = daysSinceLast <= ACTIVE_WINDOW_DAYS ? "active" : "inactive";

    let segment;
    if (daysSinceFirst <= NEW_CUSTOMER_WINDOW_DAYS && c.totalOrders === 1) {
      segment = "new";
    } else if (status === "inactive") {
      segment = "inactive";
    } else if (c.totalSpent >= VIP_THRESHOLD) {
      segment = "vip";
    } else if (c.totalSpent >= PREMIUM_THRESHOLD) {
      segment = "premium";
    } else {
      segment = "regular";
    }

    return {
      ...c,
      status,
      segment,
      // Not derivable from current schema — see findings.
      reviews: null,
      avgRating: null,
    };
  });
}

// ============================================
// GET /api/seller/customers/summary
// ============================================
export const getCustomersSummary = async (req, res) => {
  try {
    const rows = await getSellerOrderRowsForCustomers(req.seller._id);
    const customers = buildCustomerRecords(rows);

    const total = customers.length;
    const active = customers.filter((c) => c.status === "active").length;
    const vip = customers.filter((c) => c.segment === "vip").length;
    const premium = customers.filter((c) => c.segment === "premium").length;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = customers.filter(
      (c) => new Date(c.firstOrderAt) >= thisMonthStart,
    ).length;

    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgLifetimeValue = total > 0 ? totalRevenue / total : 0;

    // Returning rate: customers with more than 1 order / total customers.
    const returning = customers.filter((c) => c.totalOrders > 1).length;
    const returningRate = total > 0 ? Math.round((returning / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        active,
        vip,
        premium,
        newThisMonth,
        returningRate,
        avgOrderValue,
        avgLifetimeValue,
      },
    });
  } catch (error) {
    console.error("❌ Get customers summary error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load customer summary",
        error: error.message,
      });
  }
};

// ============================================
// GET /api/seller/customers?search=&segment=&sort=&page=&limit=
// ============================================
export const getCustomers = async (req, res) => {
  try {
    const rows = await getSellerOrderRowsForCustomers(req.seller._id);
    let customers = buildCustomerRecords(rows);

    const { search, segment, sort } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      customers = customers.filter(
        (c) =>
          (c.name || "").toLowerCase().includes(term) ||
          (c.email || "").toLowerCase().includes(term) ||
          (c.phone || "").toLowerCase().includes(term),
      );
    }

    if (segment && segment !== "all") {
      customers = customers.filter((c) => c.segment === segment);
    }

    switch (sort) {
      case "spent":
        customers.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "orders":
        customers.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case "name":
        customers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "recent":
      default:
        customers.sort(
          (a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt),
        );
    }

    const total = customers.length;
    const pageRows = customers.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      data: pageRows,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total,
      },
    });
  } catch (error) {
    console.error("❌ Get customers error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load customers",
        error: error.message,
      });
  }
};

// ============================================
// GET /api/seller/customers/:userId
// Only returns data if this userId actually purchased from THIS seller —
// otherwise 404, so a seller can't fish for arbitrary platform users by
// guessing IDs.
// ============================================
export const getCustomerDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer id" });
    }

    const rows = await getSellerOrderRowsForCustomers(req.seller._id);
    const customers = buildCustomerRecords(rows);
    const customer = customers.find((c) => c.userId === userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "This customer has not purchased from your store",
      });
    }

    const orderHistory = rows
      .filter((r) => r.user.toString() === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((r) => ({
        date: r.createdAt,
        amount: r.sellerSubtotal,
        status: r.orderStatus,
      }));

    return res
      .status(200)
      .json({ success: true, data: { ...customer, orderHistory } });
  } catch (error) {
    console.error("❌ Get customer detail error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to load customer detail",
        error: error.message,
      });
  }
};
