// backend/models/ReturnRequest.js
import mongoose from "mongoose";

const RETURN_STATUSES = [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "RECEIVED",
  "REFUND_PROCESSING",
  "REFUNDED",
  "EXCHANGE_PROCESSING",
  "EXCHANGE_COMPLETED",
  "CANCELLED",
];

export const RETURN_STATUS = Object.fromEntries(
  RETURN_STATUSES.map((s) => [s, s]),
);

// Every status except REJECTED/CANCELLED blocks a new return request from
// being raised against the same order+product — those two free the item
// up again for a fresh request.
export const BLOCKING_RETURN_STATUSES = RETURN_STATUSES.filter(
  (s) => s !== "REJECTED" && s !== "CANCELLED",
);

export const RETURN_REASONS = [
  "Size / Fit Issue",
  "Changed My Mind",
  "Product Damaged",
  "Wrong Item Delivered",
  "Quality Not As Expected",
  "Product Not As Described",
  "Better Price Available Elsewhere",
  "Other",
];

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId },
    role: {
      type: String,
      enum: ["customer", "seller", "system"],
      required: true,
    },
    reason: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const shiprocketReturnSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "shiprocket" },
    shiprocketOrderId: String,
    shipmentId: String,
    awbCode: String,
    courierName: String,
    trackingUrl: String,
    syncStatus: {
      type: String,
      enum: ["not_synced", "pending", "synced", "failed"],
      default: "not_synced",
    },
    syncError: String,
    lastSyncAttemptAt: Date,
    syncedAt: Date,
  },
  { _id: false },
);

const returnImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const returnRequestSchema = new mongoose.Schema(
  {
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
    productName: { type: String, required: true },
    productImage: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Snapshotted from the order at request time — same convention Order
    // already uses for customerName/customerEmail/customerPhone, so the
    // seller panel never needs to populate the user document.
    customerName: String,
    customerEmail: String,
    customerPhone: String,

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    requestType: {
      type: String,
      enum: ["return", "exchange"],
      required: true,
    },
    reason: {
      type: String,
      enum: RETURN_REASONS,
      required: true,
    },
    customerNotes: { type: String, trim: true, maxlength: 1000, default: "" },
    images: { type: [returnImageSchema], default: [] },

    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },

    orderPlacedAt: Date,
    orderDeliveredAt: { type: Date, required: true },
    eligibleUntil: { type: Date, required: true },

    status: {
      type: String,
      enum: RETURN_STATUSES,
      default: "REQUESTED",
      index: true,
    },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },

    sellerDecisionAt: Date,
    sellerRejectionReason: String,

    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    shiprocketReturn: { type: shiprocketReturnSchema, default: () => ({}) },
  },
  { timestamps: true },
);

returnRequestSchema.index({ order: 1, product: 1, status: 1 });
returnRequestSchema.index({ seller: 1, status: 1, createdAt: -1 });
returnRequestSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("ReturnRequest", returnRequestSchema);
