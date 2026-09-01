// Backend/controllers/sellerController.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

import Seller from "../models/Seller.js";
import Order, { FULFILLMENT_STATUS } from "../models/Order.js";
import JewelleryProduct from "../models/JewelleryProduct.js";

import otpService from "../services/otpService.js";
import emailService from "../services/emailService.js";
import cloudinaryService from "../services/cloudinaryService.js";

// ✅ NEW — Add this import for phone normalization
import { normalizePhoneNumber } from "../utils/phoneUtils.js";

// ✅ NEW — Add these imports for Shiprocket pickup address
import shiprocketService from "../services/shiprocketService.js";
import { isValidIndianPincode } from "./shippingController.js";

// ✅ NEW — Resend cooldown — prevents SMS/email spam via the resend endpoint.
const RESEND_COOLDOWN_MS = 60 * 1000; // 60s

// ✅ Reuse the SAME seller-revenue isolation logic used by the Earnings
// tab, and the SAME customer-grouping logic used by /customers/summary.
// This is what guarantees the dashboard numbers never disagree with the
// dedicated Earnings/Customers pages.
import { getSellerOrderRows } from "./sellerEarningsController.js";
import {
  getSellerOrderRowsForCustomers,
  buildCustomerRecords,
} from "./sellerCustomersController.js";

const REFUNDED_ORDER_STATUSES = ["cancelled", "returned", "rto"];
const LOW_STOCK_DEFAULT_THRESHOLD = 5;
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// ✅ CHANGED — deterministic per (seller, revision), NOT timestamp-based.
// Retries on an unchanged address always resolve to the same nickname,
// so Shiprocket never gets a duplicate pickup location for a plain retry.
// The revision only bumps when the seller actually edits the address.
function buildPickupLocationNickname(seller, revision) {
  const base = (
    seller.storeInfo?.storeSlug ||
    seller.storeInfo?.storeName ||
    "seller"
  )
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);
  const shortId = seller._id.toString().slice(-8);
  return `${base || "seller"}_${shortId}_v${revision || 1}`;
}

// ✅ NEW — Shiprocket's addpickup API errors if a pickup_location name
// already exists. Since retries intentionally reuse the same nickname,
// that specific error means "already registered", not "failed" — we
// reconcile instead of surfacing it as a failure.
function isAlreadyExistsError(err) {
  const text =
    `${err?.message || ""} ${JSON.stringify(err?.details || {})}`.toLowerCase();
  return (
    text.includes("already exist") ||
    text.includes("already registered") ||
    text.includes("duplicate")
  );
}

