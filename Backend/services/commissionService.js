// backend/services/commissionService.js
//
// THE single place that:
//   1. Creates commission ledger rows when an order becomes paid.
//   2. Advances them to "eligible" when the order is delivered.
//   3. Reverses them (whole-order or partial-item) when a
//      cancellation/return/refund happens.
//   4. Computes seller-facing and platform-facing summaries.
//
// Nothing outside this file ever computes a commission percentage or
// writes to CommissionTransaction directly — that's what keeps the 10%
// calculation from being duplicated (and potentially drifting) across
// controllers.

import mongoose from "mongoose";
import CommissionTransaction, {
  COMMISSION_TXN_STATUS,
} from "../models/CommissionTransaction.js";
import PlatformSettings from "../models/PlatformSettings.js";
import { calculateCommissionSplit } from "../utils/money.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ============================================
// CREATE — called once an order's paymentStatus becomes "paid".
// Idempotent: safe to call multiple times for the same order (e.g. a
// duplicate payment webhook, or being called again at delivery time to
// "make sure" entries exist) — the partial-unique index on
// (order, product) guarantees only one original row per line item ever
// gets created; repeat calls are no-ops for items that already exist.
// ============================================
export async function createLedgerEntriesForOrder(order) {
  if (!order || !Array.isArray(order.items) || order.items.length === 0) {
    return { created: 0, skipped: 0 };
  }

  const settings = await PlatformSettings.getSettings();
  const commissionPercent = settings.commissionPercent;

  let created = 0;
  let skipped = 0;

  for (const item of order.items) {
    if (!item.seller) {
      // No seller on this line item — can't attribute earnings. Skip
      // rather than guess; this matches the order controller's own
      // existing behavior of never fabricating a seller reference.
      skipped++;
      continue;
    }

    const split = calculateCommissionSplit(item.subtotal, commissionPercent);

    const doc = {
      order: order._id,
      orderNumber: order.orderNumber,
      product: item.product,
      productNameSnapshot: item.name || "Product",
      productImageSnapshot: item.image || "",
      seller: item.seller,
      customerName: order.customerName,
      orderUser: order.user,
      unitPriceSnapshot: item.price,
      quantity: item.quantity,
      grossAmount: split.grossAmount,
      currency: "INR",
      commissionPercentSnapshot: commissionPercent,
      commissionAmount: split.commissionAmount,
      sellerNetAmount: split.sellerNetAmount,
      paymentMethodSnapshot: order.paymentMethod,
      status: COMMISSION_TXN_STATUS.pending,
      statusHistory: [
        {
          status: COMMISSION_TXN_STATUS.pending,
          role: "system",
          timestamp: new Date(),
        },
      ],
    };

    try {
      const result = await CommissionTransaction.findOneAndUpdate(
        {
          order: order._id,
          product: item.product,
          reversalOf: { $exists: false },
        },
        { $setOnInsert: doc },
        { upsert: true, new: true, rawResult: true },
      );
      if (result?.lastErrorObject?.updatedExisting) {
        skipped++;
      } else {
        created++;
      }
    } catch (error) {
      // A race on the unique index also lands here — treat as "already
      // exists," never let this bubble up into the payment flow.
      console.error(
        `⚠️ Commission ledger upsert failed for order ${order.orderNumber}, product ${item.product}:`,
        error.message,
      );
      skipped++;
    }
  }

  return { created, skipped };
}

// ============================================
// ADVANCE — order delivered, so its ledger rows become payout-eligible.
// ============================================
export async function markOrderTransactionsEligible(orderId) {
  const rows = await CommissionTransaction.find({
    order: orderId,
    status: COMMISSION_TXN_STATUS.pending,
    reversalOf: { $exists: false },
  });

  for (const row of rows) {
    row.status = COMMISSION_TXN_STATUS.eligible;
    row.eligibleAt = new Date();
    row.statusHistory.push({
      status: COMMISSION_TXN_STATUS.eligible,
      previousStatus: COMMISSION_TXN_STATUS.pending,
      role: "system",
      timestamp: new Date(),
    });
    await row.save();
  }

  return { advanced: rows.length };
}

