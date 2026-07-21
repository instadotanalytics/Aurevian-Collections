// backend/models/UserProfileModel.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userProfileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', ''],
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  firebaseUid: {
    type: String,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['google', 'email', 'phone'],
    default: 'email'
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  addresses: [{
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin', 'seller'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
    twoFactorAuth: { type: Boolean, default: false },
    newsletter: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'CHF' }
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true }
  }],
  refreshTokens: [{
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  notifications: [{
    type: { type: String, enum: ['order', 'promotion', 'system', 'welcome'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Virtual for full name
userProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for initials
userProfileSchema.virtual('initials').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
  return this.firstName?.charAt(0)?.toUpperCase() || 'U';
});

// Hash password before saving
userProfileSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userProfileSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userProfileSchema.index({ email: 1 });
userProfileSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userProfileSchema.index({ 'address.pincode': 1 });

// Methods
userProfileSchema.methods.addLoginHistory = async function(data) {
  this.loginHistory.push({
    timestamp: data.timestamp || new Date(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    success: data.success !== undefined ? data.success : true
  });
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
  this.lastLogin = new Date();
  return this.save();
};

userProfileSchema.methods.addRefreshToken = async function(token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  if (this.refreshTokens.length > 10) {
    this.refreshTokens = this.refreshTokens.slice(-10);
  }
  return this.save();
};

userProfileSchema.methods.removeRefreshToken = async function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

userProfileSchema.methods.clearRefreshTokens = async function() {
  this.refreshTokens = [];
  return this.save();
};

userProfileSchema.methods.addNotification = async function(notification) {
  this.notifications.push({
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link || null
  });
  if (this.notifications.length > 100) {
    this.notifications = this.notifications.slice(-100);
  }
  return this.save();
};

// Static methods
userProfileSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userProfileSchema.statics.findByFirebaseUid = function(uid) {
  return this.findOne({ firebaseUid: uid });
};

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;