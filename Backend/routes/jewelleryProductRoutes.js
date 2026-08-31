// Backend/routes/jewelleryProductRoutes.js

import express from "express";
import {
  createProduct,
  getSellerProducts,
  getProductBySlug,
  getProductCategories,
  updateProduct,
  deleteProduct,
  getProductLimitStatus,
  bulkUploadProducts,
  getProductsByPlacement,
  getPlacementCounts,
  getRelevantProducts,
  searchProducts,
  // ❌ REMOVE these - they were removed from the controller
  // getProductsByCollection,
  // getProductsByCategory,
} from "../controllers/jewelleryProductController.js";
import { protectSeller } from "../middleware/sellerAuth.js";
import upload, { handleMulterError } from "../middleware/upload.js";

console.log("🔧 Creating jewelleryProductRoutes router...");
const router = express.Router();
console.log("✅ jewelleryProductRoutes router created");

// ============================================
// ✅ TEST ROUTE - SABSE PEHLE (FOR DEBUG)
// ============================================
router.get("/test", (req, res) => {
  console.log("✅ /test route HIT!");
  res.json({
    success: true,
    message: "Product routes are working! 🎉",
    time: new Date().toISOString(),
    routes: {
      test: "/test",
      categories: "/categories",
      search: "/search?q=",
      products: "/",
      limitStatus: "/limit-status",
      bulkUpload: "/bulk-upload",
      placements: "/placements/:placement",
      placementCounts: "/placements/counts",
      relevant: "/:productId/relevant",
      // ❌ Remove these routes too - they're not needed
      // collections: "/collections/:collectionSlug",
      // category: "/category/:categoryId",
      productBySlug: "/:slug",
      createProduct: "POST /",
      updateProduct: "PUT /:id",
      deleteProduct: "DELETE /:id",
    },
  });
});
console.log("  📌 /test route registered ✅");

// ============================================
// PUBLIC ROUTES - No auth required
// ============================================
router.get(
  "/categories",
  (req, res, next) => {
    console.log("🔍 /categories route called");
    next();
  },
  getProductCategories,
);
console.log("  📌 /categories route registered ✅");

// ============================================
// ✅ NEW: PUBLIC ROUTE - Product Search
// Two-segment-safe: "/search" is a literal single-segment path, so it
// must (and does) sit before the "/:slug" catch-all below, exactly
// like "/categories". Query params: q (required), page, limit,
// categoryId (optional), sort (optional — same values as
// /placements/:placement: price-low, price-high, newest, popular).
// ============================================
router.get(
  "/search",
  (req, res, next) => {
    console.log("🔍 /search route called with query:", req.query);
    next();
  },
  searchProducts,
);
console.log("  📌 /search route registered ✅ (public)");

// ============================================
// PUBLIC ROUTES - Storefront Pages
// ============================================
router.get(
  "/placements/:placement",
  (req, res, next) => {
    console.log(
      "🔍 /placements/:placement route called with:",
      req.params.placement,
    );
    next();
  },
  getProductsByPlacement,
);
console.log("  📌 /placements/:placement route registered ✅");

// ❌ REMOVE these routes - they were replaced by the extended getProductsByPlacement
// router.get(
//   "/collections/:collectionSlug",
//   (req, res, next) => {
//     console.log(
//       "🔍 /collections/:collectionSlug route called with:",
//       req.params.collectionSlug,
//     );
//     next();
//   },
//   getProductsByCollection,
// );
// console.log("  📌 /collections/:collectionSlug route registered ✅ (public)");

// router.get(
//   "/category/:categoryId",
//   (req, res, next) => {
//     console.log(
//       "🔍 /category/:categoryId route called with:",
//       req.params.categoryId,
//     );
//     next();
//   },
//   getProductsByCategory,
// );
// console.log("  📌 /category/:categoryId route registered ✅ (public)");

