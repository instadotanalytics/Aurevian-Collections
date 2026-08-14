// backend/models/SellerPayout.js
// Represents a seller's request for their available balance to be paid
// out. This does NOT move money — there's no payment-rail integration in
// this project yet. A "requested" record here means "a human needs to
// action this manually," not "payment sent." Never write status: "paid"
// except from a real admin action confirming the transfer happened.

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
