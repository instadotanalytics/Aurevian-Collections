// Backend/routes/authRoutes.js

import express from 'express';
import { 
  googleLogin,
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logout,
  getMe
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/google', googleLogin);
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// ============================================
// PROTECTED ROUTES
// ============================================
router.get('/me', protect, getMe);

export default router;