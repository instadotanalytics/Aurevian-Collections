// backend/models/Seller.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const sellerSchema = new mongoose.Schema(
  {
    // ============================================
    // BASIC INFORMATION
    // ============================================
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: function () {
        return `${this.firstName || ""} ${this.lastName || ""}`.trim();
      },
    },
    brandName: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    businessLogo: {
      type: String,
      default: null,
    },
    businessDescription: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // ============================================
    // CONTACT DETAILS
    // ============================================
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    customerSupportNumber: {
      type: String,
      trim: true,
    },

    // ============================================
    // OTP VERIFICATION
    // ============================================
    otp: {
      email: {
        code: { type: String, select: false },
        expiresAt: { type: Date, select: false },
        verified: { type: Boolean, default: false },
      },
      phone: {
        code: { type: String, select: false },
        expiresAt: { type: Date, select: false },
        verified: { type: Boolean, default: false },
      },
    },

    // ============================================
    // PASSWORD RESET
    // ============================================
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },

    // ============================================
    // BUSINESS ADDRESS
    // ============================================
    businessAddress: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
      country: { type: String, default: "Switzerland" },
    },

    // ============================================
    // DOCUMENTS
    // ============================================
    documents: {
      panNumber: { type: String, trim: true, default: "" },
      panCard: { type: String, default: null },
      panVerified: { type: Boolean, default: false },
      aadhaarNumber: { type: String, trim: true, default: "" },
      aadhaarCard: { type: String, default: null },
      aadhaarVerified: { type: Boolean, default: false },
      gstNumber: { type: String, trim: true, default: null },
      gstCertificate: { type: String, default: null },
      businessRegistrationCertificate: { type: String, default: null },
      tradeLicense: { type: String, default: null },
      cancelledCheque: { type: String, default: null },
      bankStatement: { type: String, default: null },
      selfieWithId: { type: String, default: null },
      idProofFront: { type: String, default: null },
      idProofBack: { type: String, default: null },
    },

    // ============================================
    // BANK DETAILS
    // ============================================
    bankDetails: {
      accountHolderName: { type: String, trim: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifscCode: { type: String, trim: true, default: "" },
      upiId: { type: String, trim: true, default: "" },
      swiftCode: { type: String, trim: true, default: "" },
      iban: { type: String, trim: true, default: "" },
    },

    // ============================================
    // STORE INFORMATION
    // ============================================
    storeInfo: {
      storeName: {
        type: String,
        required: [true, "Store name is required"],
        trim: true,
        unique: true,
      },
      storeSlug: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        default: function () {
          return (
            this.storeName?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || ""
          );
        },
      },
      storeBanner: { type: String, default: null },
      storeLogo: { type: String, default: null },
      socialLinks: {
        facebook: { type: String, trim: true, default: "" },
        instagram: { type: String, trim: true, default: "" },
        twitter: { type: String, trim: true, default: "" },
        youtube: { type: String, trim: true, default: "" },
        linkedin: { type: String, trim: true, default: "" },
      },
      website: { type: String, trim: true, default: "" },
    },

    // ============================================
    // PRODUCT CATEGORIES
    // ============================================
    productCategories: [
      {
        type: String,
        enum: [
          "jewelry",
          "rings",
          "necklaces",
          "earrings",
          "bracelets",
          "watches",
          "perfume",
          "sunglasses",
          "bags",
          "other",
        ],
      },
    ],
    customCategories: [{ type: String, trim: true }],

    // ============================================
    // SHIPPING DETAILS
    // ============================================
    shippingDetails: {
      courierPreference: { type: String, trim: true, default: "" },
      processingTime: {
        type: String,
        enum: ["1-2 days", "2-3 days", "3-5 days", "5-7 days"],
        default: "2-3 days",
      },
      returnAccepted: { type: Boolean, default: true },
      returnDays: { type: Number, default: 7 },
      shippingCharges: { type: Number, default: 0 },
      freeShippingLimit: { type: Number, default: 0 },
      internationalShipping: { type: Boolean, default: false },
    },

    // ============================================
    // KYC
    // ============================================
    kyc: {
      status: {
        type: String,
        enum: [
          "not_submitted",
          "submitted",
          "under_review",
          "verified",
          "rejected",
        ],
        default: "not_submitted",
      },
      submittedAt: { type: Date, default: null },
      reviewedAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      rejectedAt: { type: Date, default: null },
      rejectionReason: { type: String, trim: true, default: null },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SuperAdmin",
        default: null,
      },
      documentStatus: {
        panCard: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        aadhaarCard: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
        gstCertificate: {
          type: String,
          enum: ["pending", "verified", "rejected", "not_required"],
          default: "not_required",
        },
        bankDetails: {
          type: String,
          enum: ["pending", "verified", "rejected"],
          default: "pending",
        },
      },
      termsAccepted: { type: Boolean, default: false },
      termsAcceptedAt: { type: Date, default: null },
    },

    // ============================================
    // SELLER STATS
    // ============================================
    stats: {
      totalProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0 },
      walletBalance: { type: Number, default: 0 },
      pendingOrders: { type: Number, default: 0 },
      processingOrders: { type: Number, default: 0 },
      shippedOrders: { type: Number, default: 0 },
      deliveredOrders: { type: Number, default: 0 },
    },

    // ============================================
    // SUBSCRIPTION
    // ============================================

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    // ✅ NEW: exact plan tracking (drives the Upgrade page's "current plan" state)
    subscriptionPlanId: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      default: "free",
    },

    sellerLevel: {
      type: String,
      enum: ["basic", "pro", "business"],
      default: "basic",
    },

    isSuperSeller: {
      type: Boolean,
      default: false,
    },

    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "expired", "cancelled"],
      default: "inactive",
    },

    subscriptionStartedAt: {
      type: Date,
      default: null,
    },

    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },

    // ============================================
    // ACCOUNT STATUS
    // ============================================
    role: {
      type: String,
      enum: ["seller", "admin", "super_admin"],
      default: "seller",
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "under_review"],
      default: "pending",
    },
    statusReason: { type: String, trim: true, default: null },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      default: null,
    },
    statusUpdatedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectedReason: { type: String, trim: true, default: null },
    suspendedAt: { type: Date, default: null },
    suspendedReason: { type: String, trim: true, default: null },
    suspendedUntil: { type: Date, default: null },

    // ============================================
    // AUTHENTICATION
    // ============================================
    password: {
      type: String,
      select: false,
    },
    lastLogin: { type: Date, default: null },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String, default: "" },
        userAgent: { type: String, default: "" },
        success: { type: Boolean, default: true },
      },
    ],
    refreshToken: { type: String, select: false },
    refreshTokenExpiry: { type: Date, select: false },

    // ============================================
    // PREFERENCES
    // ============================================
    preferences: {
      language: { type: String, default: "en" },
      currency: { type: String, default: "CHF" },
      notifications: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    },

    // ============================================
    // TIMESTAMPS
    // ============================================
    registrationDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============================================
