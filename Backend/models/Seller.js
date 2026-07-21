import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
        if (this.firstName && this.lastName) {
          return `${this.firstName} ${this.lastName}`.trim();
        }
        return this.firstName || this.lastName || "";
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
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
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
    // BUSINESS ADDRESS
    // ============================================
    businessAddress: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, default: "Switzerland" },
    },

    // ============================================
    // DOCUMENTS - PAN, AADHAAR, GST
    // ============================================
    documents: {
      panNumber: {
        type: String,
        trim: true,
        match: [
          /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
          "Please enter a valid PAN number",
        ],
      },
      panCard: { type: String, default: null },
      panVerified: { type: Boolean, default: false },

      aadhaarNumber: {
        type: String,
        trim: true,
        match: [/^[0-9]{12}$/, "Please enter a valid 12-digit Aadhaar number"],
      },
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
      accountHolderName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      upiId: { type: String, trim: true },
      swiftCode: { type: String, trim: true },
      iban: { type: String, trim: true },
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
      },
      storeBanner: { type: String, default: null },
      storeLogo: { type: String, default: null },
      socialLinks: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        twitter: { type: String, trim: true },
        youtube: { type: String, trim: true },
        linkedin: { type: String, trim: true },
      },
      website: { type: String, trim: true },
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
      courierPreference: { type: String, trim: true },
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
    // KYC — fully independent from account status/isVerified.
    // Only ever changed by: seller submitting documents, or an
    // admin explicitly approving/rejecting KYC via updateKycStatus().
    // NEVER touched by account approval/suspension logic.
    // ============================================
    kyc: {
      status: {
        type: String,
        enum: [
          "not_submitted", // seller has never submitted anything
          "submitted", // seller submitted, awaiting admin review
          "under_review", // admin has started reviewing
          "verified", // admin approved
          "rejected", // admin rejected
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
    statusReason: { type: String, trim: true },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    statusUpdatedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectedReason: { type: String, trim: true },
    suspendedAt: { type: Date },
    suspendedReason: { type: String, trim: true },
    suspendedUntil: { type: Date },

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
        ipAddress: { type: String },
        userAgent: { type: String },
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
// PRE-SAVE MIDDLEWARE
// ============================================
sellerSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (
    this.isModified("firstName") ||
    this.isModified("lastName") ||
    !this.fullName
  ) {
    if (this.firstName && this.lastName) {
      this.fullName = `${this.firstName} ${this.lastName}`.trim();
    } else if (this.firstName) {
      this.fullName = this.firstName;
    } else if (this.lastName) {
      this.fullName = this.lastName;
    }
  }

  if (this.storeInfo?.storeName && !this.storeInfo.storeSlug) {
    this.storeInfo.storeSlug = this.storeInfo.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (!this.email && !this.phone) {
    throw new Error("User must have either email or phone");
  }
});

// ============================================
// INDEXES
// ============================================
sellerSchema.index({ email: 1 });
sellerSchema.index({ phone: 1 });
sellerSchema.index({ "storeInfo.storeName": 1 });
sellerSchema.index({ "storeInfo.storeSlug": 1 });
sellerSchema.index({ status: 1, isActive: 1 });
sellerSchema.index({ "kyc.status": 1 });
sellerSchema.index({ "documents.panNumber": 1 });
sellerSchema.index({ "documents.aadhaarNumber": 1 });

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
// METHODS
// ============================================

sellerSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

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

/**
 * Update ACCOUNT status (login access). Does NOT touch KYC —
 * use updateKycStatus() separately for that.
 */
sellerSchema.methods.updateStatus = async function (
  status,
  reason = null,
  updatedBy = null,
) {
  this.status = status;
  this.statusUpdatedAt = new Date();
  this.statusUpdatedBy = updatedBy;

  if (reason) {
    this.statusReason = reason;
  }

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

/**
 * Update KYC status — completely separate from account approval.
 */
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
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
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