// ============================================
// GENERATE TOKENS
// ============================================
const generateTokens = (sellerId) => {
  const accessToken = jwt.sign(
    { id: sellerId, role: "seller" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "30d" }, // ✅ FIXED — was "15m", causing seller logouts every 15 min
  );

  const refreshToken = jwt.sign(
    { id: sellerId, role: "seller" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" },
  );

  return { accessToken, refreshToken };
};

// ============================================
// 1. SELLER REGISTRATION — ✅ PATCHED: phone validation + classified errors
// ============================================
export const registerSeller = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      storeName,
      brandName,
      businessDescription,
      productCategories,
      website,
      socialLinks,
      businessAddress,
      bankDetails,
      termsAccepted,
      panNumber,
      aadhaarNumber,
      gstNumber,
    } = req.body;

    console.log("📝 Registration request:", {
      firstName,
      lastName,
      email,
      storeName,
      phone,
    });

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !storeName
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ✅ NEW — validate phone BEFORE anything touches the DB or Twilio.
    // No silent +91 guessing, no invalid numbers reaching Twilio.
    const phoneCheck = normalizePhoneNumber(phone);
    if (!phoneCheck.valid) {
      return res.status(400).json({
        success: false,
        message: phoneCheck.reason || "Please enter a valid phone number",
      });
    }
    const normalizedPhone = phoneCheck.e164;

    let existingSeller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    let otpDeliveryStatus = { email: false, phone: false };
    let otpDeliveryDetail = {
      emailError: null,
      phoneError: null,
      phoneErrorCode: null,
    };

    if (existingSeller) {
      if (existingSeller.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Seller already exists with this email",
        });
      }

      existingSeller.firstName = firstName.trim();
      existingSeller.lastName = lastName.trim();
      existingSeller.fullName = `${firstName} ${lastName}`.trim();
      existingSeller.phone = normalizedPhone;

      const salt = await bcrypt.genSalt(12);
      existingSeller.password = await bcrypt.hash(password, salt);

      existingSeller.storeInfo.storeName = storeName.trim();
      existingSeller.storeInfo.storeSlug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      existingSeller.status = "pending";

      await existingSeller.save();
      console.log("✅ Existing seller updated:", existingSeller._id);

      const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await existingSeller.setEmailOTP(emailOTP);
      const emailResult = await emailService.sendOTPEmail(
        email,
        emailOTP,
        "verification",
      );
      otpDeliveryStatus.email = emailResult.success;
      if (!emailResult.success) {
        console.error("❌ Email OTP failed to send:", emailResult.error);
        otpDeliveryDetail.emailError =
          "Could not send email OTP. Please try resending.";
      } else {
        console.log("✅ Email OTP sent to:", email);
      }

      const phoneOtpResult = await otpService.sendPhoneOTP(normalizedPhone);
      otpDeliveryStatus.phone = phoneOtpResult.success;
      if (!phoneOtpResult.success) {
        console.error("❌ Failed to send phone OTP:", phoneOtpResult.error);
        otpDeliveryDetail.phoneError = phoneOtpResult.error;
        otpDeliveryDetail.phoneErrorCode = phoneOtpResult.code;
      } else {
        console.log("✅ Phone OTP sent to:", normalizedPhone);
      }

      return res.status(200).json({
        success: true,
        message: "OTP sent! Please verify your email and phone.",
        data: {
          _id: existingSeller._id,
          email: existingSeller.email,
          phone: existingSeller.phone,
          emailVerified: existingSeller.emailVerified,
          phoneVerified: existingSeller.phoneVerified,
          status: existingSeller.status,
        },
        requiresVerification: {
          email: !existingSeller.emailVerified,
          phone: !existingSeller.phoneVerified,
        },
        otpDeliveryStatus,
        otpDeliveryDetail, // ✅ NEW — safe, user-facing reason (no raw Twilio internals)
      });
    }

    existingSeller = await Seller.findOne({ phone: normalizedPhone });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller already exists with this phone number",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sellerData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase().trim(),
      phone: normalizedPhone,
      password: hashedPassword,
      storeInfo: {
        storeName: storeName.trim(),
        storeSlug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        website: website || "",
        socialLinks: socialLinks || {},
      },
      brandName: brandName || "",
      businessDescription: businessDescription || "",
      productCategories: productCategories || [],
      businessAddress: {
        street: businessAddress?.street || "",
        city: businessAddress?.city || "",
        state: businessAddress?.state || "",
        pincode: businessAddress?.pincode || "",
        country: businessAddress?.country || "Switzerland",
      },
      bankDetails: {
        accountHolderName: bankDetails?.accountHolderName || "",
        bankName: bankDetails?.bankName || "",
        accountNumber: bankDetails?.accountNumber || "",
        ifscCode: bankDetails?.ifscCode || "",
        upiId: bankDetails?.upiId || "",
      },
      documents: {
        panNumber: panNumber?.trim().toUpperCase() || "",
        aadhaarNumber: aadhaarNumber?.trim() || "",
        gstNumber: gstNumber?.trim().toUpperCase() || null,
        panCard: null,
        aadhaarCard: null,
        panVerified: false,
        aadhaarVerified: false,
      },
      kyc: {
        termsAccepted: termsAccepted || false,
        termsAcceptedAt: termsAccepted ? new Date() : null,
        status: "not_submitted",
      },
      status: "pending",
      isActive: true,
      isVerified: false,
      emailVerified: false,
      phoneVerified: false,
      registrationDate: new Date(),
    };

    const seller = new Seller(sellerData);
    await seller.save();
    console.log("✅ New seller created:", seller._id);

    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    await seller.setEmailOTP(emailOTP);
    const emailResult = await emailService.sendOTPEmail(
      email,
      emailOTP,
      "verification",
    );
    otpDeliveryStatus.email = emailResult.success;
    if (!emailResult.success) {
      console.error("❌ Email OTP failed to send:", emailResult.error);
      otpDeliveryDetail.emailError =
        "Could not send email OTP. Please try resending.";
    } else {
      console.log("✅ Email OTP sent to:", email);
    }

    const phoneOtpResult = await otpService.sendPhoneOTP(normalizedPhone);
    otpDeliveryStatus.phone = phoneOtpResult.success;
    seller.otp.phone.lastSentAt = new Date();
    if (!phoneOtpResult.success) {
      console.error("❌ Failed to send phone OTP:", phoneOtpResult.error);
      otpDeliveryDetail.phoneError = phoneOtpResult.error;
      otpDeliveryDetail.phoneErrorCode = phoneOtpResult.code;
    } else {
      console.log("✅ Phone OTP sent to:", normalizedPhone);
    }
    await seller.save();

    // ✅ Registration record is intentionally kept even on partial OTP
    // failure — this is the existing convention (see the "existingSeller"
    // update-branch above), which lets the seller resend without
    // re-registering. Not adding a rollback.
    return res.status(201).json({
      success: true,
      message: "Seller registration initiated. Verify the OTPs.",
      data: {
        _id: seller._id,
        email: seller.email,
        phone: seller.phone,
        emailVerified: seller.emailVerified,
        phoneVerified: seller.phoneVerified,
        status: seller.status,
      },
      requiresVerification: {
        email: !seller.emailVerified,
        phone: !seller.phoneVerified,
      },
      otpDeliveryStatus,
      otpDeliveryDetail,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// ============================================
// 2. VERIFY EMAIL OTP
// ============================================
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const seller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).select("+otp.email.code +otp.email.expiresAt");

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (seller.emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const result = await seller.verifyEmailOTP(otp);
    if (!result) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    await seller.save();

    if (seller.emailVerified && seller.phoneVerified) {
      await emailService.sendSellerApprovalEmail(
        seller.email,
        seller.firstName,
        seller.storeInfo.storeName,
        `${process.env.CLIENT_URL}/seller/login`,
      );
      console.log("✅ Approval email sent to:", seller.email);
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      data: {
        emailVerified: seller.emailVerified,
        phoneVerified: seller.phoneVerified,
        status: seller.status,
      },
    });
  } catch (error) {
    console.error("❌ Email verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

// ============================================
// 3. VERIFY PHONE OTP — ✅ PATCHED: normalize phone before lookup
// ============================================
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    // ✅ NEW — normalize before lookup, same as registerSeller/resendOTP.
    // Seller.phone is always stored in E.164; comparing against a raw,
    // unnormalized value here is what was causing "Seller not found"
    // even with a correct OTP.
    const phoneCheck = normalizePhoneNumber(phone);
    if (!phoneCheck.valid) {
      return res.status(400).json({
        success: false,
        message: phoneCheck.reason || "Invalid phone number",
      });
    }
    const normalizedPhone = phoneCheck.e164;

    const seller = await Seller.findOne({ phone: normalizedPhone });

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (seller.phoneVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Phone already verified" });
    }

    const isValid = await otpService.verifyPhoneOTP(normalizedPhone, otp);
    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    seller.phoneVerified = true;
    await seller.save();

    if (seller.emailVerified && seller.phoneVerified) {
      await emailService.sendSellerApprovalEmail(
        seller.email,
        seller.firstName,
        seller.storeInfo.storeName,
        `${process.env.CLIENT_URL}/seller/login`,
      );
      console.log("✅ Approval email sent to:", seller.email);
    }

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully!",
      data: {
        emailVerified: seller.emailVerified,
        phoneVerified: seller.phoneVerified,
        status: seller.status,
      },
    });
  } catch (error) {
    console.error("❌ Phone verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Phone verification failed",
      error: error.message,
    });
  }
};

