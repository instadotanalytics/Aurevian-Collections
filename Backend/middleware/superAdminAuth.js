// Backend/middleware/superAdminAuth.js

import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

export const protectSuperAdmin = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header first
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('📌 Token from Authorization header');
    }

    // 2. If no token in header, check cookies
    if (!token && req.cookies?.superAdminToken) {
      token = req.cookies.superAdminToken;
      console.log('📌 Token from cookie');
    }

    // 3. If still no token, check body
    if (!token && req.body?.token) {
      token = req.body.token;
      console.log('📌 Token from body');
    }

    if (!token) {
      console.log('❌ No token found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login again.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      console.log('✅ Token verified for user:', decoded.id);

      // Check role
      if (decoded.role !== 'super_admin') {
        console.log('❌ Invalid role:', decoded.role);
        return res.status(403).json({
          success: false,
          message: 'Access denied. Super Admin only.',
          code: 'INVALID_ROLE'
        });
      }

      // Find admin
      const admin = await SuperAdmin.findById(decoded.id)
        .select('-password -refreshToken -refreshTokenExpiry -__v');
      
      if (!admin) {
        console.log('❌ Admin not found:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'Admin account not found',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      if (!admin.isActive) {
        console.log('❌ Admin account deactivated:', admin.email);
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      req.admin = admin;
      next();

    } catch (jwtError) {
      console.log('❌ JWT Error:', jwtError.name, jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.',
          code: 'INVALID_TOKEN'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      });
    }

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      code: 'SERVER_ERROR'
    });
  }
};