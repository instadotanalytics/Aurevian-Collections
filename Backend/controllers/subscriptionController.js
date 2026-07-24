// backend/controllers/subscriptionController.js

import Subscription from "../models/Subscription.js";
import Seller from "../models/Seller.js";
import razorpayService from "../services/razorpayService.js";
import {
  SUBSCRIPTION_PLANS,
  PLAN_ORDER,
  getPlan,
  isValidPlan,
} from "../config/subscriptionPlans.js";

// ============================================
// 1. GET ALL PLANS (marks the seller's current plan)
// ============================================
export const getPlans = async (req, res) => {
  try {
    const currentPlanId = req.seller?.subscriptionPlanId || "free";

    const plans = PLAN_ORDER.map((id) => ({
      ...SUBSCRIPTION_PLANS[id],
      isCurrent: id === currentPlanId,
    }));

    return res.status(200).json({
      success: true,
      data: plans,
      currentPlanId,
    });
  } catch (error) {
    console.error("❌ Get plans error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get subscription plans",
      error: error.message,
    });
  }
};

// ============================================
// 2. GET CURRENT SUBSCRIPTION
// ============================================
export const getCurrentSubscription = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select(
      "subscriptionPlanId subscriptionStatus subscriptionStartedAt subscriptionExpiresAt sellerLevel isSuperSeller",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const lastOrder = await Subscription.getActiveForSeller(seller._id);
    const plan = getPlan(seller.subscriptionPlanId || "free");

    return res.status(200).json({
      success: true,
      data: {
        plan,
        subscriptionStatus: seller.subscriptionStatus,
        subscriptionStartedAt: seller.subscriptionStartedAt,
        subscriptionExpiresAt: seller.subscriptionExpiresAt,
        sellerLevel: seller.sellerLevel,
        isSuperSeller: seller.isSuperSeller,
        lastOrder,
      },
    });
  } catch (error) {
    console.error("❌ Get current subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get current subscription",
      error: error.message,
    });
  }
};

// ============================================
// 3. CREATE SUBSCRIPTION ORDER (Razorpay)
// ============================================
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !isValidPlan(planId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan selected" });
    }

    if (planId === "free") {
      return res.status(400).json({
        success: false,
        message: "The Free plan does not require payment",
      });
    }

    const plan = getPlan(planId);
    const seller = req.seller;

    if (
      seller.subscriptionPlanId === planId &&
      seller.subscriptionStatus === "active" &&
      seller.subscriptionExpiresAt &&
      new Date(seller.subscriptionExpiresAt) > new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: `You already have an active ${plan.name} plan`,
      });
    }

    const receipt = `sub_${seller._id}_${Date.now()}`.slice(0, 40);

    const orderResult = await razorpayService.createOrder({
      amount: plan.price,
      currency: "INR",
      receipt,
      notes: { sellerId: seller._id.toString(), planId },
    });

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to create payment order",
        error: orderResult.error,
      });
    }

    const subscription = await Subscription.create({
      seller: seller._id,
      planId,
      planName: plan.name,
      amount: plan.price,
      currency: "INR",
      status: "created",
      razorpayOrderId: orderResult.order.id,
      isMockPayment: !!orderResult.mock,
    });

    console.log(
      `📝 Subscription order created for seller ${seller._id}: ${plan.name} (${orderResult.mock ? "MOCK" : "LIVE"})`,
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        subscriptionId: subscription._id,
        orderId: orderResult.order.id,
        amount: plan.price,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || null,
        isMockPayment: !!orderResult.mock,
        plan,
      },
    });
  } catch (error) {
    console.error("❌ Create subscription order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription order",
      error: error.message,
    });
  }
};

// ============================================
// 4. VERIFY SUBSCRIPTION PAYMENT
// ============================================
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      subscriptionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!subscriptionId || !razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      seller: req.seller._id,
      razorpayOrderId,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription order not found" });
    }

    if (subscription.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order has already been verified",
      });
    }

    let verified = subscription.isMockPayment;

    if (!subscription.isMockPayment) {
      if (!razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: "Payment id and signature are required",
        });
      }
      verified = razorpayService.verifySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      });
    }

    if (!verified) {
      subscription.status = "failed";
      subscription.failureReason = "Signature verification failed";
      await subscription.save();
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    const plan = getPlan(subscription.planId);
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

    subscription.status = "paid";
    subscription.razorpayPaymentId =
      razorpayPaymentId || `mock_pay_${Date.now()}`;
    subscription.razorpaySignature = razorpaySignature || "mock_signature";
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();

    await Seller.findByIdAndUpdate(req.seller._id, {
      subscriptionPlanId: plan.id,
      sellerLevel: plan.sellerLevel,
      isSuperSeller: plan.isSuperSeller,
      subscriptionStatus: "active",
      subscriptionStartedAt: startDate,
      subscriptionExpiresAt: endDate,
      subscription: subscription._id,
    });

    console.log(
      `✅ Seller ${req.seller._id} upgraded to ${plan.name} until ${endDate.toISOString()}`,
    );

    return res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${plan.name} plan!`,
      data: { plan, startDate, endDate },
    });
  } catch (error) {
    console.error("❌ Verify subscription payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// ============================================
// 5. GET SUBSCRIPTION HISTORY
// ============================================
export const getSubscriptionHistory = async (req, res) => {
  try {
    const history = await Subscription.getHistoryForSeller(req.seller._id, 20);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("❌ Get subscription history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get subscription history",
      error: error.message,
    });
  }
};

// ============================================
// 6. CANCEL SUBSCRIPTION (immediate downgrade to Free)
// ============================================
export const cancelSubscription = async (req, res) => {
  try {
    const seller = req.seller;

    if (!seller.subscriptionPlanId || seller.subscriptionPlanId === "free") {
      return res
        .status(400)
        .json({ success: false, message: "You are already on the Free plan" });
    }

    // Mark any active paid subscription record as cancelled
    await Subscription.updateMany(
      { seller: seller._id, status: "paid", endDate: { $gt: new Date() } },
      { $set: { status: "cancelled" } },
    );

    // Immediately revert seller to Free plan and clear paid-plan benefits
    const freePlan = getPlan("free");
    await Seller.findByIdAndUpdate(seller._id, {
      subscriptionPlanId: "free",
      sellerLevel: freePlan.sellerLevel,
      isSuperSeller: freePlan.isSuperSeller,
      subscriptionStatus: "inactive",
      subscriptionStartedAt: null,
      subscriptionExpiresAt: null,
      subscription: null,
    });

    return res.status(200).json({
      success: true,
      message:
        "Your subscription has been cancelled. You've been moved to the Free plan.",
    });
  } catch (error) {
    console.error("❌ Cancel subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
    });
  }
};
