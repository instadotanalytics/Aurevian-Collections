import express from 'express';
import {
  createProduct,
  getSellerProducts,
  getProductBySlug,
  getProductCategories,
  updateProduct,
  deleteProduct,
  getProductLimitStatus,
  bulkUploadProducts,
} from '../controllers/jewelleryProductController.js';
import { protectSeller } from '../middleware/sellerAuth.js';
import upload, { handleMulterError } from '../middleware/upload.js';

console.log("🔧 Creating jewelleryProductRoutes router...");
const router = express.Router();
console.log("✅ jewelleryProductRoutes router created");

// ============================================
// ✅ TEST ROUTE - SABSE PEHLE (FOR DEBUG)
// ============================================
router.get('/test', (req, res) => {
  console.log("✅ /test route HIT!");
  res.json({
    success: true,
    message: "Product routes are working! 🎉",
    time: new Date().toISOString(),
    routes: {
      test: "/test",
      categories: "/categories",
      products: "/",
      limitStatus: "/limit-status",
      bulkUpload: "/bulk-upload",
      productBySlug: "/:slug",
      createProduct: "POST /",
      updateProduct: "PUT /:id",
      deleteProduct: "DELETE /:id",
    }
  });
});
console.log("  📌 /test route registered ✅");

// ============================================
// PUBLIC ROUTES - No auth required
// ============================================
router.get('/categories', (req, res, next) => {
  console.log("🔍 /categories route called");
  next();
}, getProductCategories);
console.log("  📌 /categories route registered ✅");

router.get('/:slug', (req, res, next) => {
  console.log("🔍 /:slug route called with slug:", req.params.slug);
  next();
}, getProductBySlug);
console.log("  📌 /:slug route registered ✅");

// ============================================
// ALL ROUTES BELOW REQUIRE SELLER AUTHENTICATION
// ============================================
console.log("🔧 Applying protectSeller middleware...");
router.use((req, res, next) => {
  console.log("🔑 Request received:", req.method, req.originalUrl);
  console.log("🔑 Authorization header:", req.headers.authorization || "❌ No auth header");
  next();
});
router.use(protectSeller);
console.log("  📌 protectSeller middleware applied ✅");

// ============================================
// PRODUCT LIMIT STATUS
// ============================================
router.get('/limit-status', (req, res, next) => {
  console.log("🔍 /limit-status route called");
  next();
}, getProductLimitStatus);
console.log("  📌 /limit-status route registered ✅");

// ============================================
// BULK UPLOAD (Silver+ Plans Only)
// ============================================
router.post('/bulk-upload', (req, res, next) => {
  console.log("🔍 /bulk-upload route called");
  next();
}, bulkUploadProducts);
console.log("  📌 /bulk-upload route registered ✅");

// ============================================
// CRUD OPERATIONS
// ============================================
router.post(
  '/',
  (req, res, next) => {
    console.log("🔍 POST / route called");
    console.log("📦 Request body:", req.body);
    next();
  },
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'variantImages', maxCount: 20 },
  ]),
  handleMulterError,
  createProduct
);
console.log("  📌 POST / route registered ✅");

router.get('/', (req, res, next) => {
  console.log("🔍 GET / route called");
  console.log("📊 Query params:", req.query);
  next();
}, getSellerProducts);
console.log("  📌 GET / route registered ✅");

router.put(
  '/:id',
  (req, res, next) => {
    console.log("🔍 PUT /:id route called with id:", req.params.id);
    next();
  },
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 15 },
    { name: 'variantImages', maxCount: 20 },
  ]),
  handleMulterError,
  updateProduct
);
console.log("  📌 PUT /:id route registered ✅");

router.delete('/:id', (req, res, next) => {
  console.log("🔍 DELETE /:id route called with id:", req.params.id);
  next();
}, deleteProduct);
console.log("  📌 DELETE /:id route registered ✅");

console.log("✅ jewelleryProductRoutes fully configured");
console.log("📌 Available routes in this router:");
console.log("  GET  /test");
console.log("  GET  /categories");
console.log("  GET  /:slug");
console.log("  GET  /limit-status");
console.log("  POST /bulk-upload");
console.log("  POST /");
console.log("  GET  /");
console.log("  PUT  /:id");
console.log("  DELETE /:id");

export default router;
console.log("✅ jewelleryProductRoutes exported");