// Backend/routes/superAdminRoutes.js

import express from 'express';
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
  getSellerStats,
  deleteSeller
} from '../controllers/superAdminController.js';
import { protectSuperAdmin } from '../middleware/superAdminAuth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/login', superAdminLogin);
router.post('/refresh', refreshSuperAdminToken);

// ============================================
// PROTECTED ROUTES - Super Admin only
// ============================================
router.use(protectSuperAdmin);

// Profile Routes
router.get('/me', getCurrentSuperAdmin);
router.put('/profile', updateSuperAdminProfile);
router.put('/change-password', changeSuperAdminPassword);
router.post('/logout', superAdminLogout);

// ============================================
// SELLER MANAGEMENT ROUTES
// ============================================

// Get all seller requests with filters
router.get('/sellers', getAllSellerRequests);

// Get seller statistics
router.get('/sellers/stats', getSellerStats);

// Get single seller details
router.get('/sellers/:id', getSellerDetails);

// Seller status management
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject', rejectSeller);
router.put('/sellers/:id/suspend', suspendSeller);
router.put('/sellers/:id/unsuspend', unsuspendSeller);
router.delete('/sellers/:id', deleteSeller);

export default router;