import express from 'express';
import {
  superAdminLogin,
  getCurrentSuperAdmin,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
  superAdminLogout,
  refreshSuperAdminToken,
  getAllSuperAdmins,
} from '../controllers/superAdminController.js';
import { protectSuperAdmin } from '../middleware/superAdminAuth.js';

const router = express.Router();

// Public routes
router.post('/login', superAdminLogin);
router.post('/refresh', refreshSuperAdminToken);
router.post('/logout', superAdminLogout);

// Protected routes (Super Admin only)
router.get('/me', protectSuperAdmin, getCurrentSuperAdmin);
router.put('/profile', protectSuperAdmin, updateSuperAdminProfile);
router.put('/change-password', protectSuperAdmin, changeSuperAdminPassword);
router.get('/all', protectSuperAdmin, getAllSuperAdmins);

export default router;