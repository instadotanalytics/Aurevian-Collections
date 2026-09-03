// backend/routes/promotionRoutes.js — NEW FILE

import express from "express";
import {
  getPromotionGuidelines,
  getSellerEntitlementSummary,
  getSellerAvailableProductsForPromotion,
  submitPromotionRequest,
  getSellerPromotionRequests,
  cancelPromotionRequest,
  getPromotionRequestsAdmin,
  approvePromotionRequest,
  rejectPromotionRequest,
  removePromotionRequest,
} from "../controllers/promotionController.js";
import { protectSeller } from "../middleware/sellerAuth.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";
import {
  requireFeature,
  checkPromotionLimit,
} from "../middleware/entitlements.js";

const router = express.Router();

// ============================================
// PUBLIC — guideline copy for the seller UI
// ============================================
router.get("/guidelines", getPromotionGuidelines);

// ============================================
// SELLER ROUTES
// ============================================
router.use("/seller", protectSeller);

router.get("/seller/entitlements", getSellerEntitlementSummary);
router.get(
  "/seller/available-products",
  getSellerAvailableProductsForPromotion,
);
router.get("/seller", getSellerPromotionRequests);
router.post(
  "/seller",
  requireFeature("HOMEPAGE_PROMOTION"),
  checkPromotionLimit,
  submitPromotionRequest,
);
router.delete("/seller/:id", cancelPromotionRequest);

// ============================================
// ADMIN ROUTES
// ============================================
router.use("/admin", protectSuperAdmin);

router.get("/admin", getPromotionRequestsAdmin);
router.put("/admin/:id/approve", approvePromotionRequest);
router.put("/admin/:id/reject", rejectPromotionRequest);
router.put("/admin/:id/remove", removePromotionRequest);

console.log("✅ Promotion routes configured successfully");
console.log("  📌 GET    /api/promotions/guidelines");
console.log("  📌 GET    /api/promotions/seller/entitlements");
console.log("  📌 GET    /api/promotions/seller/available-products");
console.log("  📌 GET    /api/promotions/seller");
console.log("  📌 POST   /api/promotions/seller");
console.log("  📌 DELETE /api/promotions/seller/:id");
console.log("  📌 GET    /api/promotions/admin");
console.log("  📌 PUT    /api/promotions/admin/:id/approve");
console.log("  📌 PUT    /api/promotions/admin/:id/reject");
console.log("  📌 PUT    /api/promotions/admin/:id/remove");

export default router;
