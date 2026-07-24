// backend/models/ReferralCode.js

import mongoose from "mongoose";

const referralCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    referrerReward: {
      type: Number,
      required: true,
      min: 0,
      default: 50,
    },
    minCartValue: {
      type: Number,
      required: true,
      default: 500,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    maxUsesPerUser: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
        discountAmount: Number,
      },
    ],
    totalUses: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

referralCodeSchema.index({ code: 1 }, { unique: true });
referralCodeSchema.index({ referrerId: 1 });
referralCodeSchema.index({ isActive: 1, expiryDate: 1 });

referralCodeSchema.methods.isValidForUser = function (userId) {
  if (!this.isActive || this.isDeleted) {
    return { valid: false, message: "This referral code is inactive" };
  }

  if (new Date() > this.expiryDate) {
    return { valid: false, message: "This referral code has expired" };
  }

  if (this.referrerId.toString() === userId.toString()) {
    return { valid: false, message: "You cannot use your own referral code" };
  }

  if (this.maxUses && this.totalUses >= this.maxUses) {
    return { valid: false, message: "This referral code has reached its maximum uses" };
  }

  const userUsed = this.usedBy.some(
    (entry) => entry.userId.toString() === userId.toString()
  );
  if (userUsed) {
    return { valid: false, message: "You have already used this referral code" };
  }

  return { valid: true };
};

const ReferralCode = mongoose.model("ReferralCode", referralCodeSchema);
export default ReferralCode;