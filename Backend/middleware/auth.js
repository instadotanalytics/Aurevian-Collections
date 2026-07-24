// backend/middleware/auth.js

import tokenService from "../services/tokenService.js";
import User from "../models/User.js";
import SuperAdmin from "../models/SuperAdmin.js"; // ✅ Add this import

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
      console.log("❌ No token found in request");
      return res.status(401).json({
        success: false,
        message: "Access token required. Please login.",
      });
    }

    console.log("📌 Token received:", token.substring(0, 20) + "...");

    let decoded;
    try {
      decoded = tokenService.verifyAccessToken(token);
      console.log("✅ Token decoded:", decoded);
    } catch (error) {
      console.log("❌ Token verification failed:", error.message);
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

    console.log("🔍 Looking for user with ID:", decoded.id);
    
    // ✅ Try to find in User model first
    let user = await User.findById(decoded.id).select(
      "-refreshTokens -__v -password -otp",
    );

    // ✅ If not found in User, try SuperAdmin model
    if (!user) {
      console.log("🔍 User not found in User model, checking SuperAdmin model...");
      user = await SuperAdmin.findById(decoded.id).select("-__v -password");
      if (user) {
        console.log("✅ Found in SuperAdmin model");
        // Convert SuperAdmin to User-like object for compatibility
        user = {
          ...user.toObject(),
          role: user.role || "super_admin",
          isActive: user.isActive !== false,
        };
      }
    }

    if (!user) {
      console.log("❌ User not found with ID:", decoded.id);
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    console.log("✅ User found:", user.email, "Role:", user.role);

    if (!user.isActive) {
      console.log("❌ User account is deactivated");
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
    console.log("❌ Admin middleware: No user in request");
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  console.log("🔍 Admin check - User role:", req.user.role);

  // Check for admin or super_admin roles
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    console.log("❌ Admin middleware: User is not admin. Role:", req.user.role);
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  console.log("✅ Admin middleware: Access granted");
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