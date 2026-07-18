// Backend/controllers/superAdminController.js

import Seller from '../models/Seller.js';
import SuperAdmin from '../models/SuperAdmin.js';
import emailService from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============================================
// SUPER ADMIN LOGIN
// ============================================
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const admin = await SuperAdmin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: admin._id, role: 'super_admin' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: admin._id, role: 'super_admin' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    admin.lastLogin = new Date();
    admin.refreshToken = refreshToken;
    admin.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await admin.save();

    // Set cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('superAdminToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        profileImage: admin.profileImage
      },
      token: accessToken
    });

  } catch (error) {
    console.error('❌ Super Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ============================================
// GET CURRENT SUPER ADMIN
// ============================================
export const getCurrentSuperAdmin = async (req, res) => {
  try {
    const admin = await SuperAdmin.findById(req.admin.id)
      .select('-password -refreshToken -refreshTokenExpiry');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('❌ Get current admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get admin',
      error: error.message
    });
  }
};

// ============================================
// UPDATE SUPER ADMIN PROFILE
// ============================================
export const updateSuperAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { firstName, lastName, phone, profileImage, preferences } = req.body;

    const admin = await SuperAdmin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (firstName || lastName) {
      admin.fullName = `${admin.firstName} ${admin.lastName}`.trim();
    }
    if (phone) admin.phone = phone;
    if (profileImage) admin.profileImage = profileImage;
    if (preferences) {
      admin.preferences = { ...admin.preferences, ...preferences };
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: admin
    });

  } catch (error) {
    console.error('❌ Update admin profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// ============================================
// CHANGE SUPER ADMIN PASSWORD
// ============================================
export const changeSuperAdminPassword = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const admin = await SuperAdmin.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    // Clear refresh tokens for security
    admin.refreshToken = undefined;
    admin.refreshTokenExpiry = undefined;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// ============================================
// SUPER ADMIN LOGOUT
// ============================================
export const superAdminLogout = async (req, res) => {
  try {
    const adminId = req.admin?.id;
    if (adminId) {
      await SuperAdmin.findByIdAndUpdate(adminId, {
        $unset: { refreshToken: 1, refreshTokenExpiry: 1 }
      });
    }

    res.clearCookie('superAdminToken', { path: '/' });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

// ============================================
// REFRESH SUPER ADMIN TOKEN
// ============================================
export const refreshSuperAdminToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.superAdminRefreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const admin = await SuperAdmin.findById(decoded.id);

    if (!admin || admin.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const accessToken = jwt.sign(
      { id: admin._id, role: 'super_admin' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    );

    const newRefreshToken = jwt.sign(
      { id: admin._id, role: 'super_admin' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    admin.refreshToken = newRefreshToken;
    admin.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await admin.save();

    res.cookie('superAdminToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    res.cookie('superAdminRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: accessToken
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
};

// ============================================
// GET ALL SELLER REQUESTS (For Super Admin)
// ============================================
export const getAllSellerRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { 'storeInfo.storeName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sellers, total] = await Promise.all([
      // ✅ FIXED: removed "-otp" — schema's select:false on otp.email.code /
      // otp.phone.code / expiresAt already excludes those nested fields
      // automatically. Explicitly excluding the parent "-otp" too caused a
      // MongoDB "Path collision" error (can't exclude a field and a nested
      // path under it at the same time).
      Seller.find(query)
        .select('-password -refreshToken -refreshTokenExpiry -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Seller.countDocuments(query)
    ]);

    // Get all stats
    const [totalSellers, pending, approved, rejected, suspended, underReview] = await Promise.all([
      Seller.countDocuments(),
      Seller.countDocuments({ status: 'pending' }),
      Seller.countDocuments({ status: 'approved' }),
      Seller.countDocuments({ status: 'rejected' }),
      Seller.countDocuments({ status: 'suspended' }),
      Seller.countDocuments({ status: 'under_review' })
    ]);

    const stats = {
      total: totalSellers,
      pending,
      approved,
      rejected,
      suspended,
      underReview
    };

    return res.status(200).json({
      success: true,
      data: sellers,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Get seller requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller requests',
      error: error.message
    });
  }
};

// ============================================
// GET SELLER DETAILS (For Super Admin)
// ============================================
export const getSellerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ FIXED: same "-otp" path collision fix as above
    const seller = await Seller.findById(id)
      .select('-password -refreshToken -refreshTokenExpiry -__v');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: seller
    });

  } catch (error) {
    console.error('❌ Get seller details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch seller details',
      error: error.message
    });
  }
};

// ============================================
// APPROVE SELLER
// ============================================
export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Seller already approved'
      });
    }

    // Update seller status
    seller.status = 'approved';
    seller.isVerified = true;
    seller.isActive = true;
    seller.approvedAt = new Date();
    seller.statusUpdatedBy = adminId;
    seller.statusUpdatedAt = new Date();
    seller.verification.kycStatus = 'verified';
    seller.verification.kycVerifiedAt = new Date();

    await seller.save();

    // Send approval email with login link
    const loginLink = `${process.env.CLIENT_URL}/seller/login`;
    await emailService.sendSellerApprovalEmail(
      seller.email,
      seller.firstName,
      seller.storeInfo.storeName,
      loginLink
    );

    // Add to stats
    seller.stats = seller.stats || {};
    await seller.save();

    return res.status(200).json({
      success: true,
      message: 'Seller approved successfully',
      data: seller
    });

  } catch (error) {
    console.error('❌ Approve seller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve seller',
      error: error.message
    });
  }
};

