// middleware/sellerAuth.js

import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

export const protectSeller = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check cookie
    if (!token && req.cookies?.sellerAccessToken) {
      token = req.cookies.sellerAccessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get seller
    const seller = await Seller.findById(decoded.id).select('-password -refreshToken');
    if (!seller) {
      return res.status(401).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Check status
    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (seller.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: `Account suspended. Reason: ${seller.suspendedReason || 'Please contact support'}`
      });
    }

    req.seller = seller;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};