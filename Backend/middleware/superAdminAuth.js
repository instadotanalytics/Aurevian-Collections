import tokenService from '../services/tokenService.js';
import SuperAdmin from '../models/SuperAdmin.js';

/**
 * Protect Super Admin routes
 */
export const protectSuperAdmin = async (req, res, next) => {
  try {
    let token = req.signedCookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please login as Super Admin.'
      });
    }

    let decoded;
    try {
      decoded = tokenService.verifyAccessToken(token);
    } catch (error) {
      if (error.message === 'Access token expired') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if user is Super Admin
    const superAdmin = await SuperAdmin.findById(decoded.id)
      .select('-refreshTokens -__v -password -loginHistory');

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Super Admin not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if user has super admin role
    if (superAdmin.role !== 'super_admin' && !superAdmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Super Admin access required',
        code: 'ACCESS_DENIED'
      });
    }

    req.user = superAdmin;
    next();

  } catch (error) {
    console.error('❌ Super Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Check if user is Super Admin
 */
export const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'super_admin' && !req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Super Admin access required'
    });
  }

  next();
};