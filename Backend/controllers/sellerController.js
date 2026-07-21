// Backend/controllers/sellerController.js

import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import otpService from "../services/otpService.js";
import emailService from "../services/emailService.js";
import cloudinaryService from "../services/cloudinaryService.js";

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
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check existing seller
    let existingSeller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isVerified: true,
    });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller already exists with this email",
      });
    }

    existingSeller = await Seller.findOne({
      phone,
      isVerified: true,
    });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Seller already exists with this phone number",
      });
    }

    // Check temporary seller
    let tempSeller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isVerified: false,
    });

    if (tempSeller) {
      // Update existing temp seller
      tempSeller.firstName = firstName.trim();
      tempSeller.lastName = lastName.trim();
      tempSeller.fullName = `${firstName} ${lastName}`.trim();
      tempSeller.phone = phone.trim();
      tempSeller.password = password;
      tempSeller.storeInfo.storeName = storeName.trim();
      tempSeller.storeInfo.storeSlug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      tempSeller.storeInfo.website = website || "";
      tempSeller.storeInfo.socialLinks = socialLinks || {};
      tempSeller.brandName = brandName || "";
      tempSeller.businessDescription = businessDescription || "";
      tempSeller.productCategories = productCategories || [];
      tempSeller.businessAddress = {
        street: businessAddress?.street || "",
        city: businessAddress?.city || "",
        state: businessAddress?.state || "",
        pincode: businessAddress?.pincode || "",
        country: businessAddress?.country || "Switzerland",
      };
      tempSeller.bankDetails = {
        accountHolderName: bankDetails?.accountHolderName || "",
        bankName: bankDetails?.bankName || "",
        accountNumber: bankDetails?.accountNumber || "",
        ifscCode: bankDetails?.ifscCode || "",
        upiId: bankDetails?.upiId || "",
      };
      tempSeller.documents.panNumber = panNumber?.trim().toUpperCase() || "";
      tempSeller.documents.aadhaarNumber = aadhaarNumber?.trim() || "";
      tempSeller.documents.gstNumber = gstNumber?.trim().toUpperCase() || null;
      tempSeller.verification.termsAccepted = termsAccepted || false;
      tempSeller.verification.termsAcceptedAt = termsAccepted
        ? new Date()
        : null;
      tempSeller.verification.kycStatus = "pending";
      tempSeller.status = "pending";

      await tempSeller.save();
      console.log("✅ Temporary seller updated:", tempSeller._id);
    } else {
      // Create new temporary seller
      const sellerData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password,
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
        verification: {
          termsAccepted: termsAccepted || false,
          termsAcceptedAt: termsAccepted ? new Date() : null,
          kycStatus: "pending",
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
      console.log("✅ Temporary seller created:", seller._id);
      tempSeller = seller;
    }

    // Generate email OTP (our own app-generated code, emailed manually)
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    await tempSeller.setEmailOTP(emailOTP);
    await otpService.sendOTP(email, "email", emailOTP);
    console.log("✅ Email OTP sent to:", email);

    // ✅ Phone OTP is fully owned by Twilio Verify — it generates,
    // sends, and stores the code on Twilio's side. We don't generate
    // or store our own code for phone anymore.
    const phoneOtpResult = await otpService.sendOTP(phone, "phone");

    if (!phoneOtpResult.success) {
      console.error("❌ Failed to send phone OTP:", phoneOtpResult.error);

      return res.status(500).json({
        success: false,
        message: "Failed to send phone OTP",
      });
    }

    console.log("✅ Phone OTP sent:", phone);

    return res.status(201).json({
      success: true,
      message: "OTP sent! Please verify your email and phone.",
      data: {
        _id: tempSeller._id,
        email: tempSeller.email,
        phone: tempSeller.phone,
        emailVerified: tempSeller.emailVerified,
        phoneVerified: tempSeller.phoneVerified,
        status: tempSeller.status,
      },
      requiresVerification: {
        email: !tempSeller.emailVerified,
        phone: !tempSeller.phoneVerified,
      },
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
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const seller = await Seller.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    }).select("+otp.email.code +otp.email.expiresAt");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const result = await seller.verifyEmailOTP(otp);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    await seller.save();

    // Check if both verified
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
// 3. VERIFY PHONE OTP
// ============================================
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const seller = await Seller.findOne({ phone });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone already verified",
      });
    }

    // ✅ Verify against Twilio, not our own DB — Twilio owns this OTP
    const isValid = await otpService.verifyPhoneOTP(phone, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    seller.phoneVerified = true;
    await seller.save();

    // Check if both verified
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
// 4. RESEND OTP
// ============================================
export const resendOTP = async (req, res) => {
  try {
    const { contact, type } = req.body;

    if (!contact || !type) {
      return res.status(400).json({
        success: false,
        message: "Contact and type are required",
      });
    }

    let seller;
    if (type === "email") {
      seller = await Seller.findOne({
        email: { $regex: new RegExp(`^${contact}$`, "i") },
      });
    } else if (type === "phone") {
      seller = await Seller.findOne({ phone: contact });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use email or phone",
      });
    }

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (type === "email" && seller.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    if (type === "phone" && seller.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone already verified",
      });
    }

    if (type === "email") {
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await seller.setEmailOTP(newOTP);
      await otpService.sendOTP(contact, "email", newOTP);
    } else if (type === "phone") {
      // ✅ Twilio generates and owns the phone code — don't create one ourselves
      await otpService.sendOTP(contact, "phone");
    }

    return res.status(200).json({
      success: true,
      message: `OTP resent to ${type} successfully`,
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
    }).select("+password");

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

    const isPasswordValid = await seller.comparePassword(password);
    if (!isPasswordValid) {
      await seller.addLoginHistory(req.ip, req.headers["user-agent"], false);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await seller.addLoginHistory(req.ip, req.headers["user-agent"], true);

    const { accessToken, refreshToken } = generateTokens(seller._id);

    seller.refreshToken = refreshToken;
    seller.refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await seller.save();

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
      kycStatus: seller.verification?.kycStatus || "not_submitted",
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
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: seller,
    });
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

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// ============================================
// 8. REFRESH SELLER TOKEN
// ============================================
export const refreshSellerToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.sellerRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const seller = await Seller.findById(decoded.id);

    if (!seller || seller.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
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
// 9. GET SELLER DASHBOARD
// ============================================
export const getSellerDashboard = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
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
      kycStatus: seller.verification?.kycStatus || "not_submitted",
      emailVerified: seller.emailVerified,
      phoneVerified: seller.phoneVerified,
    };

    return res.status(200).json({
      success: true,
      data: stats,
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

    return res.status(200).json({
      success: true,
      data: orders,
    });
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
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
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
    const { panNumber, aadhaarNumber, gstNumber } = req.body;
    const files = req.files;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Validate PAN
    if (!panNumber) {
      return res.status(400).json({
        success: false,
        message: "PAN number is required",
      });
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

    // Validate Aadhaar
    if (!aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar number is required",
      });
    }

    const cleanAadhaar = aadhaarNumber.trim().replace(/\s/g, "");
    if (cleanAadhaar.length !== 12 || !/^[0-9]{12}$/.test(cleanAadhaar)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 12-digit Aadhaar number",
      });
    }

    // Check if PAN already exists
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

    // Upload documents to Cloudinary
    const uploadResults = {};
    const documentFields = ["panCard", "aadhaarCard", "gstCertificate"];

    for (const field of documentFields) {
      if (files && files[field] && files[field][0]) {
        const result = await cloudinaryService.uploadFile(
          files[field][0].path,
          `sellers/${sellerId}/documents`,
        );
        if (result.success) {
          uploadResults[field] = result.url;
          seller.documents[field] = result.url;
        }
      }
    }

    // Update documents
    seller.documents.panNumber = cleanPan;
    seller.documents.aadhaarNumber = cleanAadhaar;
    seller.documents.gstNumber = gstNumber
      ? gstNumber.trim().toUpperCase()
      : null;

    seller.verification.kycStatus = "submitted";
    seller.verification.kycSubmittedAt = new Date();
    seller.status = "under_review";

    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Documents uploaded successfully! Your KYC is under review.",
      data: {
        documents: seller.documents,
        kycStatus: seller.verification.kycStatus,
        status: seller.status,
      },
    });
  } catch (error) {
    console.error("❌ Document upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Document upload failed",
      error: error.message,
    });
  }
};