// ============================================
// REVERSE (whole order) — cancellation / return / rto at the order
// level. For rows that never got paid out, simply void them in place
// (nothing to claw back). For rows already processing/paid, create a
// negative adjustment row instead of touching the original — the
// original stays exactly as it was the day it was created.
// ============================================
export async function reverseOrderTransactions(order, { reason, changedBy }) {
  const rows = await CommissionTransaction.find({
    order: order._id,
    reversalOf: { $exists: false },
  });

  let voided = 0;
  let adjusted = 0;

  for (const row of rows) {
    if (
      [
        COMMISSION_TXN_STATUS.cancelled,
        COMMISSION_TXN_STATUS.reversed,
        COMMISSION_TXN_STATUS.refunded,
      ].includes(row.status)
    ) {
      continue; // already handled — idempotent against repeat status transitions
    }

    if (
      row.status === COMMISSION_TXN_STATUS.pending ||
      row.status === COMMISSION_TXN_STATUS.eligible ||
      row.status === COMMISSION_TXN_STATUS.failed
    ) {
      const previousStatus = row.status;
      row.status = COMMISSION_TXN_STATUS.cancelled;
      row.cancelledAt = new Date();
      row.statusHistory.push({
        status: COMMISSION_TXN_STATUS.cancelled,
        previousStatus,
        role: "system",
        changedBy,
        reason,
        timestamp: new Date(),
      });
      await row.save();
      voided++;
      continue;
    }

    // status is 'processing' or 'paid' — money has already moved through
    // the payout pipeline (or is queued to). Never mutate the original;
    // record a negative adjustment instead.
    const alreadyReversed = await CommissionTransaction.findOne({
      reversalOf: row._id,
    });
    if (alreadyReversed) continue; // idempotent — don't double-reverse

    await CommissionTransaction.create({
      order: row.order,
      orderNumber: row.orderNumber,
      product: row.product,
      productNameSnapshot: row.productNameSnapshot,
      productImageSnapshot: row.productImageSnapshot,
      seller: row.seller,
      customerName: row.customerName,
      orderUser: row.orderUser,
      unitPriceSnapshot: row.unitPriceSnapshot,
      quantity: row.quantity,
      grossAmount: -row.grossAmount,
      currency: row.currency,
      commissionPercentSnapshot: row.commissionPercentSnapshot,
      commissionAmount: -row.commissionAmount,
      sellerNetAmount: -row.sellerNetAmount,
      paymentMethodSnapshot: row.paymentMethodSnapshot,
      status: COMMISSION_TXN_STATUS.reversed,
      reversalOf: row._id,
      reversalReason: reason,
      statusHistory: [
        {
          status: COMMISSION_TXN_STATUS.reversed,
          role: "system",
          changedBy,
          reason,
          timestamp: new Date(),
        },
      ],
    });
    adjusted++;
  }

  return { voided, adjusted };
}

// ============================================
// REVERSE (single item, possibly partial quantity) — triggered by an
// approved+refunded ReturnRequest. Uses the ORIGINAL row's locked-in
// commissionPercentSnapshot, never today's PlatformSettings value, so a
// later commission-rate change never alters a historical refund's math.
// ============================================
export async function reverseOrderItemPartial({
  order,
  productId,
  quantity,
  returnRequest,
  reason,
  changedBy,
}) {
  const original = await CommissionTransaction.findOne({
    order: order._id,
    product: productId,
    reversalOf: { $exists: false },
  });

  if (!original) {
    // No ledger row exists yet (e.g. order was never marked paid/
    // delivered) — nothing to reverse. Not an error.
    return { reversed: false, reason: "no_ledger_entry" };
  }

  const remainingQty = original.quantity - (original.reversedQuantity || 0);
  const reverseQty = Math.min(quantity, remainingQty);
  if (reverseQty <= 0) {
    return { reversed: false, reason: "already_fully_reversed" };
  }

  // Exact math from the locked-in unit price, not a proportional
  // rounding of the (already-rounded) gross total.
  const reverseGross = original.unitPriceSnapshot * reverseQty;
  const split = calculateCommissionSplit(
    reverseGross,
    original.commissionPercentSnapshot,
  );

  const reversalRow = await CommissionTransaction.create({
    order: original.order,
    orderNumber: original.orderNumber,
    product: original.product,
    productNameSnapshot: original.productNameSnapshot,
    productImageSnapshot: original.productImageSnapshot,
    seller: original.seller,
    customerName: original.customerName,
    orderUser: original.orderUser,
    unitPriceSnapshot: original.unitPriceSnapshot,
    quantity: reverseQty,
    grossAmount: -split.grossAmount,
    currency: original.currency,
    commissionPercentSnapshot: original.commissionPercentSnapshot,
    commissionAmount: -split.commissionAmount,
    sellerNetAmount: -split.sellerNetAmount,
    paymentMethodSnapshot: original.paymentMethodSnapshot,
    status: COMMISSION_TXN_STATUS.reversed,
    reversalOf: original._id,
    returnRequest: returnRequest?._id || null,
    reversalReason: reason,
    statusHistory: [
      {
        status: COMMISSION_TXN_STATUS.reversed,
        role: "system",
        changedBy,
        reason,
        timestamp: new Date(),
      },
    ],
  });

  original.reversedQuantity = (original.reversedQuantity || 0) + reverseQty;
  original.reversedAmount = (original.reversedAmount || 0) + split.grossAmount;

  const fullyReversed = original.reversedQuantity >= original.quantity;
  if (
    fullyReversed &&
    original.status !== COMMISSION_TXN_STATUS.paid &&
    original.status !== COMMISSION_TXN_STATUS.processing
  ) {
    // Not yet paid out — safe to remove it from the payable pool
    // entirely by marking it refunded. If it's already paid/processing,
    // we deliberately leave its status untouched (historical record of
    // what was actually paid) — the negative reversalRow above is what
    // reflects the clawback.
    const previousStatus = original.status;
    original.status = COMMISSION_TXN_STATUS.refunded;
    original.refundedAt = new Date();
    original.statusHistory.push({
      status: COMMISSION_TXN_STATUS.refunded,
      previousStatus,
      role: "system",
      changedBy,
      reason,
      timestamp: new Date(),
    });
  }

  await original.save();

  return { reversed: true, reversalRow, fullyReversed };
}

