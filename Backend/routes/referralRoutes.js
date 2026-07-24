// backend/routes/referralRoutes.js

import express from "express";
import {
  validateReferralCode,
  applyReferralToOrder,
  createReferralCode,
  getReferralCodes,
  updateReferralCode,
  deleteReferralCode,
  getMyReferralCode,
  generateReferralCode,
  getReferralStats,
} from "../controllers/referralController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ✅ User routes (protected)
router.get("/my-code", protect, getMyReferralCode);
router.post("/generate", protect, generateReferralCode);
router.get("/my-stats", protect, getReferralStats);
router.post("/validate", protect, validateReferralCode);
router.post("/apply", protect, applyReferralToOrder);

// ✅ Admin routes
router.post("/admin/create", protect, admin, createReferralCode);
router.get("/admin/all", protect, admin, getReferralCodes);
router.put("/admin/:id", protect, admin, updateReferralCode);
router.delete("/admin/:id", protect, admin, deleteReferralCode);

export default router;