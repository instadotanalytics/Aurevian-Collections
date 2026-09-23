// backend/controllers/adminPayoutController.js
//
// Super-admin-only. Mounted under the already-protected /api/super-admin
// router (protectSuperAdmin applied to the whole router in
// superAdminRoutes.js), so req.admin is always a verified super admin
// here. Admins can VIEW every seller's ledger and REVIEW/ADVANCE payout
// requests, but can never edit an original transaction's gross/
// commission/net amounts — only status transitions are exposed, and
// every one of them is audit-logged.

import mongoose from "mongoose";
import CommissionTransaction, {
  COMMISSION_TXN_STATUS,
} from "../models/CommissionTransaction.js";
import SellerPayout from "../models/SellerPayout.js";
import Seller from "../models/Seller.js";
import { getPlatformSummary } from "../services/commissionService.js";
import { logAudit } from "../services/auditLogService.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================
// GET /api/super-admin/payouts/summary?from=&to=
// ============================================
export const getPlatformPayoutSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const summary = await getPlatformSummary({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error("❌ Get platform payout summary error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load platform summary" });
  }
};

// ============================================
// GET /api/super-admin/payouts?seller=&order=&product=&status=&from=&to=&page=&limit=
// Full ledger browser across every seller.
// ============================================
export const getAllPayoutTransactions = async (req, res) => {
  try {
    const { seller, order, product, status, from, to } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 25));

    const query = {};
    if (status && status !== "all") query.status = status;
    if (seller && isValidId(seller)) query.seller = seller;

    if (order && order.trim()) {
      query.orderNumber = new RegExp(
        order.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
    }
    if (product && product.trim()) {
      query.productNameSnapshot = new RegExp(
        product.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
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

    const [rows, total] = await Promise.all([
      CommissionTransaction.find(query)
        .populate("seller", "firstName lastName storeInfo.storeName email")
        .sort({ createdAt: -1 })
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
    console.error("❌ Get all payout transactions error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load payout transactions" });
  }
};

// ============================================
// GET /api/super-admin/payouts/export — CSV export of the filtered ledger
// ============================================
export const exportPayoutTransactions = async (req, res) => {
  try {
    const { seller, order, product, status, from, to } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;
    if (seller && isValidId(seller)) query.seller = seller;
    if (order && order.trim()) {
      query.orderNumber = new RegExp(
        order.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
    }
    if (product && product.trim()) {
      query.productNameSnapshot = new RegExp(
        product.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const rows = await CommissionTransaction.find(query)
      .populate("seller", "firstName lastName storeInfo.storeName")
      .sort({ createdAt: -1 })
      .limit(10000);

    const header = [
      "Date",
      "Order Number",
      "Seller",
      "Product",
      "Quantity",
      "Gross Amount",
      "Commission %",
      "Commission Amount",
      "Seller Net",
      "Status",
      "Reference ID",
    ];

    const escapeCsv = (val) => {
      const s = val === null || val === undefined ? "" : String(val);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          new Date(r.createdAt).toISOString(),
          r.orderNumber,
          r.seller?.storeInfo?.storeName ||
            `${r.seller?.firstName || ""} ${r.seller?.lastName || ""}`.trim(),
          r.productNameSnapshot,
          r.quantity,
          r.grossAmount,
          r.commissionPercentSnapshot,
          r.commissionAmount,
          r.sellerNetAmount,
          r.status,
          r.referenceId || "",
        ]
          .map(escapeCsv)
          .join(","),
      );
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payout-ledger-${Date.now()}.csv"`,
    );
    return res.status(200).send(csv);
  } catch (error) {
    console.error("❌ Export payout transactions error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to export payout ledger" });
  }
};

// ============================================
// GET /api/super-admin/payouts/:id
// ============================================
export const getPayoutTransactionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction id" });
    }

    const transaction = await CommissionTransaction.findById(id).populate(
      "seller",
      "firstName lastName storeInfo.storeName email",
    );
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const reversals = await CommissionTransaction.find({
      reversalOf: transaction._id,
    }).sort({ createdAt: 1 });

    return res
      .status(200)
      .json({ success: true, data: { transaction, reversals } });
  } catch (error) {
    console.error("❌ Get payout transaction detail error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load transaction" });
  }
};

