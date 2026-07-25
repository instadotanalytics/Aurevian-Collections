// backend/models/SubscriptionPlan.js — full file (id is no longer enum-locked)

import mongoose from "mongoose";

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/; // e.g. "gold", "black-diamond"

const subscriptionPlanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => slugPattern.test(v),
        message:
          "Plan id must be lowercase letters/numbers with hyphens only (e.g. 'gold', 'black-diamond')",
      },
    },
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    icon: {
      type: String,
      default: "🟢",
    },
    price: {
      type: Number, // in paise
      required: true,
      min: 0,
    },
    priceDisplay: {
      type: String,
      required: true,
    },
    bestFor: {
      type: String,
      trim: true,
      default: "",
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String,
      default: null,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    settlementDays: {
      type: Number,
      required: true,
      min: 0,
    },
    productLimit: {
      type: Number, // -1 = unlimited
      required: true,
    },
    imagesPerProduct: {
      type: Number,
      required: true,
    },
    supportLevel: {
      type: String,
      default: "Email",
    },
    sellerLevel: {
      type: String,
      enum: ["basic", "pro", "business"],
      default: "basic",
    },
    isSuperSeller: {
      type: Boolean,
      default: false,
    },
    durationDays: {
      type: Number,
      required: true,
      default: 30,
    },
    features: {
      type: [String],
      default: [],
    },
    // ✅ Protects a small set of built-in plans (currently just "free") from
    // deletion/deactivation — everything else, including the original
    // silver/gold/platinum, can now be edited or removed like any custom plan.
    isSystemPlan: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
  },
  { timestamps: true },
);

subscriptionPlanSchema.statics.getActiveSorted = function () {
  return this.find({ isActive: true }).sort({ order: 1 });
};

subscriptionPlanSchema.statics.getAllSorted = function () {
  return this.find().sort({ order: 1 });
};

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema,
);
export default SubscriptionPlan;
