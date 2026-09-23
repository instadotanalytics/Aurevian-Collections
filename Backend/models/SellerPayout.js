// backend/models/SellerPayout.js
// Represents a seller's request for their available balance to be paid
// out. This does NOT move money — there's no payment-rail integration in
// this project yet. A "requested" record here means "a human needs to
// action this manually," not "payment sent." Never write status: "paid"
// except from a real admin action confirming the transfer happened.
//
// ✅ CHANGED — added commissionTransactionIds (links this payout to the
// exact CommissionTransaction ledger rows it covers, so marking a payout
// paid/rejected can flip those specific rows) and paymentReferenceId
// (free-text reference the admin records once a transfer is completed —
// e.g. a bank UTR number — kept generic so it works whether that
// reference comes from a manual bank transfer today or an automated
// RazorpayX/Stripe Connect payout later, without a schema change).

import mongoose from "mongoose";

const sellerPayoutSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["requested", "processing", "paid", "rejected"],
      default: "requested",
    },
    method: {
      type: { type: String, enum: ["bank_transfer", "upi"], required: true },
      accountHolderName: String,
      bankName: String,
      accountNumberMasked: String,
      ifscCode: String,
      upiId: String,
    },
    // ✅ NEW — the exact ledger rows this payout settles. Populated at
    // request time; used to flip those specific rows when the payout's
    // status changes (paid → those rows become "paid"; rejected → those
    // rows are released back to "eligible").
    commissionTransactionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "CommissionTransaction" },
    ],
    // ✅ NEW — generic settlement reference (bank UTR, UPI txn id, or a
    // future payout-provider's transaction id). Never fabricated —
    // only ever set by an admin action confirming a real transfer.
    paymentReferenceId: { type: String, default: null },

    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    rejectionReason: { type: String, default: null },
    adminNote: { type: String, default: null },
  },
  { timestamps: true },
);

sellerPayoutSchema.index({ seller: 1, status: 1, createdAt: -1 });

export default mongoose.model("SellerPayout", sellerPayoutSchema);
