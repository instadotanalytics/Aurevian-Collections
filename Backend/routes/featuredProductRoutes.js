// backend/routes/featuredProductRoutes.js

import express from "express";
import {
  getPublicFeaturedProducts,
  getFeaturedProductsAdmin,
  getAvailableProductsForFeaturing,
  addFeaturedProduct,
  removeFeaturedProduct,
  toggleFeaturedProductStatus,
  reorderFeaturedProducts,
  getSellerFeaturedProducts,
  getSellerAvailableProductsForFeaturing,
  addSellerFeaturedProduct,
  removeSellerFeaturedProduct,
  toggleSellerFeaturedProductStatus,
  reorderSellerFeaturedProducts,
} from "../controllers/featuredProductController.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";
import { protectSeller } from "../middleware/sellerAuth.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTE — Home Page reads from here
// ============================================
router.get("/:section", getPublicFeaturedProducts);

// ============================================
// SELLER ROUTES — Authenticated seller only
// ============================================
router.use("/seller", protectSeller);

// ✅ MOVED UP — specific literal routes must come before "/seller/:section"
router.get(
  "/seller/available-products",
  getSellerAvailableProductsForFeaturing,
);
router.post("/seller", addSellerFeaturedProduct);
router.patch("/seller/reorder", reorderSellerFeaturedProducts);

// ✅ Param route now comes after the literal ones above
router.get("/seller/:section", getSellerFeaturedProducts);
router.delete("/seller/:id", removeSellerFeaturedProduct);
router.patch("/seller/:id/status", toggleSellerFeaturedProductStatus);

// ============================================
// PROTECTED ROUTES (Super Admin only)
// ============================================
router.use(protectSuperAdmin);

router.get("/admin/available-products", getAvailableProductsForFeaturing);
router.patch("/admin/reorder", reorderFeaturedProducts);
router.get("/admin/:section", getFeaturedProductsAdmin);
router.post("/admin", addFeaturedProduct);
router.delete("/admin/:id", removeFeaturedProduct);
router.patch("/admin/:id/status", toggleFeaturedProductStatus);

export default router;
