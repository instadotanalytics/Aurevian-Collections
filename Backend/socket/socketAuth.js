// backend/socket/socketAuth.js
// Authenticates every socket handshake using the SAME JWT_ACCESS_SECRET
// already used by protect() / protectSeller() / protectSuperAdmin(). The
// frontend never gets to declare its own userId/role — everything here is
// derived from the verified token, mirroring the exact fallback order
// backend/middleware/auth.js already uses (User, then SuperAdmin).

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import SuperAdmin from "../models/SuperAdmin.js";

async function resolveIdentity(decoded) {
  const role = decoded.role;

  // Seller tokens are minted with { id, role: "seller" } — see
  // backend/controllers/sellerController.js generateTokens()
  if (role === "seller") {
    const seller = await Seller.findById(decoded.id).select(
      "_id isActive status",
    );
    if (!seller || !seller.isActive) return null;
    return {
      role: "seller",
      userId: null,
      sellerId: seller._id.toString(),
      isSuperAdmin: false,
    };
  }

  // Super admin tokens are minted with { role: "super_admin" } — see
  // backend/middleware/superAdminAuth.js
  if (role === "super_admin") {
    const admin = await SuperAdmin.findById(decoded.id).select("_id isActive");
    if (admin) {
      if (!admin.isActive) return null;
      return {
        role: "super_admin",
        userId: admin._id.toString(),
        sellerId: null,
        isSuperAdmin: true,
      };
    }
    // Fallback: a super_admin stored in the User collection (mirrors
    // backend/middleware/auth.js's own fallback)
    const user = await User.findById(decoded.id).select("_id isActive role");
    if (user && user.isActive && user.role === "super_admin") {
      return {
        role: "super_admin",
        userId: user._id.toString(),
        sellerId: null,
        isSuperAdmin: true,
      };
    }
    return null;
  }

  // Default: a regular customer token (no role claim, or role: "user")
  const user = await User.findById(decoded.id).select("_id isActive role");
  if (user) {
    if (!user.isActive) return null;
    if (user.role === "super_admin") {
      return {
        role: "super_admin",
        userId: user._id.toString(),
        sellerId: null,
        isSuperAdmin: true,
      };
    }
    return {
      role: "user",
      userId: user._id.toString(),
      sellerId: null,
      isSuperAdmin: false,
    };
  }

  const admin = await SuperAdmin.findById(decoded.id).select("_id isActive");
  if (admin && admin.isActive) {
    return {
      role: "super_admin",
      userId: admin._id.toString(),
      sellerId: null,
      isSuperAdmin: true,
    };
  }

  return null;
}

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith("Bearer ")
        ? socket.handshake.headers.authorization.substring(7)
        : null);

    if (!token) {
      return next(new Error("AUTH_REQUIRED"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(new Error("TOKEN_EXPIRED"));
      }
      return next(new Error("INVALID_TOKEN"));
    }

    const identity = await resolveIdentity(decoded);
    if (!identity) {
      return next(new Error("USER_NOT_FOUND"));
    }

    socket.data.userId = identity.userId;
    socket.data.sellerId = identity.sellerId;
    socket.data.role = identity.role;
    socket.data.isSuperAdmin = identity.isSuperAdmin;
    socket.data.tokenExp = decoded.exp; // seconds since epoch

    next();
  } catch (error) {
    console.error("❌ Socket auth error:", error.message);
    next(new Error("AUTH_ERROR"));
  }
};
