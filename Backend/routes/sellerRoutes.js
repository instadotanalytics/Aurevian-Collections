// Backend/routes/sellerRoutes.js

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
  verifyPanCard,
  verifyAadhaarCard,
  getVerificationStatus,
} from "../controllers/sellerController.js";

import { protectSeller } from "../middleware/sellerAuth.js";

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
router.post("/resend-otp", resendOTP); // ✅ FIXED: now uses the real controller
router.post("/login", sellerLogin);
router.post("/refresh", refreshSellerToken);
router.post("/logout", sellerLogout);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================
router.use(protectSeller);

// Profile Routes
router.get("/me", getCurrentSeller);
router.put("/profile", updateSellerProfile);

// Dashboard Routes
router.get("/dashboard", getSellerDashboard);
router.get("/orders/recent", getRecentOrders);
router.get("/activities/recent", getRecentActivities);
router.get("/verification-status", getVerificationStatus);

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

// ============================================
// SUPER ADMIN ROUTES - Document Verification
// ============================================
router.put("/verify-pan/:sellerId", verifyPanCard);
router.put("/verify-aadhaar/:sellerId", verifyAadhaarCard);

console.log("✅ Seller routes configured successfully");
console.log("  📌 POST   /api/seller/register");
console.log("  📌 POST   /api/seller/verify-email");
console.log("  📌 POST   /api/seller/verify-phone");
console.log("  📌 POST   /api/seller/resend-otp");
console.log("  📌 POST   /api/seller/login");
console.log("  📌 GET    /api/seller/me");
console.log("  📌 GET    /api/seller/dashboard");

export default router;