// ============================================
// ✅ NEW: PUBLIC ROUTE - Relevant Products ("You May Also Like")
// Two-segment path, so it can't collide with the single-segment
// "/:slug" catch-all below regardless of registration order — kept
// here with the other public routes for readability.
// ============================================
router.get(
  "/:productId/relevant",
  (req, res, next) => {
    console.log(
      "🔍 /:productId/relevant route called with productId:",
      req.params.productId,
    );
    next();
  },
  getRelevantProducts,
);
console.log("  📌 /:productId/relevant route registered ✅ (public)");

// ============================================
// ✅ FIXED: PROTECTED ROUTES — protectSeller applied PER ROUTE now,
// instead of via a blanket router.use(protectSeller). A blanket
// router.use() also silently protects any route registered after it,
// which is exactly what broke the public GET /:slug route below.
// ============================================

// PRODUCT LIMIT STATUS
router.get(
  "/limit-status",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 /limit-status route called");
    next();
  },
  getProductLimitStatus,
);
console.log("  📌 /limit-status route registered ✅");

// Placement counts for seller dashboard
router.get(
  "/placements/counts",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 /placements/counts route called");
    next();
  },
  getPlacementCounts,
);
console.log("  📌 /placements/counts route registered ✅");

// BULK UPLOAD (Silver+ Plans Only)
router.post(
  "/bulk-upload",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 /bulk-upload route called");
    next();
  },
  bulkUploadProducts,
);
console.log("  📌 /bulk-upload route registered ✅");

// CREATE PRODUCT
router.post(
  "/",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 POST / route called");
    console.log("📦 Request body:", req.body);
    next();
  },
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 15 },
    { name: "variantImages", maxCount: 20 },
  ]),
  handleMulterError,
  createProduct,
);
console.log("  📌 POST / route registered ✅");

// GET SELLER PRODUCTS
router.get(
  "/",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 GET / route called");
    console.log("📊 Query params:", req.query);
    next();
  },
  getSellerProducts,
);
console.log("  📌 GET / route registered ✅");

// UPDATE PRODUCT
router.put(
  "/:id",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 PUT /:id route called with id:", req.params.id);
    next();
  },
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 15 },
    { name: "variantImages", maxCount: 20 },
  ]),
  handleMulterError,
  updateProduct,
);
console.log("  📌 PUT /:id route registered ✅");

// DELETE PRODUCT
router.delete(
  "/:id",
  protectSeller,
  (req, res, next) => {
    console.log("🔍 DELETE /:id route called with id:", req.params.id);
    next();
  },
  deleteProduct,
);
console.log("  📌 DELETE /:id route registered ✅");

// ============================================
// PUBLIC ROUTES - Catch-all (MUST BE LAST!)
// No protectSeller here — this is the customer-facing storefront route.
// It's registered after /limit-status, /placements/counts, /search,
// etc. so those exact-path routes are matched first; only unmatched
// single-segment GETs fall through to this one.
// ============================================
router.get(
  "/:slug",
  (req, res, next) => {
    console.log("🔍 /:slug route called with slug:", req.params.slug);
    next();
  },
  getProductBySlug,
);
console.log("  📌 /:slug route registered ✅ (public, MUST BE LAST)");

console.log("✅ jewelleryProductRoutes fully configured");
console.log("📌 Available routes in this router (in order):");
console.log("  ✅ GET  /test (public)");
console.log("  ✅ GET  /categories (public)");
console.log("  ✅ GET  /search?q= (public)");
console.log("  ✅ GET  /placements/:placement (public)");
console.log("  ✅ GET  /:productId/relevant (public)");
console.log("  🔒 GET  /limit-status (protected)");
console.log("  🔒 GET  /placements/counts (protected)");
console.log("  🔒 POST /bulk-upload (protected)");
console.log("  🔒 POST / (protected)");
console.log("  🔒 GET  / (protected)");
console.log("  🔒 PUT  /:id (protected)");
console.log("  🔒 DELETE /:id (protected)");
console.log("  ✅ GET  /:slug (public - LAST!)");

export default router;
console.log("✅ jewelleryProductRoutes exported");
