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
// ✅ NEW: "Sellers & Products" admin view layer
import {
  getSellersWithProductCounts,
  getSellerProductStatsAdmin,
  getSellerProductsAdmin,
  getSellerProductDetailAdmin,
} from "../controllers/superAdminProductManagementController.js";
// ✅ NEW: Contact Messages admin view layer
import {
  getAllContacts,
  getContactDetail,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
// ✅ NEW: Franchise Enquiries admin view layer
import {
  getAllFranchises,
  getFranchiseDetail,
  updateFranchiseStatus,
  deleteFranchise,
} from "../controllers/franchiseController.js";
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
// ✅ NEW: SELLERS & PRODUCTS (admin view/management layer)
// Registered under the SAME protectSuperAdmin guard above — no separate
// auth needed. Product routes are scoped by seller.sellerId, so one seller
// can never see another seller's products through these endpoints either.
// ============================================
router.get("/sellers-products", getSellersWithProductCounts);
router.get("/sellers/:id/product-stats", getSellerProductStatsAdmin);
router.get("/sellers/:id/products", getSellerProductsAdmin);
router.get("/sellers/:id/products/:productId", getSellerProductDetailAdmin);

// ============================================
// ✅ NEW: CONTACT MESSAGES (from the public Contact page form)
// ============================================
router.get("/contacts", getAllContacts);
router.get("/contacts/:id", getContactDetail);
router.put("/contacts/:id/status", updateContactStatus);
router.delete("/contacts/:id", deleteContact);

// ============================================
// ✅ NEW: FRANCHISE ENQUIRIES (from the public Franchise page form)
// ============================================
router.get("/franchises", getAllFranchises);
router.get("/franchises/:id", getFranchiseDetail);
router.put("/franchises/:id/status", updateFranchiseStatus);
router.delete("/franchises/:id", deleteFranchise);

// ============================================
// PAYMENTS
// ============================================
router.get("/payments", getAllPayments);
router.get("/payments/stats", getPaymentStats);

export default router;