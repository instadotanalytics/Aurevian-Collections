// backend/routes/sellerRoutes.js

import express from "express";
import multer from "multer";
import fs from "fs";
import {
  registerSeller,
  verifyEmailOTP,
  verifyPhoneOTP,
  resendOTP,
  sellerLogin,
  getCurrentSeller,
  updateSellerProfile,
  sellerLogout,
  refreshSellerToken,
  getSellerDashboard,
  getRecentOrders,
  getRecentActivities,
  uploadSellerDocuments,
  getVerificationStatus,
  sellerForgotPassword,
  sellerResetPassword,
} from "../controllers/sellerController.js";
import { protectSeller } from "../middleware/sellerAuth.js";

// ============================================
// EARNINGS CONTROLLER IMPORTS
// ============================================
import {
  getEarningsSummary,
  getEarningsChart,
  getEarningsTransactions,
  requestPayout,
  getPayoutHistory,
} from "../controllers/sellerEarningsController.js";

// ============================================
// CUSTOMERS CONTROLLER IMPORTS (ADDED)
// ============================================
import {
  getCustomersSummary,
  getCustomers,
  getCustomerDetail,
} from "../controllers/sellerCustomersController.js";

const router = express.Router();

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

console.log("🔧 Setting up seller routes...");

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================
router.post("/register", registerSeller);
router.post("/verify-email", verifyEmailOTP);
router.post("/verify-phone", verifyPhoneOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", sellerLogin);
router.post("/refresh", refreshSellerToken);
router.post("/logout", sellerLogout);

// ✅ ADD THESE ROUTES
router.post("/forgot-password", sellerForgotPassword);
router.post("/reset-password/:token", sellerResetPassword);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================
router.use(protectSeller);

router.get("/me", getCurrentSeller);
router.put("/profile", updateSellerProfile);

router.get("/dashboard", getSellerDashboard);
router.get("/orders/recent", getRecentOrders);
router.get("/activities/recent", getRecentActivities);
router.get("/verification-status", getVerificationStatus);

// ============================================
// EARNINGS ROUTES
// ============================================
router.get("/earnings/summary", getEarningsSummary);
router.get("/earnings/chart", getEarningsChart);
router.get("/earnings/transactions", getEarningsTransactions);
router.post("/earnings/payout/request", requestPayout);
router.get("/earnings/payout/history", getPayoutHistory);

// ============================================
// CUSTOMERS ROUTES (ADDED)
// NOTE: order matters — /customers/summary must be registered before
// /customers/:userId, otherwise Express would match "summary" as a
// :userId param and getCustomerDetail's ObjectId validation would 400 it.
// ============================================
router.get("/customers/summary", getCustomersSummary);
router.get("/customers", getCustomers);
router.get("/customers/:userId", getCustomerDetail);

// ============================================
// DOCUMENT UPLOAD ROUTES
// ============================================
router.post(
  "/upload-documents",
  upload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
    { name: "businessRegistrationCertificate", maxCount: 1 },
    { name: "tradeLicense", maxCount: 1 },
    { name: "cancelledCheque", maxCount: 1 },
    { name: "bankStatement", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
    { name: "idProofFront", maxCount: 1 },
    { name: "idProofBack", maxCount: 1 },
  ]),
  uploadSellerDocuments,
);

console.log("✅ Seller routes configured successfully");
console.log("  📌 POST   /api/seller/register");
console.log("  📌 POST   /api/seller/verify-email");
console.log("  📌 POST   /api/seller/verify-phone");
console.log("  📌 POST   /api/seller/resend-otp");
console.log("  📌 POST   /api/seller/login");
console.log("  📌 POST   /api/seller/forgot-password");
console.log("  📌 POST   /api/seller/reset-password/:token");
console.log("  📌 GET    /api/seller/me");
console.log("  📌 GET    /api/seller/dashboard");
console.log("  📌 POST   /api/seller/upload-documents");
console.log("  📌 GET    /api/seller/verification-status");
console.log("  📌 GET    /api/seller/earnings/summary");
console.log("  📌 GET    /api/seller/earnings/chart");
console.log("  📌 GET    /api/seller/earnings/transactions");
console.log("  📌 POST   /api/seller/earnings/payout/request");
console.log("  📌 GET    /api/seller/earnings/payout/history");
console.log("  📌 GET    /api/seller/customers/summary");
console.log("  📌 GET    /api/seller/customers");
console.log("  📌 GET    /api/seller/customers/:userId");

export default router;