// ============================================
// 4. RESEND OTP — ✅ PATCHED: cooldown + normalization + classified errors
// ============================================
export const resendOTP = async (req, res) => {
  try {
    const { contact, type } = req.body;

    if (!contact || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Contact and type are required" });
    }
    if (!["email", "phone"].includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid type. Use email or phone" });
    }

    let seller;
    let normalizedContact = contact;

    if (type === "email") {
      seller = await Seller.findOne({
        email: { $regex: new RegExp(`^${contact}$`, "i") },
      });
    } else {
      const phoneCheck = normalizePhoneNumber(contact);
      if (!phoneCheck.valid) {
        return res
          .status(400)
          .json({ success: false, message: phoneCheck.reason });
      }
      normalizedContact = phoneCheck.e164;
      seller = await Seller.findOne({ phone: normalizedContact });
    }

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    if (type === "email" && seller.emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }
    if (type === "phone" && seller.phoneVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Phone already verified" });
    }

    // ✅ NEW — cooldown so resend can't be spammed into Twilio/Gmail.
    const lastSentAt = seller.otp?.[type]?.lastSentAt;
    if (
      lastSentAt &&
      Date.now() - new Date(lastSentAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - new Date(lastSentAt).getTime())) /
          1000,
      );
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting another OTP.`,
      });
    }

    let otpDeliveryStatus = { email: false, phone: false };
    let otpDeliveryDetail = {
      emailError: null,
      phoneError: null,
      phoneErrorCode: null,
    };

    if (type === "email") {
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await seller.setEmailOTP(newOTP);
      seller.otp.email.lastSentAt = new Date();
      const emailResult = await emailService.sendOTPEmail(
        contact,
        newOTP,
        "verification",
      );
      otpDeliveryStatus.email = emailResult.success;
      if (!emailResult.success)
        otpDeliveryDetail.emailError = "Could not resend email OTP.";

      if (!seller.phoneVerified) {
        const phoneResult = await otpService.sendPhoneOTP(seller.phone);
        seller.otp.phone.lastSentAt = new Date();
        otpDeliveryStatus.phone = phoneResult.success;
        if (!phoneResult.success) {
          otpDeliveryDetail.phoneError = phoneResult.error;
          otpDeliveryDetail.phoneErrorCode = phoneResult.code;
        }
      }
      await seller.save();
    } else {
      const phoneResult = await otpService.sendPhoneOTP(normalizedContact);
      seller.otp.phone.lastSentAt = new Date();
      otpDeliveryStatus.phone = phoneResult.success;
      if (!phoneResult.success) {
        otpDeliveryDetail.phoneError = phoneResult.error;
        otpDeliveryDetail.phoneErrorCode = phoneResult.code;
      }

      if (!seller.emailVerified) {
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        await seller.setEmailOTP(newOTP);
        seller.otp.email.lastSentAt = new Date();
        const emailResult = await emailService.sendOTPEmail(
          seller.email,
          newOTP,
          "verification",
        );
        otpDeliveryStatus.email = emailResult.success;
        if (!emailResult.success)
          otpDeliveryDetail.emailError = "Could not resend email OTP.";
      }
      await seller.save();
    }

    return res.status(200).json({
      success: true,
      message: `OTP resend attempted for ${type}`,
      otpDeliveryStatus,
      otpDeliveryDetail,
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

// ============================================
// 5. SELLER LOGIN
// ============================================
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const seller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).select("+password +refreshToken +refreshTokenExpiry");

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!seller.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
        requiresVerification: "email",
      });
    }

    if (!seller.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your phone first",
        requiresVerification: "phone",
      });
    }

    if (seller.status === "pending") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is pending approval. Please wait for verification (within 24 hours).",
        status: "pending",
      });
    }

    if (seller.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: `Your account was rejected. Reason: ${seller.statusReason || "Please contact support"}`,
        status: "rejected",
      });
    }

    if (seller.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: `Your account is suspended. Reason: ${seller.suspendedReason || "Please contact support"}`,
        status: "suspended",
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // ✅ Compare password
    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      await seller.addLoginHistory(req.ip, req.headers["user-agent"], false);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await seller.addLoginHistory(req.ip, req.headers["user-agent"], true);

    // ✅ Generate tokens
    const { accessToken, refreshToken } = generateTokens(seller._id);

    // ✅ Update refresh token - using findByIdAndUpdate
    await Seller.findByIdAndUpdate(seller._id, {
      refreshToken: refreshToken,
      refreshTokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const sellerData = {
      _id: seller._id,
      firstName: seller.firstName,
      lastName: seller.lastName,
      fullName: seller.fullName,
      email: seller.email,
      phone: seller.phone,
      storeInfo: seller.storeInfo,
      status: seller.status,
      isVerified: seller.isVerified,
      emailVerified: seller.emailVerified,
      phoneVerified: seller.phoneVerified,
      kycStatus: seller.kyc?.status || "not_submitted",
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: sellerData,
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("❌ Seller login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// ============================================
// 6. GET CURRENT SELLER
// ============================================
export const getCurrentSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select(
      "-password -refreshToken -refreshTokenExpiry",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    return res.status(200).json({ success: true, data: seller });
  } catch (error) {
    console.error("❌ Get seller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get seller",
      error: error.message,
    });
  }
};

// ============================================
// 7. SELLER LOGOUT
// ============================================
export const sellerLogout = async (req, res) => {
  try {
    const sellerId = req.seller?._id;

    if (sellerId) {
      await Seller.findByIdAndUpdate(sellerId, {
        $unset: { refreshToken: 1, refreshTokenExpiry: 1 },
      });
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("sellerAccessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });
    res.clearCookie("sellerRefreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Logout failed", error: error.message });
  }
};

// ============================================
// 8. REFRESH SELLER TOKEN
// ============================================
export const refreshSellerToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.sellerRefreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const seller = await Seller.findById(decoded.id);

    if (!seller || seller.refreshToken !== refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      seller._id,
    );

    seller.refreshToken = newRefreshToken;
    seller.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await seller.save();

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("sellerAccessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("sellerRefreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// ============================================
// 9. GET SELLER DASHBOARD — ✅ FULLY REBUILT ON REAL DATA
//
// One call returns everything the dashboard's top cards, status grid,
// low-stock list and top-products list need. Revenue/customer figures
// reuse the exact same aggregation helpers as /earnings and /customers
// so the numbers can never silently drift apart across pages.
// ============================================
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ---------------- PRODUCTS ----------------
    const [totalProducts, activeProducts, newProductsThisMonth, lowStockDocs] =
      await Promise.all([
        JewelleryProduct.countDocuments({
          "seller.sellerId": sellerId,
          status: { $ne: "Archived" },
        }),
        JewelleryProduct.countDocuments({
          "seller.sellerId": sellerId,
          status: "Published",
        }),
        JewelleryProduct.countDocuments({
          "seller.sellerId": sellerId,
          status: { $ne: "Archived" },
          createdAt: { $gte: thisMonthStart },
        }),
        JewelleryProduct.find({
          "seller.sellerId": sellerId,
          status: { $ne: "Archived" },
          isActive: true,
          $expr: {
            $lte: [
              "$inventory.stockQuantity",
              {
                $ifNull: [
                  "$inventory.lowStockThreshold",
                  LOW_STOCK_DEFAULT_THRESHOLD,
                ],
              },
            ],
          },
        })
          .select(
            "productName thumbnail inventory.stockQuantity inventory.lowStockThreshold status",
          )
          .sort({ "inventory.stockQuantity": 1 })
          .limit(6),
      ]);

    // ---------------- ORDERS / REVENUE ----------------
    // Same seller-item isolation + refund treatment as the Earnings tab.
    const rows = await getSellerOrderRows(sellerId);
    const paidRows = rows.filter((r) => r.paymentStatus === "paid");
    const refundedPaid = paidRows.filter((r) =>
      REFUNDED_ORDER_STATUSES.includes(r.orderStatus),
    );
    const sum = (list) => list.reduce((s, r) => s + (r.sellerSubtotal || 0), 0);

    const revenue = sum(paidRows) - sum(refundedPaid);

    const thisMonthPaid = paidRows.filter(
      (r) => new Date(r.effectiveDate) >= thisMonthStart,
    );
    const thisMonthRefunded = refundedPaid.filter(
      (r) => new Date(r.effectiveDate) >= thisMonthStart,
    );
    const lastMonthPaid = paidRows.filter(
      (r) =>
        new Date(r.effectiveDate) >= lastMonthStart &&
        new Date(r.effectiveDate) < thisMonthStart,
    );
    const lastMonthRefunded = refundedPaid.filter(
      (r) =>
        new Date(r.effectiveDate) >= lastMonthStart &&
        new Date(r.effectiveDate) < thisMonthStart,
    );
    const thisMonthRevenue = sum(thisMonthPaid) - sum(thisMonthRefunded);
    const lastMonthRevenue = sum(lastMonthPaid) - sum(lastMonthRefunded);
    const revenueChangePercent =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : null;

    // Last 7 calendar days — powers the Revenue card's mini sparkline.
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayTotal = sum(
        paidRows.filter(
          (r) =>
            new Date(r.effectiveDate) >= dayStart &&
            new Date(r.effectiveDate) < dayEnd,
        ),
      );
      revenueTrend.push(dayTotal);
    }

    const totalOrders = await Order.countDocuments({
      "items.seller": sellerId,
    });

    // Real fulfillmentStatus counts — no invented status values.
    const fulfillmentCountsAgg = await Order.aggregate([
      { $match: { "items.seller": toObjectId(sellerId) } },
      { $group: { _id: "$fulfillmentStatus", count: { $sum: 1 } } },
    ]);
    const fulfillmentCounts = {};
    for (const s of Object.values(FULFILLMENT_STATUS)) fulfillmentCounts[s] = 0;
    for (const row of fulfillmentCountsAgg) {
      if (row._id in fulfillmentCounts) fulfillmentCounts[row._id] = row.count;
    }
    const pendingOrders = fulfillmentCounts.PENDING_SELLER_CONFIRMATION || 0;
    const processingOrders =
      (fulfillmentCounts.SELLER_CONFIRMED || 0) +
      (fulfillmentCounts.ADMIN_APPROVED || 0) +
      (fulfillmentCounts.SHIPMENT_CREATED || 0) +
      (fulfillmentCounts.AWB_PENDING || 0) +
      (fulfillmentCounts.AWB_ASSIGNED || 0);

    // ---------------- CUSTOMERS ----------------
    const customerRows = await getSellerOrderRowsForCustomers(sellerId);
    const customers = buildCustomerRecords(customerRows);
    const totalCustomers = customers.length;
    const newCustomersThisMonth = customers.filter(
      (c) => new Date(c.firstOrderAt) >= thisMonthStart,
    ).length;

    // ---------------- TOP PRODUCTS ----------------
    const byProduct = {};
    for (const r of paidRows) {
      for (const it of r.sellerItems) {
        const key = it.product?.toString();
        if (!key) continue;
        if (!byProduct[key]) {
          byProduct[key] = {
            productId: key,
            name: it.name,
            image: it.image,
            unitsSold: 0,
            revenue: 0,
          };
        }
        byProduct[key].unitsSold += it.quantity;
        byProduct[key].revenue += it.subtotal;
      }
    }
    const topProductAgg = Object.values(byProduct)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const topProductDocs = topProductAgg.length
      ? await JewelleryProduct.find({
          _id: { $in: topProductAgg.map((p) => toObjectId(p.productId)) },
        }).select("productName thumbnail inventory.stockQuantity status")
      : [];
    const productDocById = new Map(
      topProductDocs.map((d) => [d._id.toString(), d]),
    );

    const topProducts = topProductAgg.map((p) => {
      const doc = productDocById.get(p.productId);
      return {
        productId: p.productId,
        name: doc?.productName || p.name,
        image: doc?.thumbnail?.url || p.image || "",
        unitsSold: p.unitsSold,
        revenue: p.revenue,
        stock: doc?.inventory?.stockQuantity ?? null,
        status: doc?.status || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        newProductsThisMonth,

        totalOrders,
        pendingOrders,
        processingOrders,

        revenue,
        revenueChangePercent,
        revenueTrend,

        totalCustomers,
        newCustomersThisMonth,

        orderStatusBreakdown: fulfillmentCounts,

        lowStockProducts: lowStockDocs.map((p) => ({
          _id: p._id,
          name: p.productName,
          image: p.thumbnail?.url || "",
          stock: p.inventory?.stockQuantity ?? 0,
          threshold:
            p.inventory?.lowStockThreshold ?? LOW_STOCK_DEFAULT_THRESHOLD,
        })),

        topProducts,
      },
    });
  } catch (error) {
    console.error("❌ Get dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error.message,
    });
  }
};

// ============================================
// 10. GET RECENT ORDERS — ✅ REAL, seller-scoped, no dummy data
// ============================================
export const getRecentOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const orders = await Order.find({ "items.seller": sellerId })
      .sort({ createdAt: -1 })
      .limit(8)
      .select(
        "orderNumber customerName items orderStatus fulfillmentStatus paymentStatus createdAt",
      );

    const shaped = orders.map((order) => {
      const sellerItems = order.items.filter(
        (i) => i.seller && i.seller.toString() === sellerId.toString(),
      );
      const sellerSubtotal = sellerItems.reduce((s, i) => s + i.subtotal, 0);
      const itemCount = sellerItems.reduce((s, i) => s + i.quantity, 0);

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customerName || "Customer",
        total: sellerSubtotal,
        status: order.orderStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        paymentStatus: order.paymentStatus,
        items: itemCount,
        date: order.createdAt,
      };
    });

    return res.status(200).json({ success: true, data: shaped });
  } catch (error) {
    console.error("❌ Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
};

// ============================================
// 11. UPDATE SELLER PROFILE
// ============================================
export const updateSellerProfile = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const updateData = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "brandName",
      "businessDescription",
      "phone",
      "businessAddress",
      "bankDetails",
      "shippingDetails",
      "productCategories",
      "customCategories",
      "profileImage",
      "businessLogo",
      "storeInfo",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (
          typeof updateData[field] === "object" &&
          updateData[field] !== null &&
          !Array.isArray(updateData[field])
        ) {
          seller[field] = { ...seller[field], ...updateData[field] };
        } else {
          seller[field] = updateData[field];
        }
      }
    });

    if (updateData.firstName || updateData.lastName) {
      seller.fullName =
        `${seller.firstName || ""} ${seller.lastName || ""}`.trim();
    }

    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: seller,
    });
  } catch (error) {
    console.error("❌ Update seller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ============================================
// 12. UPLOAD SELLER DOCUMENTS
// ============================================
export const uploadSellerDocuments = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { panNumber, aadhaarNumber, gstNumber, bankDetails } = req.body;
    const files = req.files;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    if (!panNumber) {
      return res
        .status(400)
        .json({ success: false, message: "PAN number is required" });
    }
    const cleanPan = panNumber.trim().toUpperCase().replace(/\s/g, "");
    if (
      cleanPan.length !== 10 ||
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid PAN number (e.g., ABCDE1234F)",
      });
    }

    if (!aadhaarNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Aadhaar number is required" });
    }
    const cleanAadhaar = aadhaarNumber.trim().replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || !/^[0-9]{12}$/.test(cleanAadhaar)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 12-digit Aadhaar number",
      });
    }

    const existingPan = await Seller.findOne({
      "documents.panNumber": cleanPan,
      _id: { $ne: sellerId },
    });
    if (existingPan) {
      return res.status(400).json({
        success: false,
        message: "PAN number already registered with another seller",
      });
    }
    const existingAadhaar = await Seller.findOne({
      "documents.aadhaarNumber": cleanAadhaar,
      _id: { $ne: sellerId },
    });
    if (existingAadhaar) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number already registered with another seller",
      });
    }

    let parsedBankDetails = null;
    if (bankDetails) {
      try {
        parsedBankDetails =
          typeof bankDetails === "string"
            ? JSON.parse(bankDetails)
            : bankDetails;
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid bank details format" });
      }

      if (
        !parsedBankDetails.accountHolderName ||
        !parsedBankDetails.bankName ||
        !parsedBankDetails.accountNumber ||
        !parsedBankDetails.ifscCode
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Account holder name, bank name, account number and IFSC code are required",
        });
      }
    }

    const documentFields = [
      "panCard",
      "aadhaarCard",
      "gstCertificate",
      "cancelledCheque",
      "bankStatement",
    ];

    for (const field of documentFields) {
      if (files && files[field] && files[field][0]) {
        const result = await cloudinaryService.uploadFile(
          files[field][0].path,
          `sellers/${sellerId}/documents`,
        );
        if (result.success) {
          seller.documents[field] = result.url;
        }
      }
    }

    seller.documents.panNumber = cleanPan;
    seller.documents.aadhaarNumber = cleanAadhaar;
    seller.documents.gstNumber = gstNumber
      ? gstNumber.trim().toUpperCase()
      : null;

    if (parsedBankDetails) {
      seller.bankDetails = {
        ...seller.bankDetails,
        accountHolderName: parsedBankDetails.accountHolderName.trim(),
        bankName: parsedBankDetails.bankName.trim(),
        accountNumber: parsedBankDetails.accountNumber.trim(),
        ifscCode: parsedBankDetails.ifscCode.trim().toUpperCase(),
        upiId: parsedBankDetails.upiId?.trim() || "",
      };
      seller.kyc.documentStatus.bankDetails = "pending";
    }

    seller.kyc.documentStatus.panCard = "pending";
    seller.kyc.documentStatus.aadhaarCard = "pending";
    if (seller.documents.gstNumber) {
      seller.kyc.documentStatus.gstCertificate = "pending";
    }
    seller.kyc.status = "submitted";
    seller.kyc.submittedAt = new Date();
    seller.kyc.rejectionReason = null;

    await seller.save();

    return res.status(200).json({
      success: true,
      message: "KYC submitted successfully! Your documents are under review.",
      data: {
        documents: seller.documents,
        bankDetails: seller.bankDetails,
        kycStatus: seller.kyc.status,
        documentStatus: seller.kyc.documentStatus,
      },
    });
  } catch (error) {
    console.error("❌ KYC submit error:", error);
    return res.status(500).json({
      success: false,
      message: "KYC submission failed",
      error: error.message,
    });
  }
};

// ============================================
// 13. GET VERIFICATION STATUS
// ============================================
export const getVerificationStatus = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select(
      "documents bankDetails kyc status emailVerified phoneVerified",
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        emailVerified: seller.emailVerified,
        phoneVerified: seller.phoneVerified,
        kycStatus: seller.kyc?.status || "not_submitted",
        kycRejectionReason: seller.kyc?.rejectionReason || null,
        documentStatus: seller.kyc?.documentStatus || {},
        accountStatus: seller.status,
        documents: seller.documents || {},
        bankDetails: seller.bankDetails || {},
      },
    });
  } catch (error) {
    console.error("❌ Get verification status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get verification status",
      error: error.message,
    });
  }
};

// ============================================
// 14. GET RECENT ACTIVITIES — ✅ REAL, derived from Order.statusHistory
//
// There's no separate Activity model in this codebase, so activities are
// derived from the same statusHistory entries the order lifecycle already
// writes (system/seller/super_admin actions on this seller's orders).
// Nothing here is fabricated — every entry maps to a real status change
// that actually happened.
// ============================================
const ACTIVITY_LABELS = {
  PENDING_SELLER_CONFIRMATION: {
    icon: "📦",
    message: (o) => `New order #${o.orderNumber} received`,
  },
  SELLER_CONFIRMED: {
    icon: "✅",
    message: (o) => `You confirmed order #${o.orderNumber}`,
  },
  SELLER_REJECTED: {
    icon: "🚫",
    message: (o) => `You rejected order #${o.orderNumber}`,
  },
  ADMIN_APPROVED: {
    icon: "🛡️",
    message: (o) => `Order #${o.orderNumber} approved by admin`,
  },
  ADMIN_REJECTED: {
    icon: "⚠️",
    message: (o) => `Order #${o.orderNumber} rejected by admin`,
  },
  SHIPMENT_CREATED: {
    icon: "🚚",
    message: (o) => `Shipment created for order #${o.orderNumber}`,
  },
  AWB_PENDING: {
    icon: "🚚",
    message: (o) => `Order #${o.orderNumber} is awaiting courier assignment`,
  },
  AWB_ASSIGNED: {
    icon: "🏷️",
    message: (o) => `Courier assigned for order #${o.orderNumber}`,
  },
  IN_TRANSIT: {
    icon: "🛣️",
    message: (o) => `Order #${o.orderNumber} is in transit`,
  },
  OUT_FOR_DELIVERY: {
    icon: "📍",
    message: (o) => `Order #${o.orderNumber} is out for delivery`,
  },
  DELIVERED: {
    icon: "🎉",
    message: (o) => `Order #${o.orderNumber} delivered`,
  },
  RTO: {
    icon: "↩️",
    message: (o) => `Order #${o.orderNumber} marked RTO`,
  },
  RETURN_INITIATED: {
    icon: "↩️",
    message: (o) => `Return initiated for order #${o.orderNumber}`,
  },
  RETURNED: {
    icon: "↩️",
    message: (o) => `Order #${o.orderNumber} was returned`,
  },
  CANCELLED: {
    icon: "❌",
    message: (o) => `Order #${o.orderNumber} was cancelled`,
  },
  SHIPROCKET_FAILED: {
    icon: "⚠️",
    message: (o) => `Shipment creation failed for order #${o.orderNumber}`,
  },
};

