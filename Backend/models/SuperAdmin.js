import mongoose from 'mongoose';
import validator from 'validator';

const superAdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'super_admin'
  },
  profileImage: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuperAdmin: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true },
  }],
  refreshTokens: [{
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageProducts: { type: Boolean, default: true },
    manageOrders: { type: Boolean, default: true },
    manageSellers: { type: Boolean, default: true },
    manageAdmins: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    manageSettings: { type: Boolean, default: true },
    manageSuperAdmins: { type: Boolean, default: false },
  },
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'dark' },
  }
}, {
  timestamps: true
});

// Indexes
superAdminSchema.index({ email: 1 });
superAdminSchema.index({ role: 1, isActive: 1 });

// Virtuals
superAdminSchema.virtual('initials').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
  return this.firstName?.charAt(0)?.toUpperCase() || 'SA';
});

superAdminSchema.virtual('displayName').get(function() {
  return this.fullName || `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'Super Admin';
});

// Methods
superAdminSchema.methods.addLoginHistory = async function(data) {
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

superAdminSchema.methods.addRefreshToken = async function(token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  if (this.refreshTokens.length > 10) {
    this.refreshTokens = this.refreshTokens.slice(-10);
  }
  return this.save();
};

superAdminSchema.methods.removeRefreshToken = async function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

superAdminSchema.methods.clearRefreshTokens = async function() {
  this.refreshTokens = [];
  return this.save();
};

// Static methods
superAdminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);
export default SuperAdmin;