// backend/services/subscriptionPlanService.js — full file (added homepagePromotion + backfill)

import SubscriptionPlan from "../models/SubscriptionPlan.js";

// ============================================
// Default seed data — used only to populate the DB on first boot,
// or to restore a plan an admin accidentally deleted. Prices in paise.
// ============================================
const DEFAULT_PLANS = [
  {
    id: "free",
    name: "FREE",
    icon: "🟢",
    price: 0,
    priceDisplay: "₹0",
    bestFor: "New sellers",
    isPopular: false,
    badge: null,
    commissionRate: 12,
    settlementDays: 7,
    productLimit: 50,
    imagesPerProduct: 5,
    supportLevel: "Email",
    sellerLevel: "basic",
    isSuperSeller: false,
    durationDays: 36500,
    order: 0,
    isActive: true,
    isSystemPlan: true, // ✅ added — protects Free from deletion
    homepagePromotion: { enabled: false, limit: 0 },
    features: [
      "50 Products",
      "Basic Dashboard",
      "Basic Store",
      "5 Images per Product",
      "7 Days Settlement",
      "12% Commission",
      "Basic Sales Report",
      "Customer Reviews",
      "Order Management",
    ],
  },
  {
    id: "silver",
    name: "SILVER",
    icon: "🩶",
    price: 49900,
    priceDisplay: "₹499",
    bestFor: "Growing sellers",
    isPopular: false,
    badge: "Silver Verified Badge",
    commissionRate: 10,
    settlementDays: 5,
    productLimit: 300,
    imagesPerProduct: 8,
    supportLevel: "Chat",
    sellerLevel: "basic",
    isSuperSeller: true,
    durationDays: 30,
    order: 1,
    isActive: true,
    homepagePromotion: { enabled: false, limit: 0 },
    features: [
      "300 Products",
      "Silver Verified Badge",
      "Better Search Ranking",
      "Premium Store Design",
      "8 Images per Product",
      "Product Video Upload",
      "Advanced Analytics",
      "5 Coupons per Month",
      "Festival Sale Access",
      "Chat Support",
      "10% Commission",
      "5 Days Settlement",
    ],
  },
  {
    id: "gold",
    name: "GOLD",
    icon: "🥇",
    price: 99900,
    priceDisplay: "₹999",
    bestFor: "Professional businesses",
    isPopular: true,
    badge: "⭐ Recommended",
    commissionRate: 8,
    settlementDays: 2,
    productLimit: 1000,
    imagesPerProduct: 10,
    supportLevel: "Phone",
    sellerLevel: "pro",
    isSuperSeller: true,
    durationDays: 30,
    order: 2,
    isActive: true,
    homepagePromotion: { enabled: true, limit: 10 },
    features: [
      "1000 Products",
      "Gold Verified Badge",
      "Homepage Featured Products",
      "360° Product Images",
      "Unlimited Coupons",
      "Sponsored Products",
      "Flash Sale Participation",
      "Push Notifications",
      "Email Marketing",
      "Advanced Reports",
      "8% Commission",
      "2 Days Settlement",
      "Phone Support",
    ],
  },
  {
    id: "platinum",
    name: "PLATINUM",
    icon: "💎",
    price: 199900,
    priceDisplay: "₹1999",
    bestFor: "Large brands",
    isPopular: false,
    badge: "Platinum Badge",
    commissionRate: 5,
    settlementDays: 1,
    productLimit: -1,
    imagesPerProduct: 15,
    supportLevel: "Premium",
    sellerLevel: "business",
    isSuperSeller: true,
    durationDays: 30,
    order: 3,
    isActive: true,
    homepagePromotion: { enabled: true, limit: -1 },
    features: [
      "Unlimited Products",
      "Platinum Badge",
      "Highest Search Ranking",
      "Homepage Featured Daily",
      "Custom Store Design",
      "15 Images + Unlimited Videos",
      "WhatsApp Marketing",
      "AI Sales Analytics",
      "Dedicated Account Manager",
      "API Access",
      "Early New Features",
      "5% Commission",
      "24-Hour Settlement",
      "Premium Customer Support",
    ],
  },
];

// ============================================
// Seed the 4 plans on server startup if the collection is empty
// (or if a specific plan slug is missing).
// ============================================
export const initializeDefaultPlans = async () => {
  try {
    for (const defaults of DEFAULT_PLANS) {
      const exists = await SubscriptionPlan.findOne({ id: defaults.id });
      if (!exists) {
        await SubscriptionPlan.create(defaults);
        console.log(`✅ Seeded subscription plan: ${defaults.name}`);
      }
    }
    await backfillHomepagePromotionEntitlements();
  } catch (error) {
    console.error("❌ Failed to seed subscription plans:", error.message);
  }
};

// ============================================
// ✅ NEW — One-time backfill for plans that existed in the DB before the
// homepagePromotion field was introduced. Only touches plans that don't
// already have an explicit value set, so it never overwrites an admin's
// own configuration on a later boot.
// ============================================
const backfillHomepagePromotionEntitlements = async () => {
  try {
    const defaultsById = new Map(DEFAULT_PLANS.map((p) => [p.id, p]));

    const plans = await SubscriptionPlan.find({
      $or: [
        { homepagePromotion: { $exists: false } },
        { homepagePromotion: null },
      ],
    });

    for (const plan of plans) {
      const fallback = defaultsById.get(plan.id)?.homepagePromotion || {
        enabled: false,
        limit: 0,
      };
      plan.homepagePromotion = fallback;
      await plan.save();
      console.log(
        `✅ Backfilled homepagePromotion for plan "${plan.id}":`,
        fallback,
      );
    }
  } catch (error) {
    console.error(
      "❌ Failed to backfill homepagePromotion entitlements:",
      error.message,
    );
  }
};

// ============================================
// Read helpers — used by the seller-facing subscription flow
// ============================================
export const getPlan = async (planId) => {
  if (!planId) return null;
  const plan = await SubscriptionPlan.findOne({ id: planId }).lean();
  return plan;
};

export const isValidPlan = async (planId) => {
  const plan = await SubscriptionPlan.findOne({ id: planId }).select("_id");
  return !!plan;
};

export const getAllActivePlansSorted = async () => {
  return SubscriptionPlan.getActiveSorted().lean();
};

export const getAllPlansSorted = async () => {
  return SubscriptionPlan.getAllSorted().lean();
};

export const PLAN_IDS = SubscriptionPlan.PLAN_IDS;
