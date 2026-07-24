// backend/middleware/auth.js

import tokenService from "../services/tokenService.js";
import User from "../models/User.js";

// ✅ Export as 'protect' (main export)
export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required. Please login.",
      });
    }

    let decoded;
    try {
      decoded = tokenService.verifyAccessToken(token);
    } catch (error) {
      if (error.message === "Access token expired") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        code: "INVALID_TOKEN",
      });
    }

    const user = await User.findById(decoded.id).select(
      "-refreshTokens -__v -password -otp",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// ✅ Alias for 'protect' to maintain compatibility
export const authenticate = protect;

export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Check for admin or super_admin roles
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

// ✅ Alias for 'admin' to maintain compatibility
export const isAdmin = admin;

export const seller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Check for seller, admin, or super_admin roles
  if (
    req.user.role !== "seller" &&
    req.user.role !== "admin" &&
    req.user.role !== "super_admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Seller access required",
    });
  }

  next();
};

// ✅ Alias for 'seller' to maintain compatibility
export const isSeller = seller;