// backend/controllers/sellerController.js

import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import otpService from "../services/otpService.js";
import emailService from "../services/emailService.js";
import cloudinaryService from "../services/cloudinaryService.js";
import crypto from "crypto";

// ============================================
// GENERATE TOKENS
// ============================================
const generateTokens = (sellerId) => {
  const accessToken = jwt.sign(
    { id: sellerId, role: "seller" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: sellerId, role: "seller" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" },
  );

  return { accessToken, refreshToken };
};

// ============================================
// 1. SELLER REGISTRATION
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }

    // ✅ Check if seller exists
    let existingSeller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    
    if (existingSeller) {
      if (existingSeller.isVerified) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Seller already exists with this email",
          });
      }
      
      // ✅ If not verified, update existing unverified seller
      existingSeller.firstName = firstName.trim();
      existingSeller.lastName = lastName.trim();
      existingSeller.fullName = `${firstName} ${lastName}`.trim();
      existingSeller.phone = phone.trim();
      
      // ✅ Hash password before saving
      const salt = await bcrypt.genSalt(12);
      existingSeller.password = await bcrypt.hash(password, salt);
      
      existingSeller.storeInfo.storeName = storeName.trim();
      existingSeller.storeInfo.storeSlug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      existingSeller.status = "pending";
      
      await existingSeller.save();
      console.log("✅ Existing seller updated:", existingSeller._id);
      
      // ✅ Send OTP
      const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await existingSeller.setEmailOTP(emailOTP);
      await otpService.sendOTP(email, "email", emailOTP);
      
      return res.status(200).json({
        success: true,
        message: "OTP sent! Please verify your email.",
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
      });
    }

    // ✅ Check phone
    existingSeller = await Seller.findOne({ phone });
    if (existingSeller) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Seller already exists with this phone number",
        });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create new seller
    const sellerData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName} ${lastName}`.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword, // ✅ Store hashed password
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

    // ✅ Send OTP
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    await seller.setEmailOTP(emailOTP);
    await otpService.sendOTP(email, "email", emailOTP);
    console.log("✅ Email OTP sent to:", email);

    const phoneOtpResult = await otpService.sendOTP(phone, "phone");
    if (!phoneOtpResult.success) {
      console.error("❌ Failed to send phone OTP:", phoneOtpResult.error);
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent! Please verify your email and phone.",
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
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res
      .status(500)
      .json({
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
    return res
      .status(500)
      .json({
        success: false,
        message: "Email verification failed",
        error: error.message,
      });
  }
};

// ============================================
// 3. VERIFY PHONE OTP
// ============================================
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const seller = await Seller.findOne({ phone });

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

    const isValid = await otpService.verifyPhoneOTP(phone, otp);
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
    return res
      .status(500)
      .json({
        success: false,
        message: "Phone verification failed",
        error: error.message,
      });
  }
};

// ============================================
// 4. RESEND OTP
// ============================================
export const resendOTP = async (req, res) => {
  try {
    const { contact, type } = req.body;

    if (!contact || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Contact and type are required" });
    }

    let seller;
    if (type === "email") {
      seller = await Seller.findOne({
        email: { $regex: new RegExp(`^${contact}$`, "i") },
      });
    } else if (type === "phone") {
      seller = await Seller.findOne({ phone: contact });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid type. Use email or phone" });
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

    if (type === "email") {
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await seller.setEmailOTP(newOTP);
      await otpService.sendOTP(contact, "email", newOTP);
    } else if (type === "phone") {
      await otpService.sendOTP(contact, "phone");
    }

    return res
      .status(200)
      .json({ success: true, message: `OTP resent to ${type} successfully` });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return res
      .status(500)
      .json({
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
        message: "Email and password are required"
      });
    }

    const seller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).select("+password +refreshToken +refreshTokenExpiry");

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
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
        message: "Your account is pending approval. Please wait for verification (within 24 hours).",
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
        message: "Account is deactivated"
      });
    }

    // ✅ Compare password
    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      await seller.addLoginHistory(req.ip, req.headers["user-agent"], false);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
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
    return res
      .status(500)
      .json({
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

    return res
      .status(200)
      .json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken },
      });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to refresh token",
        error: error.message,
      });
  }
};

// ============================================
// 9. GET SELLER DASHBOARD
// ============================================
export const getSellerDashboard = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    const stats = {
      totalProducts: seller.stats?.totalProducts || 0,
      totalOrders: seller.stats?.totalOrders || 0,
      totalRevenue: seller.stats?.totalRevenue || 0,
      totalSales: seller.stats?.totalSales || 0,
      rating: seller.stats?.rating || 0,
      reviewCount: seller.stats?.reviewCount || 0,
      walletBalance: seller.stats?.walletBalance || 0,
      status: seller.status,
      isVerified: seller.isVerified,
      kycStatus: seller.kyc?.status || "not_submitted",
      emailVerified: seller.emailVerified,
      phoneVerified: seller.phoneVerified,
    };

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ Get dashboard error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to get dashboard data",
        error: error.message,
      });
  }
};

// ============================================
// 10. GET RECENT ORDERS
// ============================================
export const getRecentOrders = async (req, res) => {
  try {
    const orders = [
      {
        _id: "1",
        orderNumber: "ORD-001",
        customer: "John Doe",
        total: 299.99,
        status: "processing",
        date: new Date(),
        items: 3,
      },
      {
        _id: "2",
        orderNumber: "ORD-002",
        customer: "Jane Smith",
        total: 149.5,
        status: "shipped",
        date: new Date(Date.now() - 86400000),
        items: 2,
      },
      {
        _id: "3",
        orderNumber: "ORD-003",
        customer: "Mike Johnson",
        total: 89.99,
        status: "delivered",
        date: new Date(Date.now() - 172800000),
        items: 1,
      },
    ];

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Get orders error:", error);
    return res
      .status(500)
      .json({
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

    return res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        data: seller,
      });
  } catch (error) {
    console.error("❌ Update seller error:", error);
    return res
      .status(500)
      .json({
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
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
          success: false,
          message: "Please enter a valid 12-digit Aadhaar number",
        });
    }

    const existingPan = await Seller.findOne({
      "documents.panNumber": cleanPan,
      _id: { $ne: sellerId },
    });
    if (existingPan) {
      return res
        .status(400)
        .json({
          success: false,
          message: "PAN number already registered with another seller",
        });
    }
    const existingAadhaar = await Seller.findOne({
      "documents.aadhaarNumber": cleanAadhaar,
      _id: { $ne: sellerId },
    });
    if (existingAadhaar) {
      return res
        .status(400)
        .json({
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
    return res
      .status(500)
      .json({
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
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to get verification status",
        error: error.message,
      });
  }
};

// ============================================
// 14. GET RECENT ACTIVITIES
// ============================================
export const getRecentActivities = async (req, res) => {
  try {
    const activities = [
      {
        _id: "1",
        type: "order",
        message: "New order #ORD-004 received",
        timestamp: new Date(),
        icon: "📦",
      },
      {
        _id: "2",
        type: "product",
        message: 'Product "Gold Necklace" added',
        timestamp: new Date(Date.now() - 3600000),
        icon: "✨",
      },
      {
        _id: "3",
        type: "review",
        message: "New 5-star review received",
        timestamp: new Date(Date.now() - 7200000),
        icon: "⭐",
      },
    ];

    return res.status(200).json({ success: true, data: activities });
  } catch (error) {
    console.error("❌ Get activities error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to get activities",
        error: error.message,
      });
  }
};



// backend/controllers/sellerController.js (sellerForgotPassword function)

export const sellerForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address"
      });
    }

    const seller = await Seller.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, "i") } 
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "No seller found with this email address"
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact support."
      });
    }

    if (seller.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Please contact support."
      });
    }

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // ✅ Update directly with findOneAndUpdate (bypasses pre-save issues)
    await Seller.findByIdAndUpdate(seller._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: Date.now() + 10 * 60 * 1000
    });

    const resetUrl = `${process.env.CLIENT_URL}/seller/reset-password/${resetToken}`;

    try {
      await emailService.sendSellerResetPasswordEmail(
        seller.email,
        seller.firstName,
        resetUrl
      );
      
      console.log('✅ Password reset email sent to:', seller.email);
      
      return res.status(200).json({
        success: true,
        message: "Password reset link sent to your email. Please check your inbox."
      });
    } catch (emailError) {
      console.error('❌ Email send error:', emailError);
      
      // ✅ Clear token if email fails
      await Seller.findByIdAndUpdate(seller._id, {
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      });
      
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again."
      });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message
    });
  }
};
// ============================================
// 16. SELLER RESET PASSWORD (ADD THIS)
// ============================================
export const sellerResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide password and confirm password"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // ✅ Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // ✅ Find seller with valid token
    const seller = await Seller.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!seller) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new one."
      });
    }

    // ✅ Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Update using findByIdAndUpdate (bypasses pre-save)
    await Seller.findByIdAndUpdate(seller._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined
    });

    // ✅ Send confirmation email
    try {
      await emailService.sendSellerPasswordResetConfirmation(
        seller.email,
        seller.firstName
      );
      console.log('✅ Password reset confirmation sent to:', seller.email);
    } catch (emailError) {
      console.error('❌ Confirmation email error:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now login with your new password."
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message
    });
  }
};