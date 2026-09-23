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
  getAllPayments,
  getPaymentStats,
} from "../controllers/superAdminController.js";
import {
  getSellersWithProductCounts,
  getSellerProductStatsAdmin,
  getSellerProductsAdmin,
  getSellerProductDetailAdmin,
} from "../controllers/superAdminProductManagementController.js";
import {
  getAllContacts,
  getContactDetail,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
import {
  getAllFranchises,
  getFranchiseDetail,
  updateFranchiseStatus,
  deleteFranchise,
} from "../controllers/franchiseController.js";

// ✅ NEW — marketplace commission/payout ledger, admin side
import {
  getPlatformPayoutSummary,
  getAllPayoutTransactions,
  exportPayoutTransactions,
  getPayoutTransactionDetail,
  getPayoutRequests,
  updatePayoutRequestStatus,
} from "../controllers/adminPayoutController.js";

// ✅ NEW — the single 10% commission config, editable by super admin only
import {
  getPlatformSettings,
  updatePlatformSettings,
} from "../controllers/platformSettingsController.js";

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

router.get("/verify-token", (req, res) => {
  console.log("✅ Token verified for admin:", req.admin._id);
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

// ============================================
// SELLERS & PRODUCTS (admin view/management layer)
// ============================================
router.get("/sellers-products", getSellersWithProductCounts);
router.get("/sellers/:id/product-stats", getSellerProductStatsAdmin);
router.get("/sellers/:id/products", getSellerProductsAdmin);
router.get("/sellers/:id/products/:productId", getSellerProductDetailAdmin);

// ============================================
// CONTACT MESSAGES
// ============================================
router.get("/contacts", getAllContacts);
router.get("/contacts/:id", getContactDetail);
router.put("/contacts/:id/status", updateContactStatus);
router.delete("/contacts/:id", deleteContact);

// ============================================
// FRANCHISE ENQUIRIES
// ============================================
router.get("/franchises", getAllFranchises);
router.get("/franchises/:id", getFranchiseDetail);
router.put("/franchises/:id/status", updateFranchiseStatus);
router.delete("/franchises/:id", deleteFranchise);

// ============================================
// PAYMENTS (seller subscription payments — unrelated to order commission)
// ============================================
router.get("/payments", getAllPayments);
router.get("/payments/stats", getPaymentStats);

// ============================================
// ✅ NEW — MARKETPLACE PAYOUTS / SELLER EARNINGS / PLATFORM REVENUE
// Static sub-paths (summary, export, requests) are registered before the
// dynamic ":id" route so they can never be shadowed by it.
// ============================================
router.get("/payouts/summary", getPlatformPayoutSummary);
router.get("/payouts/export", exportPayoutTransactions);
router.get("/payouts/requests", getPayoutRequests);
router.patch("/payouts/requests/:id/status", updatePayoutRequestStatus);
router.get("/payouts/:id", getPayoutTransactionDetail);
router.get("/payouts", getAllPayoutTransactions);

// ============================================
// ✅ NEW — PLATFORM FINANCIAL SETTINGS (commission %, minimum payout)
// ============================================
router.get("/settings/platform", getPlatformSettings);
router.patch("/settings/platform", updatePlatformSettings);

export default router;
