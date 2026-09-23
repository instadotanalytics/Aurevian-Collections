// backend/controllers/sellerPayoutsController.js
//
// Seller-facing view of their own commission ledger. Every query is
// scoped through req.seller._id (set by protectSeller from the verified
// JWT) — never from req.query/req.body/req.params — so a seller can
// never read another seller's earnings by editing a URL or an id.

import mongoose from "mongoose";
import CommissionTransaction from "../models/CommissionTransaction.js";
import { getSellerPayoutSummary } from "../services/commissionService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================
// GET /api/seller/payouts/summary
// The authoritative gross/commission/net breakdown for this seller —
// this is what "Available Balance" on the seller dashboard must use,
// NOT the old raw item-subtotal calculation.
// ============================================
export const getMyPayoutSummary = async (req, res) => {
  try {
    const summary = await getSellerPayoutSummary(req.seller._id);
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("❌ Get seller payout summary error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load payout summary" });
  }
};

// ============================================
// GET /api/seller/payouts?search=&status=&from=&to=&page=&limit=&sort=
// ============================================
export const getMyPayoutTransactions = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { search, status, from, to, sort = "recent" } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const query = { seller: sellerId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { orderNumber: new RegExp(escaped, "i") },
        { productNameSnapshot: new RegExp(escaped, "i") },
      ];
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    let sortStage = { createdAt: -1 };
    if (sort === "amount-high") sortStage = { sellerNetAmount: -1 };
    if (sort === "amount-low") sortStage = { sellerNetAmount: 1 };
    if (sort === "oldest") sortStage = { createdAt: 1 };

    const [rows, total] = await Promise.all([
      CommissionTransaction.find(query)
        .sort(sortStage)
        .skip((page - 1) * limit)
        .limit(limit),
      CommissionTransaction.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("❌ Get seller payout transactions error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load payout transactions" });
  }
};

// ============================================
// GET /api/seller/payouts/:id
// Ownership-enforced — 404 (not 403) if the transaction belongs to
// another seller, so a seller can't even confirm an id's existence.
// ============================================
export const getMyPayoutTransactionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction id" });
    }

    const transaction = await CommissionTransaction.findOne({
      _id: id,
      seller: req.seller._id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    // Show any reversal rows linked to this one for full transparency.
    const reversals = await CommissionTransaction.find({
      reversalOf: transaction._id,
    }).sort({ createdAt: 1 });

    return res
      .status(200)
      .json({ success: true, data: { transaction, reversals } });
  } catch (error) {
    console.error("❌ Get seller payout transaction detail error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load transaction" });
  }
};
