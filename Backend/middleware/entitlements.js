// FILE: backend / middleware / entitlements.js;

// backend/middleware/entitlements.js — full file (checkPromotionLimit now scoped per-section)

/**
 * Backend-only entitlement gate. Never trusts localStorage, Redux, request
 * body, or JWT payload for plan/feature access — always re-derives the
 * seller's CURRENT plan from the database (via expireIfNeeded, which also
 * auto-downgrades an expired paid plan back to "free" as a side effect),
 * then checks that plan's entitlement fields.
 */
import { getPlan } from "../services/subscriptionPlanService.js";
import { expireIfNeeded } from "../controllers/subscriptionController.js";
import PromotionRequest from "../models/PromotionRequest.js";

// Maps a feature key to the entitlement shape on a Plan document.
// Add new keys here as new gated features are introduced — this is the
// single place feature->plan-field mapping lives, so no controller ever
// hardcodes "plan.id === 'gold'" style checks.
const FEATURE_MAP = {
  HOMEPAGE_PROMOTION: (plan) =>
    plan?.homepagePromotion || { enabled: false, limit: 0 },
};

/**
 * requireFeature("HOMEPAGE_PROMOTION") — use after protectSeller.
 * On success, attaches req.sellerPlan (the live Plan doc) and
 * req.sellerEntitlement (the resolved {enabled, limit} for this feature).
 */
export const requireFeature = (featureKey) => {
  const resolve = FEATURE_MAP[featureKey];
  if (!resolve) {
    throw new Error(`requireFeature: unknown feature key "${featureKey}"`);
  }

  return async (req, res, next) => {
    try {
      if (!req.seller) {
        return res.status(401).json({
          success: false,
          message: "Not authorized",
        });
      }

      // Re-checks/auto-expires the seller's subscription against the DB
      // before evaluating entitlement — this is what makes an expired
      // Gold subscription lose access even if the client still thinks
      // it's Gold.
      const seller = await expireIfNeeded(req.seller);
      req.seller = seller;

      const plan = await getPlan(seller.subscriptionPlanId || "free");
      if (!plan) {
        return res.status(403).json({
          success: false,
          code: "PLAN_NOT_FOUND",
          message:
            "Your current plan could not be verified. Please contact support.",
        });
      }

      const entitlement = resolve(plan);
      if (!entitlement?.enabled) {
        return res.status(403).json({
          success: false,
          code: "FEATURE_NOT_AVAILABLE",
          message: `Your current plan (${plan.name}) does not include homepage promotion. Upgrade to a plan that includes it.`,
        });
      }

      req.sellerPlan = plan;
      req.sellerEntitlement = entitlement;
      next();
    } catch (error) {
      console.error("❌ requireFeature error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify plan entitlement",
        error: error.message,
      });
    }
  };
};

/**
 * checkPromotionLimit — use AFTER requireFeature("HOMEPAGE_PROMOTION").
 * Enforces the plan's homepagePromotion.limit against the seller's current
 * count of pending+approved promotion requests.
 *
 * ✅ FIXED: this now scopes the count to req.body.section. Previously it
 * counted pending+approved requests across ALL gated sections combined,
 * while getSellerEntitlementSummary (what the seller UI actually displays
 * as "X of Y used") counts PER SECTION. That mismatch meant a seller could
 * see "0 of 10 used" on New Collections while sitting at their limit on
 * Curated For You, then get an unexplained 409 on submit. Each gated
 * section now gets its own independent pool of `limit` slots, matching
 * what the UI promises.
 *
 * limit === -1 means unlimited.
 */
export const checkPromotionLimit = async (req, res, next) => {
  try {
    const { section } = req.body;
    const limit = req.sellerEntitlement?.limit ?? 0;

    if (limit === -1) {
      return next();
    }

    // If section is missing/invalid at this point, don't block on a
    // meaningless combined count — let submitPromotionRequest's own
    // isValidGatedSection() check return the proper 400.
    if (!section) {
      return next();
    }

    const activeCount = await PromotionRequest.countDocuments({
      seller: req.seller._id,
      section,
      status: { $in: ["pending", "approved"] },
    });

    if (activeCount >= limit) {
      return res.status(409).json({
        success: false,
        code: "PROMOTION_LIMIT_REACHED",
        message: `You've reached your homepage promotion limit (${limit}) for the ${req.sellerPlan.name} plan in this section. Remove an existing promotion or upgrade for a higher limit.`,
      });
    }

    next();
  } catch (error) {
    console.error("❌ checkPromotionLimit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify promotion limit",
      error: error.message,
    });
  }
};
