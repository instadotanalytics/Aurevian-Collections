// backend/models/CommissionTransaction.js
//
// The single source of truth for "how much did this sale actually earn
// the seller, after platform commission." One document per (order,
// product) line item — NOT per order — so a multi-seller order is
// naturally split into one row per seller/product, each independently
// traceable.
//
// IMMUTABILITY RULE: once created, an original row's snapshot fields
// (productNameSnapshot, unitPriceSnapshot, quantity, grossAmount,
// commissionPercentSnapshot, commissionAmount, sellerNetAmount) are
// NEVER edited, even if the underlying product's price changes later,
// even on refund. Only `status`, `statusHistory`, `payoutReference`,
// `reversedQuantity`/`reversedAmount` (bookkeeping of how much of this
// row has since been clawed back) and the `*At` timestamps change over
// time. A refund/reversal is always a NEW row (see `reversalOf`) that
// references the original — the original is never deleted or rewritten,
// per the "never delete financial history" requirement.
//
// IDEMPOTENCY: the partial unique index below guarantees that the same
// (order, product) can only ever have ONE original ledger row, no matter
// how many times a payment webhook fires. Reversal rows are exempt (they
// intentionally reference the same order+product as their original).

import mongoose from "mongoose";

const COMMISSION_TXN_STATUSES = [
  "pending", // order paid, but not yet delivered — not payout-eligible yet
  "eligible", // order delivered — counts toward seller's available balance
  "processing", // included in a SellerPayout that's been requested/is being processed
  "paid", // the linked SellerPayout was marked paid by an admin
  "failed", // ledger creation encountered a data problem (e.g. no seller)
  "cancelled", // order/item was cancelled before ever becoming eligible
  "reversed", // reversal ADJUSTMENT row (negative amounts) OR a pending/eligible
  //            original that was voided before any payout occurred
  "refunded", // original row whose full quantity has been returned/refunded
];

export const COMMISSION_TXN_STATUS = Object.fromEntries(
  COMMISSION_TXN_STATUSES.map((s) => [s, s]),
);

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId },
    role: {
      type: String,
      enum: ["seller", "super_admin", "system"],
      required: true,
    },
    previousStatus: String,
    reason: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const commissionTransactionSchema = new mongoose.Schema(
  {
    // ---- Identity / relations ----
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JewelleryProduct",
      required: true,
      index: true,
    },
    // Snapshots — taken from order.items at ledger-creation time, which
    // are themselves already immutable snapshots on the Order document.
    // Never re-read from the live JewelleryProduct document.
    productNameSnapshot: { type: String, required: true },
    productImageSnapshot: String,

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    // Light customer reference for admin/seller display — deliberately
    // NOT storing email/phone here to avoid over-exposing PII in a
    // financial ledger a seller can browse.
    customerName: String,
    orderUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ---- Snapshot financials (immutable once written) ----
    unitPriceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    grossAmount: { type: Number, required: true }, // unitPriceSnapshot * quantity
    currency: { type: String, default: "INR" },

    commissionPercentSnapshot: { type: Number, required: true }, // e.g. 10
    commissionAmount: { type: Number, required: true },
    sellerNetAmount: { type: Number, required: true },

    paymentMethodSnapshot: { type: String, enum: ["razorpay", "cod"] },

    // ---- Lifecycle ----
    status: {
      type: String,
      enum: COMMISSION_TXN_STATUSES,
      default: "pending",
      index: true,
    },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },

    eligibleAt: Date,
    paidAt: Date,
    cancelledAt: Date,
    reversedAt: Date,
    refundedAt: Date,
    failedAt: Date,
    failureReason: String,

    // ---- Payout linkage ----
    payoutReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SellerPayout",
      default: null,
      index: true,
    },
    referenceId: { type: String, default: null }, // external payment reference, once a real payout provider exists

    // ---- Reversal / refund bookkeeping ----
    // Set ONLY on adjustment rows created to claw back an already-paid
    // amount — never set on an original row.
    reversalOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommissionTransaction",
    },
    returnRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnRequest",
      default: null,
    },
    reversalReason: String,
    // Cumulative bookkeeping on the ORIGINAL row only — how much of this
    // line item has since been reversed via one or more return requests.
    reversedQuantity: { type: Number, default: 0 },
    reversedAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Idempotency guard: only one ORIGINAL ledger row per (order, product).
// Reversal rows (reversalOf set) are exempt via the partial filter so a
// product can have its original + N reversal rows without collision.
commissionTransactionSchema.index(
  { order: 1, product: 1 },
  { unique: true, partialFilterExpression: { reversalOf: { $exists: false } } },
);

commissionTransactionSchema.index({ seller: 1, status: 1, createdAt: -1 });
commissionTransactionSchema.index({ status: 1, createdAt: -1 });
commissionTransactionSchema.index({ payoutReference: 1 });

export default mongoose.model(
  "CommissionTransaction",
  commissionTransactionSchema,
);
