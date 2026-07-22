// Backend/middleware/sellerAuth.js

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
    // NOTE: Do NOT add "-otp" here. The Seller schema already marks
    // otp.email.code / otp.email.expiresAt / otp.phone.code / otp.phone.expiresAt
    // as select: false. Excluding the whole "otp" object on top of that
    // creates a conflicting projection (parent + child paths both excluded),
    // which Mongo rejects with "Path collision at otp.email.code" (error 31249).
    // If you also want otp.email.verified / otp.phone.verified hidden, exclude
    // those exact leaf paths instead (see commented alternative below).
    const seller = await Seller.findById(decoded.id).select('-password -refreshToken');
    // Alternative if you also want the verified flags hidden:
    // const seller = await Seller.findById(decoded.id)
    //   .select('-password -refreshToken -otp.email.verified -otp.phone.verified');

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

export const optionalSellerAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.sellerAccessToken) {
      token = req.cookies.sellerAccessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        // Same fix as protectSeller: don't exclude the whole "otp" object,
        // it collides with the schema-level select:false on its subfields.
        const seller = await Seller.findById(decoded.id).select('-password -refreshToken');
        if (seller && seller.isActive && seller.status === 'approved') {
          req.seller = seller;
        }
      } catch (err) {
        // Ignore token errors
      }
    }

    next();
  } catch (error) {
    next();
  }
};
