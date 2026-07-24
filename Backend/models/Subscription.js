// backend/models/Subscription.js

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    planId: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number, // in paise
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "cancelled", "expired"],
      default: "created",
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    isMockPayment: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// INDEXES
// ============================================
subscriptionSchema.index({ seller: 1, status: 1 });
subscriptionSchema.index({ razorpayOrderId: 1 });

// ============================================
// STATICS
// ============================================
subscriptionSchema.statics.getActiveForSeller = function (sellerId) {
  return this.findOne({
    seller: sellerId,
    status: "paid",
    endDate: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

subscriptionSchema.statics.getHistoryForSeller = function (
  sellerId,
  limit = 20,
) {
  return this.find({ seller: sellerId }).sort({ createdAt: -1 }).limit(limit);
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
