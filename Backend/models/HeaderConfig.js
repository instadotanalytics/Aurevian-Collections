// backend/models/HeaderConfig.js

import mongoose from "mongoose";

const linkItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
  },
  { _id: false },
);

// ✅ NEW: categories carry an extra `image` field. This image is never
// rendered in the navbar dropdown — only the homepage "Shop by Category"
// section reads it. Store a plain hosted URL (Cloudinary, etc.).
const categoryItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const mainNavItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
    hasDropdown: { type: Boolean, default: false },
    hasMegaMenu: { type: Boolean, default: false },
  },
  { _id: false },
);

const megaBannerSchema = new mongoose.Schema(
  {
    tag: { type: String, default: "New Season" },
    title: { type: String, default: "" },
    offer: { type: String, default: "" },
    linkText: { type: String, default: "Shop the edit →" },
    linkPath: { type: String, default: "/" },
  },
  { _id: false },
);

const headerConfigSchema = new mongoose.Schema(
  {
    // Singleton lookup key — there's only ever one "active" config doc
    key: {
      type: String,
      default: "active",
      unique: true,
    },

    announcements: {
      type: [String],
      default: [],
    },

    mainNav: {
      type: [mainNavItemSchema],
      default: [],
    },

    shopMegaMenu: {
      // ✅ categories now use categoryItemSchema (adds `image`)
      categories: { type: [categoryItemSchema], default: [] },
      quickLinks: { type: [linkItemSchema], default: [] },
      byStyle: { type: [linkItemSchema], default: [] },
      fashionItems: { type: [linkItemSchema], default: [] },
      banner: { type: megaBannerSchema, default: () => ({}) },
    },

    giftGuideMegaMenu: {
      byRecipient: { type: [linkItemSchema], default: [] },
      byOccasion: { type: [linkItemSchema], default: [] },
      byBudget: { type: [linkItemSchema], default: [] },
    },

    collectionsDropdown: { type: [linkItemSchema], default: [] },
    offersDropdown: { type: [linkItemSchema], default: [] },
    aboutDropdown: { type: [linkItemSchema], default: [] },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
  },
  { timestamps: true },
);

const HeaderConfig = mongoose.model("HeaderConfig", headerConfigSchema);
export default HeaderConfig;