// INDEXES
// ============================================
// NOTE: email, phone, storeInfo.storeName, and storeInfo.storeSlug all already
// declare `unique: true` on their field definitions above, which auto-creates
// their indexes. The old explicit index calls for those four fields have been
// removed to stop the duplicate-index warnings. Only non-unique compound/
// lookup indexes remain below.
sellerSchema.index({ status: 1, isActive: 1 });
sellerSchema.index({ "kyc.status": 1 });
sellerSchema.index({ "documents.panNumber": 1 });
sellerSchema.index({ "documents.aadhaarNumber": 1 });
sellerSchema.index({ subscriptionPlanId: 1, subscriptionStatus: 1 });

// ============================================
// VIRTUALS
// ============================================
sellerSchema.virtual("displayName").get(function () {
  return (
    this.fullName ||
    `${this.firstName || ""} ${this.lastName || ""}`.trim() ||
    "Seller"
  );
});

sellerSchema.virtual("initials").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase();
  }
  return this.firstName?.[0]?.toUpperCase() || "S";
});

// ============================================
// ✅ GET RESET PASSWORD TOKEN
// ============================================
sellerSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// ============================================
// ✅ COMPARE PASSWORD
// ============================================
sellerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// ============================================
// OTP METHODS
// ============================================
sellerSchema.methods.setEmailOTP = function (otpCode, expiryMinutes = 10) {
  this.otp.email.code = otpCode;
  this.otp.email.expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  this.otp.email.verified = false;
  return this.save();
};

sellerSchema.methods.setPhoneOTP = function (otpCode, expiryMinutes = 10) {
  this.otp.phone.code = otpCode;
  this.otp.phone.expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  this.otp.phone.verified = false;
  return this.save();
};