// ============================================
// 13. VERIFY PAN CARD (Admin)
// ============================================
export const verifyPanCard = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, reason } = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (status === "verified") {
      seller.documents.panVerified = true;
      seller.verification.documentStatus.panCard = "verified";
    } else if (status === "rejected") {
      seller.documents.panVerified = false;
      seller.verification.documentStatus.panCard = "rejected";
      if (reason) seller.verification.kycRejectionReason = reason;
    }

    await seller.save();

    return res.status(200).json({
      success: true,
      message: `PAN card ${status} successfully`,
      data: {
        panVerified: seller.documents.panVerified,
        documentStatus: seller.verification.documentStatus,
      },
    });
  } catch (error) {
    console.error("❌ PAN verification error:", error);
    return res.status(500).json({
      success: false,
      message: "PAN verification failed",
      error: error.message,
    });
  }
};

// ============================================
// 14. VERIFY AADHAAR CARD (Admin)
// ============================================
export const verifyAadhaarCard = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { status, reason } = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (status === "verified") {
      seller.documents.aadhaarVerified = true;
      seller.verification.documentStatus.aadhaarCard = "verified";
    } else if (status === "rejected") {
      seller.documents.aadhaarVerified = false;
      seller.verification.documentStatus.aadhaarCard = "rejected";
      if (reason) seller.verification.kycRejectionReason = reason;
    }

    await seller.save();

    return res.status(200).json({
      success: true,
      message: `Aadhaar card ${status} successfully`,
      data: {
        aadhaarVerified: seller.documents.aadhaarVerified,
        documentStatus: seller.verification.documentStatus,
      },
    });
  } catch (error) {
    console.error("❌ Aadhaar verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Aadhaar verification failed",
      error: error.message,
    });
  }
};

// ============================================
// 15. GET VERIFICATION STATUS
// ============================================
export const getVerificationStatus = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select(
      "documents verification status emailVerified phoneVerified",
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        emailVerified: seller.emailVerified,
        phoneVerified: seller.phoneVerified,
        panVerified: seller.documents?.panVerified || false,
        aadhaarVerified: seller.documents?.aadhaarVerified || false,
        kycStatus: seller.verification?.kycStatus || "not_submitted",
        documentStatus: seller.verification?.documentStatus || {},
        status: seller.status,
        isVerified: seller.isVerified,
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
// 16. GET RECENT ACTIVITIES
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

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("❌ Get activities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get activities",
      error: error.message,
    });
  }
};
