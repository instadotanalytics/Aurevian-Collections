// Backend/routes/bannerRoutes.js

import express from 'express';
import {
  createBanner,
  getAllBanners,
  getActiveBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  updateBannerOrder,
  toggleBannerStatus
} from '../controllers/bannerController.js';
import { protectSuperAdmin } from '../middleware/superAdminAuth.js';
import upload, { handleMulterError } from '../middleware/upload.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/active', getActiveBanners);

// ============================================
// PROTECTED ROUTES (Super Admin only)
// ============================================
router.use(protectSuperAdmin);

// Create banner with image upload
router.post('/', upload.single('image'), handleMulterError, createBanner);

// Get all banners with filters
router.get('/', getAllBanners);

// Update banner order
router.put('/order', updateBannerOrder);

// Toggle banner status
router.patch('/:id/toggle', toggleBannerStatus);

// Get single banner
router.get('/:id', getBannerById);

// Update banner (with optional image upload)
router.put('/:id', upload.single('image'), handleMulterError, updateBanner);

// Delete banner
router.delete('/:id', deleteBanner);

export default router;