// ============================================
// GET /api/super-admin/payouts/requests?status=&seller=&page=&limit=
// The seller-initiated payout REQUESTS (SellerPayout docs) — what an
// admin actually needs to action, distinct from the raw ledger above.
// ============================================
export const getPayoutRequests = async (req, res) => {
  try {
    const { status, seller } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const query = {};
    if (status && status !== "all") query.status = status;
    if (seller && isValidId(seller)) query.seller = seller;

    const [rows, total] = await Promise.all([
      SellerPayout.find(query)
        .populate("seller", "firstName lastName storeInfo.storeName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      SellerPayout.countDocuments(query),
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
    console.error("❌ Get payout requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load payout requests" });
  }
};

// ============================================
// PATCH /api/super-admin/payouts/requests/:id/status
// body: { status: "processing" | "paid" | "rejected", reason?, paymentReferenceId? }
//
// This is the ONLY way a payout's status can change. It never lets the
// admin edit amounts — only advance the lifecycle — and every transition
// flips the linked CommissionTransaction rows in lockstep so the ledger
// and the payout request can never disagree.
// ============================================
const ALLOWED_TRANSITIONS = {
  processing: ["requested"],
  paid: ["requested", "processing"],
  rejected: ["requested", "processing"],
};

export const updatePayoutRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, paymentReferenceId } = req.body;

    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payout id" });
    }
    if (!["processing", "paid", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be 'processing', 'paid' or 'rejected'",
      });
    }
    if (status === "rejected" && !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required",
      });
    }
    if (status === "paid" && !paymentReferenceId?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "A payment reference (bank UTR / transaction id) is required to mark a payout as paid",
      });
    }

    const payout = await SellerPayout.findById(id);
    if (!payout) {
      return res
        .status(404)
        .json({ success: false, message: "Payout request not found" });
    }

    const allowedFrom = ALLOWED_TRANSITIONS[status] || [];
    if (!allowedFrom.includes(payout.status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot move a payout from "${payout.status}" to "${status}"`,
      });
    }

    const previousStatus = payout.status;
    payout.status = status;
    payout.processedAt = new Date();
    payout.processedBy = req.admin._id;
    if (status === "rejected") payout.rejectionReason = reason.trim();
    if (status === "paid")
      payout.paymentReferenceId = paymentReferenceId.trim();
    await payout.save();

    // Flip the linked ledger rows in lockstep.
    const linkedIds = payout.commissionTransactionIds || [];
    if (linkedIds.length > 0) {
      if (status === "paid") {
        await CommissionTransaction.updateMany(
          { _id: { $in: linkedIds } },
          {
            $set: {
              status: COMMISSION_TXN_STATUS.paid,
              paidAt: new Date(),
              referenceId: payout.paymentReferenceId,
            },
            $push: {
              statusHistory: {
                status: COMMISSION_TXN_STATUS.paid,
                previousStatus: COMMISSION_TXN_STATUS.processing,
                role: "super_admin",
                changedBy: req.admin._id,
                timestamp: new Date(),
              },
            },
          },
        );
      } else if (status === "rejected") {
        // Release these rows back to the payable pool.
        await CommissionTransaction.updateMany(
          { _id: { $in: linkedIds } },
          {
            $set: { status: COMMISSION_TXN_STATUS.eligible },
            $push: {
              statusHistory: {
                status: COMMISSION_TXN_STATUS.eligible,
                previousStatus: COMMISSION_TXN_STATUS.processing,
                role: "super_admin",
                changedBy: req.admin._id,
                reason: reason.trim(),
                timestamp: new Date(),
              },
            },
          },
        );
      }
      // status === "processing": rows are already "processing" from
      // request time — nothing to flip, this transition is purely
      // informational ("an admin has started working on this").
    }

    await logAudit({
      action: "PAYOUT_STATUS_CHANGE",
      entityType: "SellerPayout",
      entityId: payout._id,
      performedBy: req.admin._id,
      performedByRole: "super_admin",
      previousStatus,
      newStatus: status,
      reason: reason || null,
      metadata: { paymentReferenceId: payout.paymentReferenceId || null },
    });

    return res.status(200).json({
      success: true,
      message: `Payout marked as ${status}`,
      data: payout,
    });
  } catch (error) {
    console.error("❌ Update payout request status error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update payout status" });
  }
};
