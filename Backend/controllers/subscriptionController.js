// backend/controllers/subscriptionController.js — full updated file (plans now DB-backed)

import Subscription from "../models/Subscription.js";
import Seller from "../models/Seller.js";
import razorpayService from "../services/razorpayService.js";
import emailService from "../services/emailService.js";
import {
  getPlan,
  isValidPlan,
  getAllActivePlansSorted,
} from "../services/subscriptionPlanService.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MIN_PAYABLE_AMOUNT = 100; // ₹1 floor so Razorpay never sees a ₹0 order

// ============================================
// Auto-expire a seller's paid plan once endDate has passed.
// ============================================
const expireIfNeeded = async (seller) => {
  const isPaidPlan =
    seller.subscriptionPlanId && seller.subscriptionPlanId !== "free";
  const isExpired =
    seller.subscriptionExpiresAt &&
    new Date(seller.subscriptionExpiresAt).getTime() <= Date.now();

  if (!isPaidPlan || !isExpired) return seller;

  const freePlan = await getPlan("free");

  await Subscription.updateMany(
    { seller: seller._id, status: "paid", endDate: { $lte: new Date() } },
    { $set: { status: "expired" } },
  );

  await Seller.findByIdAndUpdate(seller._id, {
    subscriptionPlanId: "free",
    sellerLevel: freePlan?.sellerLevel || "basic",
    isSuperSeller: freePlan?.isSuperSeller || false,
    subscriptionStatus: "inactive",
    subscriptionStartedAt: null,
    subscriptionExpiresAt: null,
    subscription: null,
  });

  seller.subscriptionPlanId = "free";
  seller.subscriptionStatus = "inactive";
  seller.subscriptionStartedAt = null;
  seller.subscriptionExpiresAt = null;

  return seller;
};

// ============================================
// Prorated credit for the unused portion of the seller's current
// active plan, applied toward whatever they're switching to.
// ============================================
const calculateProratedCredit = async (activeSubscription) => {
  if (!activeSubscription || !activeSubscription.endDate) return 0;

  const remainingMs =
    new Date(activeSubscription.endDate).getTime() - Date.now();
  if (remainingMs <= 0) return 0;

  const currentPlan = await getPlan(activeSubscription.planId);
  if (!currentPlan || !currentPlan.durationDays) return 0;

  const remainingDays = remainingMs / MS_PER_DAY;
  const dailyRate = currentPlan.price / currentPlan.durationDays;
  const credit = Math.round(dailyRate * remainingDays);

  return Math.min(credit, currentPlan.price);
};

// ============================================
// 1. GET ALL PLANS (marks the seller's current plan) — DB-backed, admin-controlled
// ============================================
export const getPlans = async (req, res) => {
  try {
    let currentPlanId = "free";

    if (req.seller) {
      const seller = await expireIfNeeded(req.seller);
      currentPlanId = seller.subscriptionPlanId || "free";
    }

    const activePlans = await getAllActivePlansSorted();

    const plans = activePlans.map((plan) => ({
      ...plan,
      isCurrent: plan.id === currentPlanId,
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
    let seller = await Seller.findById(req.seller._id).select(
      "subscriptionPlanId subscriptionStatus subscriptionStartedAt subscriptionExpiresAt sellerLevel isSuperSeller",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    seller = await expireIfNeeded(seller);

    const lastOrder = await Subscription.getActiveForSeller(seller._id);

    // ✅ Fall back to "free" if the seller's assigned plan was deleted by an
    // admin after they subscribed — never send a null plan to the frontend.
    let plan = await getPlan(seller.subscriptionPlanId || "free");
    if (!plan) {
      console.warn(
        `⚠️ Seller ${seller._id} has subscriptionPlanId "${seller.subscriptionPlanId}" which no longer exists — falling back to free`,
      );
      plan = await getPlan("free");

      // Also self-heal the seller record so this doesn't keep happening
      await Seller.findByIdAndUpdate(seller._id, {
        subscriptionPlanId: "free",
        subscriptionStatus: "inactive",
        subscriptionStartedAt: null,
        subscriptionExpiresAt: null,
      });
      seller.subscriptionPlanId = "free";
      seller.subscriptionStatus = "inactive";
      seller.subscriptionStartedAt = null;
      seller.subscriptionExpiresAt = null;
    }

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
// 3. CREATE SUBSCRIPTION ORDER (Razorpay) — with proration
// ============================================
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId || !(await isValidPlan(planId))) {
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

    const plan = await getPlan(planId);
    if (!plan.isActive) {
      return res.status(400).json({
        success: false,
        message: `The ${plan.name} plan is currently unavailable`,
      });
    }

    let seller = await expireIfNeeded(req.seller);

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

    const activeSubscription = await Subscription.getActiveForSeller(
      seller._id,
    );
    const creditApplied = activeSubscription
      ? await calculateProratedCredit(activeSubscription)
      : 0;

    const payableAmount = Math.max(
      plan.price - creditApplied,
      MIN_PAYABLE_AMOUNT,
    );

    const receipt = `sub_${seller._id}_${Date.now()}`.slice(0, 40);

    const orderResult = await razorpayService.createOrder({
      amount: payableAmount,
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
      originalAmount: plan.price,
      creditApplied,
      previousPlanId: activeSubscription ? activeSubscription.planId : null,
      amount: payableAmount,
      currency: "INR",
      status: "created",
      razorpayOrderId: orderResult.order.id,
      isMockPayment: !!orderResult.mock,
    });

    console.log(
      `📝 Subscription order created for seller ${seller._id}: ${plan.name} (${orderResult.mock ? "MOCK" : "LIVE"})${creditApplied ? ` with ₹${(creditApplied / 100).toFixed(2)} credit applied` : ""}`,
    );

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        subscriptionId: subscription._id,
        orderId: orderResult.order.id,
        amount: payableAmount,
        originalAmount: plan.price,
        creditApplied,
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

    const plan = await getPlan(subscription.planId);
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

    await Subscription.updateMany(
      {
        seller: req.seller._id,
        status: "paid",
        _id: { $ne: subscription._id },
        endDate: { $gt: new Date() },
      },
      { $set: { status: "superseded" } },
    );

    const updatedSeller = await Seller.findByIdAndUpdate(
      req.seller._id,
      {
        subscriptionPlanId: plan.id,
        sellerLevel: plan.sellerLevel,
        isSuperSeller: plan.isSuperSeller,
        subscriptionStatus: "active",
        subscriptionStartedAt: startDate,
        subscriptionExpiresAt: endDate,
        subscription: subscription._id,
      },
      { new: true },
    ).select("email firstName lastName fullName");

    console.log(
      `✅ Seller ${req.seller._id} upgraded to ${plan.name} until ${endDate.toISOString()}`,
    );

    if (updatedSeller?.email) {
      emailService
        .sendSellerSubscriptionEmail(
          updatedSeller.email,
          updatedSeller.fullName || updatedSeller.firstName || "Seller",
          plan.name,
          endDate,
          `${process.env.CLIENT_URL}/seller/dashboard`,
        )
        .catch((err) =>
          console.error("❌ Subscription congrats email failed:", err.message),
        );
    }

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
// 6. CANCEL SUBSCRIPTION — disabled by design
// ============================================
export const cancelSubscription = async (req, res) => {
  return res.status(400).json({
    success: false,
    message:
      "Subscriptions can't be cancelled manually. Your plan stays active until it expires, then automatically moves to Free.",
  });
};
