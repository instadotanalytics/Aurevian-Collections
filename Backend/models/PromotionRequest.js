// backend/models/PromotionRequest.js — NEW FILE

/**
 * A seller's request to place one of their own products in a gated
 * homepage section (Curated For You / New Collections). This is the
 * approval-workflow counterpart to FeaturedProduct — FeaturedProduct
 * stays the self-service join table for specially-made/trending-picks,
 * PromotionRequest is the reviewed pipeline for the two premium sections.
 *
 * Lifecycle:
 *   pending -> approved -> (computed "active" on the homepage while
 *              status === "approved" AND within [startDate,endDate] AND
 *              the seller's CURRENT plan still has homepagePromotion.enabled,
 *              unless keepActiveAfterPlanExpiry is set by an admin)
 *   pending -> rejected (rejectionReason required)
 *   approved -> removed (admin takedown, e.g. mid-flight policy violation)
 *
 * "expired" is not a status this document sets on a timer — expiry from a
 * lapsed subscription is evaluated lazily at read time (see
 * featuredProductController.getPublicFeaturedProducts), because the DB
 * status should reflect admin decisions, not a cron guess about "now".
 */
import mongoose from "mongoose";

export const GATED_SECTIONS = ["curated-for-you", "new-collections"];

const promotionRequestSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JewelleryProduct",
      required: true,
    },
    section: {
      type: String,
      enum: GATED_SECTIONS,
      required: true,
      index: true,
    },
    // Snapshot of the plan id the seller held at submission time — for
    // admin visibility/audit only. Live entitlement is ALWAYS re-derived
    // from the seller's current subscriptionPlanId, never trusted from here.
    planIdAtRequest: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "removed"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    // ✅ Admin override: keep this promotion live on the homepage even if
    // the seller's subscription later expires/downgrades. Off by default —
    // per spec, expiry removes premium entitlement unless explicitly allowed.
    keepActiveAfterPlanExpiry: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Prevents a seller from having two simultaneous pending/approved requests
// for the same product in the same section. A prior rejected/removed
// request does not block resubmission — this only guards live states.
promotionRequestSchema.index(
  { seller: 1, product: 1, section: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  },
);

promotionRequestSchema.index({ section: 1, status: 1, order: 1 });

const PromotionRequest = mongoose.model(
  "PromotionRequest",
  promotionRequestSchema,
);
export default PromotionRequest;
