// backend/services/razorpayService.js

import Razorpay from "razorpay";
import crypto from "crypto";

const isConfigured = !!(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

let instance = null;
if (isConfigured) {
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay service initialized");
} else {
  console.log(
    "⚠️  Razorpay keys not configured — subscription payments will run in MOCK mode (auto-approved). Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable real payments.",
  );
}

// ============================================
// CREATE ORDER
// ============================================
const createOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) => {
  if (!isConfigured) {
    return {
      success: true,
      mock: true,
      order: {
        id: `mock_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount,
        currency,
        receipt,
        status: "created",
      },
    };
  }

  try {
    const order = await instance.orders.create({
      amount,
      currency,
      receipt,
      notes,
      payment_capture: 1,
    });
    return { success: true, mock: false, order };
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error);
    return { success: false, error: error.message || "Order creation failed" };
  }
};

// ============================================
// VERIFY PAYMENT SIGNATURE
// ============================================
const verifySignature = ({ orderId, paymentId, signature }) => {
  if (!isConfigured) return true; // mock mode auto-verifies

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

export default {
  isConfigured,
  createOrder,
  verifySignature,
};
