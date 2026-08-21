// backend/models/FeaturedProduct.js

/**
 * Join table linking existing JewelleryProduct documents to a curated
 * homepage section. Never stores a copy of product data — only a
 * reference, an order, and an active flag. Removing an entry here only
 * removes the association; the underlying product is untouched.
 */
import mongoose from "mongoose";

// ✅ Updated: Added "curated-for-you" section
const FEATURED_SECTIONS = ["specially-made", "curated-for-you"];

const featuredProductSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: FEATURED_SECTIONS,
      required: true,
      default: "specially-made",
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JewelleryProduct",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    // ✅ NEW: Track which seller owns this featured product entry
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

// ✅ Prevents the same product being added to the same section twice.
featuredProductSchema.index({ section: 1, product: 1 }, { unique: true });
featuredProductSchema.index({ section: 1, order: 1 });

export { FEATURED_SECTIONS };

const FeaturedProduct = mongoose.model(
  "FeaturedProduct",
  featuredProductSchema,
);

export default FeaturedProduct;
