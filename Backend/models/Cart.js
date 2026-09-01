// backend/models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    slug: { type: String },
    // ✅ NEW — snapshotted from JewelleryProduct.shortDescription at
    // add-to-cart time, same pattern already used for name/image/price/slug.
    // Not re-fetched live; if the seller edits the description later, the
    // cart keeps showing what was true when the item was added — consistent
    // with how price/name already behave here.
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    seller: { type: mongoose.Schema.Types.ObjectId },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Cart", cartSchema);
