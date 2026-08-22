// backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JewelleryProduct",
      required: true,
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    name: String,
    image: String,
    slug: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const shippingSchema = new mongoose.Schema(
  {
    provider: { type: String, default: "shiprocket" },
    shiprocketOrderId: String,
    shipmentId: String,
    awbCode: String,
    courierName: String,
    courierId: String,
    trackingUrl: String,
    labelUrl: String,
    manifestUrl: String,
    status: String,
    statusCode: String,
    estimatedDeliveryDate: Date,
    pickupScheduledAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    paymentMethod: String,
    weight: Number,
    dimensions: { length: Number, breadth: Number, height: Number },
    returnShipmentId: String,
    returnStatus: String,
    lastError: String,
    lastSyncedAt: Date,
  },
  { _id: false },
);

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId },
    role: {
      type: String,
      enum: ["customer", "seller", "super_admin", "system"],
      required: true,
    },
    reason: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const FULFILLMENT_STATUSES = [
  "PENDING_SELLER_CONFIRMATION",
  "SELLER_CONFIRMED",
  "SELLER_REJECTED",
  "ADMIN_APPROVED",
  "ADMIN_REJECTED",
  "SHIPMENT_CREATED",
  "AWB_PENDING",
  "AWB_ASSIGNED",
  "READY_TO_SHIP",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RTO",
  "RETURN_INITIATED",
  "RETURNED",
  "CANCELLED",
  "SHIPROCKET_FAILED",
];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    // ✅ NEW — dedupe key for the create-order request itself (one per
    // checkout attempt on the client). Sparse+unique per-user so legacy
    // orders (no key) are completely unaffected.
    idempotencyKey: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    items: [orderItemSchema],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    // Existing convention preserved: "razorpay" | "cod"
    paymentMethod: { type: String, default: "razorpay" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpay: { orderId: String, paymentId: String, signature: String },

    orderStatus: {
      type: String,
      enum: [
        "placed",
        "processing",
        "ready_to_ship",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "rto",
        "return_initiated",
        "returned",
        "cancelled",
      ],
      default: "placed",
    },

    fulfillmentStatus: {
      type: String,
      enum: FULFILLMENT_STATUSES,
      default: "PENDING_SELLER_CONFIRMATION",
    },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },

    sellerConfirmedAt: Date,
    sellerConfirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    sellerRejectedAt: Date,
    sellerRejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    sellerRejectionReason: String,

    adminApprovedAt: Date,
    adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminRejectedAt: Date,
    adminRejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminRejectionReason: String,

    placedAt: { type: Date },
    shipping: { type: shippingSchema, default: () => ({}) },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, createdAt: -1 });
orderSchema.index({ seller: 1, fulfillmentStatus: 1, createdAt: -1 });
orderSchema.index({ fulfillmentStatus: 1, createdAt: -1 });
orderSchema.index({ "shipping.awbCode": 1 });
orderSchema.index({ "shipping.shiprocketOrderId": 1 });
// ✅ NEW — sparse+unique so only orders that actually set a key are
// constrained; legacy documents (idempotencyKey undefined) never collide.
orderSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, sparse: true },
);

export const FULFILLMENT_STATUS = Object.fromEntries(
  FULFILLMENT_STATUSES.map((s) => [s, s]),
);

export default mongoose.model("Order", orderSchema);