sellerSchema.methods.verifyEmailOTP = function (otpCode) {
  if (!this.otp.email.code) return false;
  if (this.otp.email.code !== otpCode) return false;
  if (this.otp.email.expiresAt < new Date()) return false;
  this.otp.email.verified = true;
  this.emailVerified = true;
  this.otp.email.code = undefined;
  this.otp.email.expiresAt = undefined;
  return true;
};

sellerSchema.methods.verifyPhoneOTP = function (otpCode) {
  if (!this.otp.phone.code) return false;
  if (this.otp.phone.code !== otpCode) return false;
  if (this.otp.phone.expiresAt < new Date()) return false;
  this.otp.phone.verified = true;
  this.phoneVerified = true;
  this.otp.phone.code = undefined;
  this.otp.phone.expiresAt = undefined;
  return true;
};

// ============================================
// STATUS METHODS
// ============================================
sellerSchema.methods.updateStatus = async function (
  status,
  reason = null,
  updatedBy = null,
) {
  this.status = status;
  this.statusUpdatedAt = new Date();
  this.statusUpdatedBy = updatedBy;
  if (reason) this.statusReason = reason;

  if (status === "approved") {
    this.isVerified = true;
    this.isActive = true;
    this.approvedAt = new Date();
  } else if (status === "rejected") {
    this.isVerified = false;
    this.isActive = false;
    this.rejectedAt = new Date();
    if (reason) this.rejectedReason = reason;
  } else if (status === "suspended") {
    this.isActive = false;
    this.suspendedAt = new Date();
    this.suspendedReason = reason;
  } else if (status === "pending") {
    this.isActive = true;
    this.isVerified = false;
  }
  return this.save();
};

sellerSchema.methods.updateKycStatus = async function (
  status,
  reason = null,
  reviewedBy = null,
) {
  this.kyc.status = status;
  this.kyc.reviewedAt = new Date();
  this.kyc.reviewedBy = reviewedBy;

  if (status === "verified") {
    this.kyc.verifiedAt = new Date();
    this.kyc.rejectionReason = null;
    this.kyc.documentStatus.panCard = "verified";
    this.kyc.documentStatus.aadhaarCard = "verified";
    if (this.documents?.gstNumber)
      this.kyc.documentStatus.gstCertificate = "verified";
    this.kyc.documentStatus.bankDetails = "verified";
  } else if (status === "rejected") {
    this.kyc.rejectedAt = new Date();
    this.kyc.rejectionReason = reason || "Documents did not pass verification";
  }
  return this.save();
};

// ============================================
// LOGIN HISTORY
// ============================================
sellerSchema.methods.addLoginHistory = async function (
  ipAddress,
  userAgent,
  success = true,
) {
  this.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    success,
  });
  if (this.loginHistory.length > 50)
    this.loginHistory = this.loginHistory.slice(-50);
  this.lastLogin = success ? new Date() : this.lastLogin;
  return this.save();
};

sellerSchema.methods.updateStats = async function (data) {
  if (data.totalProducts !== undefined)
    this.stats.totalProducts += data.totalProducts;
  if (data.totalOrders !== undefined)
    this.stats.totalOrders += data.totalOrders;
  if (data.totalRevenue !== undefined)
    this.stats.totalRevenue += data.totalRevenue;
  if (data.totalSales !== undefined) this.stats.totalSales += data.totalSales;
  return this.save();
};

// ============================================
// ✅ NO PRE-SAVE MIDDLEWARE - ALL HANDLED IN CONTROLLER
// ============================================

// ============================================
// STATIC METHODS
// ============================================
sellerSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
};

sellerSchema.statics.findByPan = function (panNumber) {
  return this.findOne({ "documents.panNumber": panNumber });
};

sellerSchema.statics.findByAadhaar = function (aadhaarNumber) {
  return this.findOne({ "documents.aadhaarNumber": aadhaarNumber });
};

sellerSchema.statics.getPendingSellers = function () {
  return this.find({ status: "pending" }).sort({ createdAt: 1 });
};

sellerSchema.statics.getApprovedSellers = function () {
  return this.find({ status: "approved", isActive: true });
};

sellerSchema.statics.getPendingKycSellers = function () {
  return this.find({
    "kyc.status": { $in: ["submitted", "under_review"] },
  }).sort({ "kyc.submittedAt": 1 });
};

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;