export const getRecentActivities = async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const orders = await Order.find({ "items.seller": sellerId })
      .sort({ updatedAt: -1 })
      .limit(15)
      .select("orderNumber statusHistory");

    const events = [];
    for (const order of orders) {
      for (const entry of order.statusHistory || []) {
        const meta = ACTIVITY_LABELS[entry.status];
        events.push({
          _id: `${order._id}-${entry.status}-${new Date(entry.timestamp).getTime()}`,
          type: entry.status,
          message: meta
            ? meta.message(order)
            : `Order #${order.orderNumber} status: ${entry.status}`,
          icon: meta?.icon || "🔔",
          timestamp: entry.timestamp,
        });
      }
    }

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({ success: true, data: events.slice(0, 10) });
  } catch (error) {
    console.error("❌ Get activities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error.message,
    });
  }
};

// ============================================
// 15. SELLER FORGOT PASSWORD
// ============================================
export const sellerForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const seller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "No seller found with this email address",
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support.",
      });
    }

    if (seller.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Please contact support.",
      });
    }

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // ✅ Update directly with findOneAndUpdate (bypasses pre-save issues)
    await Seller.findByIdAndUpdate(seller._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 10 * 60 * 1000,
    });

    const resetUrl = `${process.env.CLIENT_URL}/seller/reset-password/${resetToken}`;

    try {
      await emailService.sendSellerResetPasswordEmail(
        seller.email,
        seller.firstName,
        resetUrl,
      );

      console.log("✅ Password reset email sent to:", seller.email);

      return res.status(200).json({
        success: true,
        message:
          "Password reset link sent to your email. Please check your inbox.",
      });
    } catch (emailError) {
      console.error("❌ Email send error:", emailError);

      // ✅ Clear token if email fails
      await Seller.findByIdAndUpdate(seller._id, {
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined,
      });

      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
};

