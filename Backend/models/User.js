// backend/models/User.js - ULTIMATE FIX VERSION

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
      trim: true,
      required: false,
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
      set: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v,
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
      default: "User",
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      default: "User",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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
      unique: true,
      sparse: true,
      default: undefined,
      validate: {
        validator: function(v) {
          return v === undefined || v === null || v.trim().length > 0;
        },
        message: "Phone cannot be empty string",
      },
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
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

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
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

userSchema.set("toObject", {
  virtuals: true,
});

// ============================================
// ✅ FIXED PRE-VALIDATE - NO 'next' PARAMETER
// ============================================
userSchema.pre("validate", function() {
  // Ensure firstName has valid value
  if (!this.firstName || this.firstName.trim() === "") {
    this.firstName = "User";
  }
  
  // Ensure lastName has valid value
  if (!this.lastName || this.lastName.trim() === "") {
    this.lastName = "";
  }
  
  // Ensure fullName is set
  if (!this.fullName || this.fullName.trim() === "") {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
    if (this.fullName === "") {
      this.fullName = "User";
    }
  }
  
  // Ensure gender has valid value
  if (!this.gender || this.gender.trim() === "") {
    this.gender = "Prefer not to say";
  }
  
  // CRITICAL: Convert empty phone string to undefined
  if (this.phone === "" || this.phone === null) {
    this.phone = undefined;
  }
  
  if (this.phone && this.phone.trim() === "") {
    this.phone = undefined;
  }
});

// ============================================
// ✅ FIXED PRE-SAVE - NO 'next' PARAMETER
// ============================================
userSchema.pre("save", function() {
  // Set fullName from firstName and lastName
  if (this.firstName || this.lastName) {
    const firstName = this.firstName || "User";
    const lastName = this.lastName || "";
    this.fullName = `${firstName} ${lastName}`.trim();
    if (this.fullName === "") {
      this.fullName = "User";
    }
  }

  // If fullName exists but firstName doesn't
  if (this.fullName && (!this.firstName || this.firstName === "User")) {
    const parts = this.fullName.trim().split(/\s+/);
    this.firstName = parts[0] || "User";
    this.lastName = parts.slice(1).join(" ") || "";
  }

  // CRITICAL: Sanitize phone again before save
  if (this.phone === "" || this.phone === null) {
    this.phone = undefined;
  }
  
  if (this.phone && this.phone.trim() === "") {
    this.phone = undefined;
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
  
  // Ensure email is set
  if (!this.email) {
    throw new Error("Email is required");
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

userSchema.statics._updateExistingUser = async function(user, firebaseUser) {
  try {
    console.log(`🔄 Updating existing user: ${user.email}`);
    
    if (firebaseUser.displayName) {
      const parts = firebaseUser.displayName.split(" ");
      user.firstName = parts[0] || user.firstName || "User";
      user.lastName = parts.slice(1).join(" ") || user.lastName || "";
      user.fullName = firebaseUser.displayName;
    }
    
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
    
    if (user.phone === "" || user.phone === null) {
      user.phone = undefined;
    }
    
    await user.save();
    console.log(`✅ User updated: ${user.email}`);
    return user;
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    throw error;
  }
};

userSchema.statics._createNewUser = async function(firebaseUser) {
  try {
    console.log(`🆕 Creating new user for: ${firebaseUser.email || firebaseUser.uid}`);
    
    if (!firebaseUser.email) {
      throw new Error("Email is required to create a user");
    }
    
    const nameParts = firebaseUser.displayName 
      ? firebaseUser.displayName.split(" ") 
      : ["User", ""];
    
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "";
    const fullName = firebaseUser.displayName || `${firstName} ${lastName}`.trim() || "User";
    
    const user = new this({
      firstName: firstName,
      lastName: lastName,
      fullName: fullName,
      email: firebaseUser.email.toLowerCase(),
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
    
    await user.save();
    console.log(`✅ New user created: ${user.email}`);
    
    try {
      await user.addNotification({
        type: "welcome",
        title: "Welcome to Aurevian Collections!",
        message: `Welcome ${user.firstName}! We're excited to have you on board.`,
        link: "/",
      });
    } catch (notifError) {
      console.warn("⚠️ Could not add welcome notification:", notifError.message);
    }
    
    return user;
  } catch (error) {
    console.error("❌ Error creating new user:", error.message);
    throw error;
  }
};

userSchema.statics.findOrCreateFromFirebase = async function (firebaseUser, options = {}) {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔍 Finding user with firebaseUid: ${firebaseUser.uid} (attempt ${retryCount + 1}/${maxRetries})`);
      
      let user = await this.findOne({ firebaseUid: firebaseUser.uid });
      
      if (user) {
        console.log(`👤 User found by firebaseUid: ${user.email}`);
        return await this._updateExistingUser(user, firebaseUser);
      }
      
      if (firebaseUser.email) {
        user = await this.findOne({ email: firebaseUser.email.toLowerCase() });
        if (user) {
          console.log(`👤 User found by email: ${user.email}`);
          user.firebaseUid = firebaseUser.uid;
          return await this._updateExistingUser(user, firebaseUser);
        }
      }
      
      console.log("👤 User not found, creating new...");
      return await this._createNewUser(firebaseUser);
      
    } catch (error) {
      lastError = error;
      
      if (error.code === 11000) {
        console.warn(`⚠️ Duplicate key error, retrying... (attempt ${retryCount + 1}/${maxRetries})`);
        retryCount++;
        
        if (retryCount === maxRetries) {
          console.log("🔍 Attempting to find conflicting user...");
          
          let existingUser = await this.findOne({ firebaseUid: firebaseUser.uid });
          
          if (!existingUser && firebaseUser.email) {
            existingUser = await this.findOne({ email: firebaseUser.email.toLowerCase() });
          }
          
          if (existingUser) {
            console.log(`✅ Found existing user: ${existingUser.email}`);
            return await this._updateExistingUser(existingUser, firebaseUser);
          }
          
          console.log("⚠️ Could not find existing user, attempting to create with retry...");
          await new Promise(resolve => setTimeout(resolve, 100));
          
          try {
            return await this._createNewUser(firebaseUser);
          } catch (finalError) {
            if (finalError.code === 11000) {
              const finalUser = await this.findOne({ email: firebaseUser.email.toLowerCase() });
              if (finalUser) {
                console.log(`✅ Found user after final attempt: ${finalUser.email}`);
                return await this._updateExistingUser(finalUser, firebaseUser);
              }
            }
            throw finalError;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      } else {
        console.error("❌ Error in findOrCreateFromFirebase:", error.message);
        console.error("Stack:", error.stack);
        throw error;
      }
    }
  }
  
  throw lastError || new Error("Failed to create or find user after multiple attempts");
};

const User = mongoose.model("User", userSchema);
export default User;