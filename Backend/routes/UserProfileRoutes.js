// Backend/routes/userProfileRoutes.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileAvatar,
  deleteProfileAvatar,
  deleteUserAccount,
  getUserOrders,
  getUserWishlist,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserPreferences,
  changeUserPassword
} from '../controllers/userProfileController.js';

const router = express.Router();

// ============================================
// MULTER CONFIGURATION FOR AVATAR UPLOADS
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// ============================================
// ALL ROUTES ARE PROTECTED
// ============================================
router.use(protect);

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile
router.get('/user-profile/:userId', getUserProfile);

// Update user profile
router.put('/user-profile/:userId', updateUserProfile);

// Upload profile photo
router.post('/user-profile/:userId/avatar', upload.single('avatar'), uploadProfileAvatar);

// Delete profile photo
router.delete('/user-profile/:userId/avatar', deleteProfileAvatar);

// Delete user account
router.delete('/user-profile/:userId', deleteUserAccount);

// Get user orders
router.get('/user-profile/:userId/orders', getUserOrders);

// Get user wishlist
router.get('/user-profile/:userId/wishlist', getUserWishlist);

// Address routes
router.post('/user-profile/:userId/addresses', addUserAddress);
router.put('/user-profile/:userId/addresses/:addressId', updateUserAddress);
router.delete('/user-profile/:userId/addresses/:addressId', deleteUserAddress);

// Preferences
router.put('/user-profile/:userId/preferences', updateUserPreferences);

// Change password
router.put('/user-profile/:userId/change-password', changeUserPassword);

export default router;