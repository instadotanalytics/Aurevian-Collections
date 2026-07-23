// backend/models/User.js

import mongoose from "mongoose";
import validator from "validator";

// ============================================
// ADDRESS SUB SCHEMA
// ============================================

const addressSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    addressType: {
      type: String,
      enum: ["Home", "Work", "Office", "Other"],
      default: "Home",
      set: (v) =>
        v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v,
    },

    house: {
      type: String,
      required: true,
      trim: true,
    },

    apartment: {
      type: String,
      default: "",
      trim: true,
    },

    street: {
      type: String,
      required: true,
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryInstructions: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ============================================
// MAIN USER SCHEMA
// ============================================

const userSchema = new mongoose.Schema(
  {
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
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    firebaseUid: {
      type: String,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ["google", "email", "phone"],
      default: "email",
    },
    password: {
      type: String,
      select: false,
    },
    profileImage: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "seller", "super_admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    profileCompletion: {
      type: Number,
      default: 20,
    },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: { type: String },
        userAgent: { type: String },
        success: { type: Boolean, default: true },
      },
    ],
    otp: {
      code: { type: String },
      type: { type: String, enum: ["email", "phone", "forgot_password"] },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: ["order", "promotion", "system", "welcome"],
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        link: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      orderUpdates: {
        type: Boolean,
        default: true,
      },
      promotionalEmails: {
        type: Boolean,
        default: false,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
      darkMode: {
        type: Boolean,
        default: false,
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: "en",
      },
      currency: {
        type: String,
        default: "INR",
      },
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ============================================
// INDEXES
// ============================================
// NOTE: firebaseUid already declares `unique: true` on the field itself above,
// which auto-creates its index — the old explicit userSchema.index({ firebaseUid: 1 })
// call has been removed to stop the duplicate-index warning.
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ phone: 1 }, { sparse: true });

// ============================================
// VIRTUALS
// ============================================
userSchema.virtual("initials").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
  return this.firstName?.charAt(0)?.toUpperCase() || "U";
});

userSchema.virtual("displayName").get(function () {
  return (
    this.fullName ||
    `${this.firstName || ""} ${this.lastName || ""}`.trim() ||
    "User"
  );
});

userSchema.virtual("profileImageUrl").get(function () {
  return this.profileImage?.url || this.avatar?.url || null;
});

userSchema.virtual("defaultAddress").get(function () {
  return this.addresses?.find((address) => address.isDefault);
});

// ============================================
// JSON & OBJECT CONFIGURATION
// ============================================
userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.set("toObject", {
  virtuals: true,
});

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

// Safety net: normalize any invalid/empty gender value to a valid enum option
// before the built-in validators run. This protects against legacy documents
// or any future code path that might set gender to "" or null.
userSchema.pre("validate", function () {
  if (!this.gender || this.gender.trim() === "") {
    this.gender = "Prefer not to say";
  }
});

userSchema.pre("save", function () {
  // Set fullName from firstName and lastName
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }

  // If fullName exists but firstName doesn't
  if (this.fullName && !this.firstName) {
    const parts = this.fullName.trim().split(/\s+/);
    this.firstName = parts[0] || "";
    this.lastName = parts.slice(1).join(" ");
  }

  // Calculate profile completion
  let completion = 20;

  if (this.phone) completion += 15;
  if (this.gender && this.gender !== "Prefer not to say") completion += 10;
  if (this.dateOfBirth) completion += 10;
  if (this.avatar?.url) completion += 15;
  if (this.addresses?.length) completion += 30;

  this.profileCompletion = Math.min(completion, 100);

  if (!this.memberSince) {
    this.memberSince = this.createdAt || new Date();
  }
});

// ============================================
// METHODS
// ============================================

userSchema.methods.addLoginHistory = async function (data) {
  this.loginHistory.push({
    timestamp: data.timestamp || new Date(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: data.success !== undefined ? data.success : true,
  });
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.addRefreshToken = async function (token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  if (this.refreshTokens.length > 10) {
    this.refreshTokens = this.refreshTokens.slice(-10);
  }
  return this.save();
};

userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
  return this.save();
};

userSchema.methods.clearRefreshTokens = async function () {
  this.refreshTokens = [];
  return this.save();
};

userSchema.methods.addNotification = async function (notification) {
  this.notifications.push({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link || null,
  });
  if (this.notifications.length > 100) {
    this.notifications = this.notifications.slice(-100);
  }
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByFirebaseUid = function (uid) {
  return this.findOne({ firebaseUid: uid });
};

userSchema.statics.findOrCreateFromFirebase = async function (firebaseUser) {
  try {
    console.log("🔍 Finding user with firebaseUid:", firebaseUser.uid);

    let user = await this.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      console.log("👤 User not found, creating new...");

      const nameParts = firebaseUser.displayName
        ? firebaseUser.displayName.split(" ")
        : ["User", ""];

      // Create user object without saving yet
      user = new this({
        firstName: nameParts[0] || "User",
        lastName: nameParts.slice(1).join(" ") || "",
        fullName:
          firebaseUser.displayName ||
          `${nameParts[0] || "User"} ${nameParts.slice(1).join(" ") || ""}`,
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        profileImage: {
          url: firebaseUser.photoURL || null,
          publicId: null,
        },
        avatar: {
          url: firebaseUser.photoURL || null,
          publicId: null,
        },
        authProvider: "google",
        isVerified: firebaseUser.emailVerified || false,
        emailVerified: firebaseUser.emailVerified || false,
        lastLogin: new Date(),
        memberSince: new Date(),
        profileCompletion: 20,
      });

      // Save user
      await user.save();
      console.log(`✅ New user created: ${user.email}`);

      // Add welcome notification
      await user.addNotification({
        type: "welcome",
        title: "Welcome to Aurevian Collections!",
        message: `Welcome ${user.firstName}! We're excited to have you on board.`,
        link: "/",
      });
    } else {
      console.log("👤 User found, updating...");

      // Update existing user - Fix for display name
      if (firebaseUser.displayName) {
        const parts = firebaseUser.displayName.split(" ");
        user.firstName = parts[0] || user.firstName;
        user.lastName = parts.slice(1).join(" ") || user.lastName;
        user.fullName = firebaseUser.displayName;
      }

      // Update photo every login to keep in sync with Google
      if (firebaseUser.photoURL) {
        user.profileImage = {
          url: firebaseUser.photoURL,
          publicId: user.profileImage?.publicId || null,
        };

        user.avatar = {
          url: firebaseUser.photoURL,
          publicId: user.avatar?.publicId || null,
        };
      }

      if (firebaseUser.emailVerified) {
        user.emailVerified = true;
        user.isVerified = true;
      }

      user.lastLogin = new Date();

      await user.save();
      console.log(`✅ User updated: ${user.email}`);
    }

    return user;
  } catch (error) {
    console.error("❌ Error in findOrCreateFromFirebase:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);
export default User;