// ============================================
// SUMMARY — seller-facing balance breakdown, ALWAYS the source of truth
// for "how much can this seller be paid right now."
// ============================================
export async function getSellerPayoutSummary(sellerId) {
  const sellerOid = toObjectId(sellerId);

  const agg = await CommissionTransaction.aggregate([
    { $match: { seller: sellerOid } },
    {
      $group: {
        _id: "$status",
        gross: { $sum: "$grossAmount" },
        commission: { $sum: "$commissionAmount" },
        net: { $sum: "$sellerNetAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const byStatus = Object.fromEntries(agg.map((a) => [a._id, a]));
  const bucket = (status) =>
    byStatus[status] || { gross: 0, commission: 0, net: 0, count: 0 };

  const pending = bucket(COMMISSION_TXN_STATUS.pending);
  const eligible = bucket(COMMISSION_TXN_STATUS.eligible);
  const processing = bucket(COMMISSION_TXN_STATUS.processing);
  const paid = bucket(COMMISSION_TXN_STATUS.paid);
  const reversed = bucket(COMMISSION_TXN_STATUS.reversed);
  const refunded = bucket(COMMISSION_TXN_STATUS.refunded);
  const cancelled = bucket(COMMISSION_TXN_STATUS.cancelled);

  const totalGrossSales =
    pending.gross + eligible.gross + processing.gross + paid.gross;
  const totalCommission =
    pending.commission +
    eligible.commission +
    processing.commission +
    paid.commission;
  const totalNetEarnings =
    pending.net + eligible.net + processing.net + paid.net;

  return {
    totalGrossSales,
    totalCommission,
    totalNetEarnings,
    availableBalance: eligible.net, // payout-eligible right now
    pendingBalance: pending.net, // not delivered yet
    processingBalance: processing.net, // requested, awaiting admin action
    paidOut: paid.net,
    reversedAmount: reversed.net + refunded.net, // negative-signed adjustments + voided
    cancelledAmount: cancelled.net,
    transactionCount:
      pending.count +
      eligible.count +
      processing.count +
      paid.count +
      reversed.count +
      refunded.count +
      cancelled.count,
  };
}

// ============================================
// SUMMARY — platform-wide, for the super admin dashboard.
// ============================================
export async function getPlatformSummary({ from, to } = {}) {
  const match = {};
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = from;
    if (to) match.createdAt.$lte = to;
  }

  const agg = await CommissionTransaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        gross: { $sum: "$grossAmount" },
        commission: { $sum: "$commissionAmount" },
        net: { $sum: "$sellerNetAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const byStatus = Object.fromEntries(agg.map((a) => [a._id, a]));
  const bucket = (status) =>
    byStatus[status] || { gross: 0, commission: 0, net: 0, count: 0 };

  const pending = bucket(COMMISSION_TXN_STATUS.pending);
  const eligible = bucket(COMMISSION_TXN_STATUS.eligible);
  const processing = bucket(COMMISSION_TXN_STATUS.processing);
  const paid = bucket(COMMISSION_TXN_STATUS.paid);
  const reversed = bucket(COMMISSION_TXN_STATUS.reversed);
  const refunded = bucket(COMMISSION_TXN_STATUS.refunded);
  const cancelled = bucket(COMMISSION_TXN_STATUS.cancelled);
  const failed = bucket(COMMISSION_TXN_STATUS.failed);

  const totalGrossSales =
    pending.gross + eligible.gross + processing.gross + paid.gross;
  const totalPlatformCommission =
    pending.commission +
    eligible.commission +
    processing.commission +
    paid.commission;
  const totalSellerEarnings =
    pending.net + eligible.net + processing.net + paid.net;

  return {
    totalGrossSales,
    totalPlatformCommission,
    totalSellerEarnings,
    pendingSellerPayouts: eligible.net + processing.net,
    completedPayouts: paid.net,
    failedPayouts: failed.net,
    refundedOrReversedAmount: reversed.net + refunded.net,
    cancelledAmount: cancelled.net,
    numberOfTransactions:
      pending.count +
      eligible.count +
      processing.count +
      paid.count +
      reversed.count +
      refunded.count +
      cancelled.count +
      failed.count,
  };
}

export default {
  createLedgerEntriesForOrder,
  markOrderTransactionsEligible,
  reverseOrderTransactions,
  reverseOrderItemPartial,
  getSellerPayoutSummary,
  getPlatformSummary,
};
