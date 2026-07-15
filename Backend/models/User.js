import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
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
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
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
  password: { 
    type: String, 
    select: false 
  },
  profileImage: { 
    type: String, 
    default: null 
  },
  avatar: { 
    type: String, 
    default: null 
  },
  phone: { 
    type: String, 
    trim: true, 
    default: null 
  },
  role: { 
    type: String, 
    enum: ['user', 'seller', 'admin', 'super_admin'], 
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
  otp: {
    code: { type: String },
    type: { type: String, enum: ['email', 'phone', 'forgot_password'] },
    expiresAt: { type: Date },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  refreshTokens: [{
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  notifications: [{
    type: { type: String, enum: ['order', 'promotion', 'system', 'welcome'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  preferences: {
    newsletter: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'CHF' },
  },
}, { 
  timestamps: true 
});

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
userSchema.virtual('initials').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
  return this.firstName?.charAt(0)?.toUpperCase() || 'U';
});

userSchema.virtual('displayName').get(function() {
  return this.fullName || `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'User';
});

// ============================================
// ✅ PRE-SAVE MIDDLEWARE - SIMPLIFIED FIX
// ============================================
// userSchema.pre('save', function(next) {
  // Set fullName from firstName and lastName
//   if (this.firstName || this.lastName) {
//     this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
//   }
  
  // If fullName is provided but firstName/lastName are not
//   if (this.fullName && !this.firstName) {
//     const parts = this.fullName.split(' ');
//     this.firstName = parts[0] || '';
//     this.lastName = parts.slice(1).join(' ') || '';
//   }
  
//   next();
// });

userSchema.pre("save", function () {
  console.log("🔥 PRE SAVE EXECUTED");
});

// ============================================
// METHODS
// ============================================

userSchema.methods.addLoginHistory = async function(data) {
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

userSchema.methods.addRefreshToken = async function(token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  if (this.refreshTokens.length > 10) {
    this.refreshTokens = this.refreshTokens.slice(-10);
  }
  return this.save();
};

userSchema.methods.removeRefreshToken = async function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

userSchema.methods.clearRefreshTokens = async function() {
  this.refreshTokens = [];
  return this.save();
};

userSchema.methods.addNotification = async function(notification) {
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

userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByFirebaseUid = function(uid) {
  return this.findOne({ firebaseUid: uid });
};

userSchema.statics.findOrCreateFromFirebase = async function(firebaseUser) {
  try {
    console.log('🔍 Finding user with firebaseUid:', firebaseUser.uid);
    
    let user = await this.findOne({ firebaseUid: firebaseUser.uid });
    
    if (!user) {
      console.log('👤 User not found, creating new...');
      
      const nameParts = firebaseUser.displayName ? firebaseUser.displayName.split(' ') : ['User', ''];
      
      // Create user object without saving yet
      user = new this({
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        fullName: firebaseUser.displayName || `${nameParts[0] || 'User'} ${nameParts.slice(1).join(' ') || ''}`,
        email: firebaseUser.email,
        firebaseUid: firebaseUser.uid,
        profileImage: firebaseUser.photoURL || null,
        avatar: firebaseUser.photoURL || null,
        authProvider: 'google',
        isVerified: firebaseUser.emailVerified || false,
        emailVerified: firebaseUser.emailVerified || false,
        lastLogin: new Date(),
      });
      
      // Save user
      await user.save();
      console.log(`✅ New user created: ${user.email}`);
      
      // Add welcome notification
      await user.addNotification({
        type: 'welcome',
        title: 'Welcome to Aurevian Collections!',
        message: `Welcome ${user.firstName}! We're excited to have you on board.`,
        link: '/dashboard',
      });
      
    } else {
      console.log('👤 User found, updating...');
      
      // Update existing user
      if (firebaseUser.displayName && !user.fullName) {
        const parts = firebaseUser.displayName.split(' ');
        user.firstName = parts[0] || user.firstName;
        user.lastName = parts.slice(1).join(' ') || user.lastName;
        user.fullName = firebaseUser.displayName;
      }
      if (firebaseUser.photoURL && !user.profileImage) {
        user.profileImage = firebaseUser.photoURL;
        user.avatar = firebaseUser.photoURL;
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
    console.error('❌ Error in findOrCreateFromFirebase:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);
export default User;