// backend/routes/sellerRoutes.js

import express from "express";
import multer from "multer";
import fs from "fs";
import rateLimit from "express-rate-limit";
import {
  registerSeller,
  verifyEmailOTP,
  verifyPhoneOTP,
  resendOTP,
  sellerLogin,
  getCurrentSeller,
  updateSellerProfile,
  updateSellerPickupAddress,
  retrySellerPickupSync,
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

import {
  getEarningsSummary,
  getEarningsChart,
  requestPayout,
  getPayoutHistory,
  getDashboardPerformance,
} from "../controllers/sellerEarningsController.js";

// ✅ NEW — seller's own read-only view of the commission ledger. All
// three handlers scope every query through req.seller._id internally, so
// a seller can never read another seller's financial data.
import {
  getMyPayoutSummary,
  getMyPayoutTransactions,
  getMyPayoutTransactionDetail,
} from "../controllers/sellerPayoutsController.js";

import {
  getCustomersSummary,
  getCustomers,
  getCustomerDetail,
} from "../controllers/sellerCustomersController.js";

const router = express.Router();

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

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

console.log("🔧 Setting up seller routes...");

router.post("/register", otpLimiter, registerSeller);
router.post("/verify-email", verifyEmailOTP);
router.post("/verify-phone", verifyPhoneOTP);
router.post("/resend-otp", otpLimiter, resendOTP);
router.post("/login", sellerLogin);
router.post("/refresh", refreshSellerToken);
router.post("/logout", sellerLogout);

router.post("/forgot-password", sellerForgotPassword);
router.post("/reset-password/:token", sellerResetPassword);

router.use(protectSeller);

router.get("/me", getCurrentSeller);
router.put("/profile", updateSellerProfile);

router.put("/pickup-address", updateSellerPickupAddress);
router.post("/pickup-address/retry-sync", retrySellerPickupSync);

router.get("/dashboard", getSellerDashboard);
router.get("/dashboard/performance", getDashboardPerformance);
router.get("/orders/recent", getRecentOrders);
router.get("/activities/recent", getRecentActivities);
router.get("/verification-status", getVerificationStatus);

// ---- Earnings/Payouts: summary cards, chart, and payout request flow ----
router.get("/earnings/summary", getEarningsSummary);
router.get("/earnings/chart", getEarningsChart);
router.post("/earnings/payout/request", requestPayout);
router.get("/earnings/payout/history", getPayoutHistory);

// ---- Earnings/Payouts: line-item ledger (search/filter/pagination/detail) ----
// ✅ NEW
router.get("/payouts/summary", getMyPayoutSummary);
router.get("/payouts/:id", getMyPayoutTransactionDetail);
router.get("/payouts", getMyPayoutTransactions);

router.get("/customers/summary", getCustomersSummary);
router.get("/customers", getCustomers);
router.get("/customers/:userId", getCustomerDetail);

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
console.log("  📌 GET    /api/seller/earnings/summary");
console.log("  📌 GET    /api/seller/earnings/chart");
console.log("  📌 POST   /api/seller/earnings/payout/request");
console.log("  📌 GET    /api/seller/earnings/payout/history");
console.log("  📌 GET    /api/seller/payouts/summary");
console.log("  📌 GET    /api/seller/payouts/:id");
console.log("  📌 GET    /api/seller/payouts");
console.log("  📌 GET    /api/seller/customers/summary");
console.log("  📌 GET    /api/seller/customers");
console.log("  📌 GET    /api/seller/customers/:userId");

export default router;
