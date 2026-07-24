// backend/config/subscriptionPlans.js

// ============================================
// SUBSCRIPTION PLAN DEFINITIONS
// price is stored in PAISE (smallest INR unit) for Razorpay.
// e.g. ₹499 => 49900
// productLimit: -1 means unlimited
// ============================================

export const SUBSCRIPTION_PLANS = {
  free: {
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
    durationDays: 36500, // effectively never expires
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
  silver: {
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
  gold: {
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
  platinum: {
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
};

export const PLAN_ORDER = ["free", "silver", "gold", "platinum"];

export const getPlan = (planId) => SUBSCRIPTION_PLANS[planId] || null;

export const isValidPlan = (planId) =>
  Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, planId);

export default SUBSCRIPTION_PLANS;
