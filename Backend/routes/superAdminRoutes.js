// Backend/routes/superAdminRoutes.js

import express from "express";
import {
  superAdminLogin,
  getCurrentSuperAdmin,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
  superAdminLogout,
  refreshSuperAdminToken,
  getAllSellerRequests,
  getSellerDetails,
  approveSeller,
  rejectSeller,
  suspendSeller,
  unsuspendSeller,
  verifySellerKyc,
  getSellerStats,
  deleteSeller,
} from "../controllers/superAdminController.js";
import { protectSuperAdmin } from "../middleware/superAdminAuth.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.post("/login", superAdminLogin);
router.post("/refresh", refreshSuperAdminToken);

// ============================================
// PROTECTED ROUTES - All require authentication
// ============================================
router.use(protectSuperAdmin);

// ✅ ADD THIS - Verify token route
router.get("/verify-token", (req, res) => {
  console.log('✅ Token verified for admin:', req.admin._id);
  res.status(200).json({
    success: true,
    message: "Token is valid",
    admin: req.admin,
  });
});

router.get("/me", getCurrentSuperAdmin);
router.put("/profile", updateSuperAdminProfile);
router.put("/change-password", changeSuperAdminPassword);
router.post("/logout", superAdminLogout);

router.get("/sellers", getAllSellerRequests);
router.get("/sellers/stats", getSellerStats);
router.get("/sellers/:id", getSellerDetails);
router.put("/sellers/:id/approve", approveSeller);
router.put("/sellers/:id/reject", rejectSeller);
router.put("/sellers/:id/suspend", suspendSeller);
router.put("/sellers/:id/unsuspend", unsuspendSeller);
router.put("/sellers/:id/verify-kyc", verifySellerKyc);
router.delete("/sellers/:id", deleteSeller);

export default router;