// ============================================
// REJECT SELLER
// ============================================
export const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason'
      });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Seller already rejected'
      });
    }

    // Update seller status
    seller.status = 'rejected';
    seller.isVerified = false;
    seller.isActive = false;
    seller.rejectedAt = new Date();
    seller.rejectedReason = reason;
    seller.statusUpdatedBy = adminId;
    seller.statusUpdatedAt = new Date();
    seller.verification.kycStatus = 'rejected';
    seller.verification.kycRejectedAt = new Date();
    seller.verification.kycRejectionReason = reason;

    await seller.save();

    // Send rejection email
    await emailService.sendSellerRejectionEmail(
      seller.email,
      seller.firstName,
      seller.storeInfo.storeName,
      reason
    );

    return res.status(200).json({
      success: true,
      message: 'Seller rejected successfully',
      data: seller
    });

  } catch (error) {
    console.error('❌ Reject seller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject seller',
      error: error.message
    });
  }
};

// ============================================
// SUSPEND SELLER
// ============================================
export const suspendSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, suspendedUntil } = req.body;
    const adminId = req.admin.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a suspension reason'
      });
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Seller already suspended'
      });
    }

    // Update seller status
    seller.status = 'suspended';
    seller.isActive = false;
    seller.suspendedAt = new Date();
    seller.suspendedReason = reason;
    seller.suspendedUntil = suspendedUntil ? new Date(suspendedUntil) : null;
    seller.statusUpdatedBy = adminId;
    seller.statusUpdatedAt = new Date();

    await seller.save();

    // Send suspension email
    await emailService.sendSellerSuspensionEmail(
      seller.email,
      seller.firstName,
      seller.storeInfo.storeName,
      reason
    );

    return res.status(200).json({
      success: true,
      message: 'Seller suspended successfully',
      data: seller
    });

  } catch (error) {
    console.error('❌ Suspend seller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to suspend seller',
      error: error.message
    });
  }
};

// ============================================
// UNSUSPEND SELLER
// ============================================
export const unsuspendSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'Seller is not suspended'
      });
    }

    // Update seller status
    seller.status = 'approved';
    seller.isActive = true;
    seller.suspendedAt = null;
    seller.suspendedReason = null;
    seller.suspendedUntil = null;
    seller.statusUpdatedBy = adminId;
    seller.statusUpdatedAt = new Date();

    await seller.save();

    return res.status(200).json({
      success: true,
      message: 'Seller unsuspended successfully',
      data: seller
    });

  } catch (error) {
    console.error('❌ Unsuspend seller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsuspend seller',
      error: error.message
    });
  }
};

// ============================================
// GET SELLER STATS
// ============================================
export const getSellerStats = async (req, res) => {
  try {
    const stats = {
      total: await Seller.countDocuments(),
      pending: await Seller.countDocuments({ status: 'pending' }),
      approved: await Seller.countDocuments({ status: 'approved' }),
      rejected: await Seller.countDocuments({ status: 'rejected' }),
      suspended: await Seller.countDocuments({ status: 'suspended' }),
      underReview: await Seller.countDocuments({ status: 'under_review' }),
      verified: await Seller.countDocuments({ isVerified: true }),
      active: await Seller.countDocuments({ isActive: true })
    };

    return res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get seller stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get seller stats',
      error: error.message
    });
  }
};

// ============================================
// DELETE SELLER (Soft Delete)
// ============================================
export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    seller.isDeleted = true;
    seller.deletedAt = new Date();
    seller.isActive = false;
    seller.status = 'deleted';
    seller.statusUpdatedBy = adminId;
    seller.statusUpdatedAt = new Date();

    await seller.save();

    return res.status(200).json({
      success: true,
      message: 'Seller deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete seller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete seller',
      error: error.message
    });
  }
};