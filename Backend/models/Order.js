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

// ============================================
// ✅ NEW: SHIPPING SUBDOCUMENT (Shiprocket)
// ============================================
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
    status: String, // raw Shiprocket status text, latest known
    statusCode: String, // raw Shiprocket current_status_id, used for webhook idempotency
    estimatedDeliveryDate: Date,
    pickupScheduledAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    paymentMethod: String, // "Prepaid" | "COD" as sent to Shiprocket
    weight: Number, // kg, as computed/sent at shipment creation
    dimensions: {
      length: Number,
      breadth: Number,
      height: Number,
    },
    returnShipmentId: String,
    returnStatus: String,
    lastError: String, // ✅ NEW — real Shiprocket rejection reason, human-readable
    lastSyncedAt: Date,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    items: [orderItemSchema],
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
    paymentMethod: { type: String, default: "razorpay" }, // "razorpay" | "cod"
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "processing",
        "ready_to_ship", // ✅ NEW: pickup scheduled
        "shipped", // picked up by courier
        "in_transit", // ✅ NEW
        "out_for_delivery", // ✅ NEW
        "delivered",
        "rto", // ✅ NEW: return to origin
        "return_initiated", // ✅ NEW
        "returned", // ✅ NEW
        "cancelled",
      ],
      default: "placed",
    },
    placedAt: { type: Date },
    // ✅ NEW
    shipping: { type: shippingSchema, default: () => ({}) },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, createdAt: -1 });
orderSchema.index({ "shipping.awbCode": 1 });
orderSchema.index({ "shipping.shiprocketOrderId": 1 });

export default mongoose.model("Order", orderSchema);