// ============================================
// 16. SELLER RESET PASSWORD
// ============================================
export const sellerResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide password and confirm password",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const seller = await Seller.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Seller.findByIdAndUpdate(seller._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    });

    try {
      await emailService.sendSellerPasswordResetConfirmation(
        seller.email,
        seller.firstName,
      );
      console.log("✅ Password reset confirmation sent to:", seller.email);
    } catch (emailError) {
      console.error("❌ Confirmation email error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// ============================================
// 17. UPDATE SELLER PICKUP ADDRESS — ✅ REWRITTEN
//
// Two-phase, per the required architecture:
//   Phase A: validate + save locally. This ALWAYS succeeds or fails on
//            its own terms (validation / DB error) — Shiprocket cannot
//            touch this phase.
//   Phase B: attempt Shiprocket sync. Failure here is recorded on the
//            seller doc (shiprocketSyncStatus/shiprocketSyncError) but
//            NEVER rolls back or blocks Phase A, and the HTTP response
//            is still 200/success:true — the address WAS saved.
// ============================================
export const updateSellerPickupAddress = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const {
      contactName,
      contactPhone,
      contactEmail,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
    } = req.body;

    // ---- PHASE A.1: VALIDATE ----
    if (
      !contactName ||
      !contactPhone ||
      !addressLine1 ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Contact name, phone, address line 1, city, state and pincode are all required",
      });
    }
    if (!isValidIndianPincode(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit pickup pincode",
      });
    }
    const phoneCheck = normalizePhoneNumber(contactPhone);
    if (!phoneCheck.valid) {
      return res.status(400).json({
        success: false,
        message:
          phoneCheck.reason || "Please enter a valid contact phone number",
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // ---- PHASE A.2: DETECT REAL CONTENT CHANGE (drives nickname revision) ----
    const prev =
      seller.pickupAddress?.toObject?.() || seller.pickupAddress || {};
    const normalizedNew = {
      contactName: contactName.trim(),
      contactPhone: phoneCheck.e164,
      contactEmail: (contactEmail || "").trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || "").trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: (country || "India").trim(),
    };
    const addressChanged =
      prev.addressLine1 !== normalizedNew.addressLine1 ||
      prev.addressLine2 !== normalizedNew.addressLine2 ||
      prev.city !== normalizedNew.city ||
      prev.state !== normalizedNew.state ||
      prev.pincode !== normalizedNew.pincode ||
      prev.country !== normalizedNew.country ||
      prev.contactPhone !== normalizedNew.contactPhone;

    const prevRevision = prev.pickupLocationRevision || 0;
    const nextRevision =
      addressChanged || !prev.shiprocketPickupLocationName
        ? prevRevision + 1
        : prevRevision;

    // ---- PHASE A.3: SAVE LOCALLY — THIS IS THE SOURCE OF TRUTH ----
    seller.pickupAddress = {
      ...normalizedNew,
      shiprocketPickupLocationName: addressChanged
        ? null
        : prev.shiprocketPickupLocationName || null,
      isRegisteredWithShiprocket: addressChanged
        ? false
        : !!prev.isRegisteredWithShiprocket,
      shiprocketSyncStatus: addressChanged
        ? "not_synced"
        : prev.shiprocketSyncStatus || "not_synced",
      shiprocketSyncError: addressChanged
        ? null
        : prev.shiprocketSyncError || null,
      pickupLocationRevision: nextRevision,
      lastSyncAttemptAt: prev.lastSyncAttemptAt || null,
      lastSyncedAt: addressChanged ? null : prev.lastSyncedAt || null,
    };

    await seller.save();
    console.log(
      "✅ Pickup address saved locally for seller:",
      seller._id.toString(),
    );

    // ---- PHASE B: ATTEMPT SHIPROCKET SYNC — FAILURE HERE NEVER UNDOES PHASE A ----
    const syncResult = await syncSellerPickupWithShiprocket(seller);

    return res.status(200).json({
      success: true,
      message: syncResult.success
        ? "Pickup address saved and synced with Shiprocket."
        : "Pickup address saved successfully. Shiprocket synchronization failed — you can retry anytime from this page.",
      data: {
        pickupAddress: seller.pickupAddress,
        shiprocketSync: syncResult,
      },
    });
  } catch (error) {
    // Only genuine local failures (validation already handled above, so
    // this is really DB/unexpected errors) land here.
    console.error("❌ Update pickup address error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save pickup address",
      error: error.message,
    });
  }
};

