import SuperAdmin from '../models/SuperAdmin.js';
import superAdminService from '../services/superAdminService.js';
import tokenService from '../services/tokenService.js';
import bcrypt from 'bcryptjs';

/**
 * Super Admin Login
 */
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Verify credentials
    const result = await superAdminService.verifyCredentials(email, password);
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message
      });
    }

    const superAdmin = result.data;

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokens(superAdmin);
    const expiresAt = tokenService.getTokenExpiry(refreshToken);
    await superAdmin.addRefreshToken(refreshToken, expiresAt);
    await superAdmin.addLoginHistory({
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      success: true,
    });

    tokenService.setAuthCookies(res, accessToken, refreshToken);

    const adminData = {
      _id: superAdmin._id,
      firstName: superAdmin.firstName,
      lastName: superAdmin.lastName,
      fullName: superAdmin.fullName,
      email: superAdmin.email,
      profileImage: superAdmin.profileImage,
      role: superAdmin.role,
      isSuperAdmin: superAdmin.isSuperAdmin,
      isActive: superAdmin.isActive,
      phone: superAdmin.phone,
      permissions: superAdmin.permissions,
      preferences: superAdmin.preferences,
    };

    return res.status(200).json({
      success: true,
      message: 'Super Admin login successful',
      data: adminData,
      token: accessToken,
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

/**
 * Get Current Super Admin
 */
export const getCurrentSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.user.id)
      .select('-refreshTokens -loginHistory -__v -password');

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super Admin not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Super Admin retrieved successfully',
      data: superAdmin,
    });

  } catch (error) {
    console.error('❌ Get current super admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get super admin',
      error: error.message
    });
  }
};

/**
 * Update Super Admin Profile
 */
export const updateSuperAdminProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, preferences } = req.body;
    const superAdminId = req.user.id;

    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super Admin not found'
      });
    }

    // Update fields
    if (firstName) superAdmin.firstName = firstName;
    if (lastName) superAdmin.lastName = lastName;
    if (firstName || lastName) {
      superAdmin.fullName = `${superAdmin.firstName} ${superAdmin.lastName}`.trim();
    }
    if (phone) superAdmin.phone = phone;
    if (preferences) {
      superAdmin.preferences = { ...superAdmin.preferences, ...preferences };
    }

    await superAdmin.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: superAdmin,
    });

  } catch (error) {
    console.error('❌ Update super admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Change Super Admin Password
 */
export const changeSuperAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const superAdminId = req.user.id;

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

    const superAdmin = await SuperAdmin.findById(superAdminId).select('+password');
    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super Admin not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, superAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    superAdmin.password = hashedPassword;
    await superAdmin.save();

    // Clear all refresh tokens for security
    await superAdmin.clearRefreshTokens();

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

/**
 * Logout Super Admin
 */
export const superAdminLogout = async (req, res) => {
  try {
    const refreshToken = req.signedCookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = tokenService.decodeToken(refreshToken);
        if (decoded && decoded.id) {
          const superAdmin = await SuperAdmin.findById(decoded.id);
          if (superAdmin) {
            await superAdmin.removeRefreshToken(refreshToken);
          }
        }
      } catch (error) {
        console.error('Error removing refresh token:', error);
      }
    }

    tokenService.clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
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

/**
 * Refresh Super Admin Token
 */
export const refreshSuperAdminToken = async (req, res) => {
  try {
    const refreshToken = req.signedCookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const superAdmin = await SuperAdmin.findById(decoded.id);
    if (!superAdmin || !superAdmin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const tokenExists = superAdmin.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      tokenService.generateTokens(superAdmin);

    await superAdmin.removeRefreshToken(refreshToken);
    const newExpiresAt = tokenService.getTokenExpiry(newRefreshToken);
    await superAdmin.addRefreshToken(newRefreshToken, newExpiresAt);

    tokenService.setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newAccessToken,
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

/**
 * Get All Super Admins (Super Admin only)
 */
export const getAllSuperAdmins = async (req, res) => {
  try {
    const superAdmins = await SuperAdmin.find()
      .select('-refreshTokens -loginHistory -__v -password');

    return res.status(200).json({
      success: true,
      message: 'Super Admins retrieved successfully',
      data: superAdmins,
    });

  } catch (error) {
    console.error('❌ Get all super admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get super admins',
      error: error.message
    });
  }
};