// ✅ NEW — retry Shiprocket sync using whatever is already saved locally.
// The seller never has to retype the address to retry.
export const retrySellerPickupSync = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    if (!seller.pickupAddress?.addressLine1) {
      return res.status(400).json({
        success: false,
        message: "No pickup address saved yet. Please add one first.",
      });
    }

    const syncResult = await syncSellerPickupWithShiprocket(seller);

    return res.status(200).json({
      success: true,
      message: syncResult.success
        ? "Pickup address synced with Shiprocket."
        : "Shiprocket synchronization failed again. You can retry later.",
      data: {
        pickupAddress: seller.pickupAddress,
        shiprocketSync: syncResult,
      },
    });
  } catch (error) {
    console.error("❌ Retry pickup sync error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retry Shiprocket synchronization",
      error: error.message,
    });
  }
};

// ✅ NEW — shared by save + retry. Mutates and persists `seller`.
// Idempotent by design: reuses the existing nickname (tied to
// pickupLocationRevision) so repeated calls never create duplicate
// Shiprocket pickup locations. An "already exists" response from
// Shiprocket for that nickname is treated as a successful registration.
async function syncSellerPickupWithShiprocket(seller) {
  const addr = seller.pickupAddress;
  seller.pickupAddress.shiprocketSyncStatus = "pending";
  seller.pickupAddress.lastSyncAttemptAt = new Date();
  await seller.save();

  const nickname =
    addr.shiprocketPickupLocationName ||
    buildPickupLocationNickname(seller, addr.pickupLocationRevision || 1);
  const shiprocketPhone = (addr.contactPhone || "")
    .replace(/\D/g, "")
    .slice(-10);

  try {
    await shiprocketService.addPickupLocation({
      pickup_location: nickname,
      name: addr.contactName,
      email: addr.contactEmail || seller.email || "",
      phone: shiprocketPhone,
      address: addr.addressLine1,
      address_2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      country: addr.country || "India",
      pin_code: addr.pincode,
    });

    seller.pickupAddress.shiprocketPickupLocationName = nickname;
    seller.pickupAddress.isRegisteredWithShiprocket = true;
    seller.pickupAddress.shiprocketSyncStatus = "synced";
    seller.pickupAddress.shiprocketSyncError = null;
    seller.pickupAddress.lastSyncedAt = new Date();
    await seller.save();

    console.log(
      "✅ Shiprocket pickup location synced for seller:",
      seller._id.toString(),
      nickname,
    );
    return { success: true, pickupLocationName: nickname };
  } catch (shiprocketErr) {
    console.error(
      "❌ Shiprocket addPickupLocation failed:",
      shiprocketErr.message,
      shiprocketErr.details || "",
    );

    if (isAlreadyExistsError(shiprocketErr)) {
      seller.pickupAddress.shiprocketPickupLocationName = nickname;
      seller.pickupAddress.isRegisteredWithShiprocket = true;
      seller.pickupAddress.shiprocketSyncStatus = "synced";
      seller.pickupAddress.shiprocketSyncError = null;
      seller.pickupAddress.lastSyncedAt = new Date();
      await seller.save();
      console.log(
        "✅ Shiprocket pickup location already existed — reconciled as synced:",
        nickname,
      );
      return { success: true, pickupLocationName: nickname, reconciled: true };
    }

    seller.pickupAddress.shiprocketSyncStatus = "failed";
    seller.pickupAddress.shiprocketSyncError =
      shiprocketErr.message ||
      "Could not register this address with Shiprocket";
    seller.pickupAddress.isRegisteredWithShiprocket = false;
    await seller.save();

    return { success: false, error: seller.pickupAddress.shiprocketSyncError };
  }
}
