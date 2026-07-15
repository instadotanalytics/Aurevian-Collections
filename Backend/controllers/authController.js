import firebaseAdmin from '../config/firebase-admin.js';
import User from '../models/User.js';
import tokenService from '../services/tokenService.js';
import otpService from '../services/otpService.js';
import emailService from '../services/emailService.js';
import bcrypt from 'bcryptjs';

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      console.log('❌ No ID token provided');
      return res.status(400).json({ 
        success: false, 
        message: 'ID token is required' 
      });
    }

    console.log('🔑 Google login attempt');

    // Try to verify token with Firebase
    let decodedToken;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      console.log('✅ Firebase token verified for user:', decodedToken.email || decodedToken.uid);
    } catch (error) {
      console.error('❌ Firebase verification failed:', error.message);
      
      // In development, use mock login
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using mock login in development mode');
        return handleMockLogin(req, res);
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Firebase token', 
        error: error.message 
      });
    }

    // Get user from Firebase
    let firebaseUser;
    try {
      firebaseUser = await firebaseAdmin.auth().getUser(decodedToken.uid);
      console.log('👤 Firebase user found:', firebaseUser.email);
    } catch (userError) {
      console.error('❌ Firebase user fetch failed:', userError.message);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found in Firebase' 
      });
    }

    // Find or create user in database
    let user;
    try {
      user = await User.findOrCreateFromFirebase(firebaseUser);
      console.log('✅ User processed:', user.email);
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      console.error('Stack:', dbError.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to process user data',
        error: dbError.message 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = tokenService.generateTokens(user);
    const expiresAt = tokenService.getTokenExpiry(refreshToken);
    await user.addRefreshToken(refreshToken, expiresAt);
    await user.addLoginHistory({
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      success: true,
    });

    tokenService.setAuthCookies(res, accessToken, refreshToken);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      phone: user.phone,
      preferences: user.preferences,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userData,
      token: accessToken,
    });

  } catch (error) {
    console.error('❌ Google login error:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed', 
      error: error.message 
    });
  }
};

// ============================================
// MOCK LOGIN HANDLER
// ============================================
const handleMockLogin = async (req, res) => {
  try {
    console.log('🔧 Mock login in progress...');
    
    // Create a mock user
    const mockUser = {
      _id: 'mock_' + Date.now(),
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      email: 'test@example.com',
      profileImage: null,
      avatar: null,
      role: 'user',
      isVerified: true,
      isActive: true,
      phone: null,
      preferences: {
        newsletter: false,
        notifications: true,
        language: 'en',
        currency: 'CHF'
      }
    };

    const { accessToken, refreshToken } = tokenService.generateTokens(mockUser);
    tokenService.setAuthCookies(res, accessToken, refreshToken);

    console.log('✅ Mock login successful for:', mockUser.email);

    return res.status(200).json({
      success: true,
      message: 'Login successful (Mock mode)',
      data: mockUser,
      token: accessToken,
    });
  } catch (error) {
    console.error('❌ Mock login error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Mock login failed', 
      error: error.message 
    });
  }
};

// ============================================
// OTHER AUTH CONTROLLERS...
// ============================================
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      authProvider: 'email',
      isVerified: false,
      emailVerified: false,
    });

    await user.save();

    const otp = otpService.generateOTP(6);
    await otpService.storeOTP(user, otp, 'email');
    await emailService.sendOTPEmail(email, otp, 'verification');

    if (phone) {
      await otpService.sendOTPviaSMS(phone, otp);
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: { email: user.email, userId: user._id },
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type = 'email' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await otpService.verifyOTP(user, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    if (type === 'email') {
      user.emailVerified = true;
      user.isVerified = true;
      await user.save();
      
      await emailService.sendWelcomeEmail(user.email, user.firstName);
      await user.addNotification({
        type: 'welcome',
        title: 'Welcome to Aurevian Collections!',
        message: `Welcome ${user.firstName}! Your email has been verified.`,
        link: '/dashboard',
      });
    }

    await otpService.clearOTP(user);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    return res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const otp = otpService.generateOTP(6);
    await otpService.storeOTP(user, otp, 'email');
    await emailService.sendOTPEmail(email, otp, 'verification');

    if (user.phone) {
      await otpService.sendOTPviaSMS(user.phone, otp);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to resend OTP', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    if (!user.emailVerified) {
      const otp = otpService.generateOTP(6);
      await otpService.storeOTP(user, otp, 'email');
      await emailService.sendOTPEmail(email, otp, 'verification');
      
      return res.status(403).json({
        success: false,
        message: 'Email not verified. OTP sent to your email.',
        requireVerification: true,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = tokenService.generateTokens(user);
    const expiresAt = tokenService.getTokenExpiry(refreshToken);
    await user.addRefreshToken(refreshToken, expiresAt);
    await user.addLoginHistory({
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      success: true,
    });

    tokenService.setAuthCookies(res, accessToken, refreshToken);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      phone: user.phone,
      preferences: user.preferences,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userData,
      token: accessToken,
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If your email exists, OTP has been sent.',
      });
    }

    const otp = otpService.generateOTP(6);
    await otpService.storeOTP(user, otp, 'forgot_password');
    await emailService.sendOTPEmail(email, otp, 'forgot_password');

    if (user.phone) {
      await otpService.sendOTPviaSMS(user.phone, otp);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password reset.',
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await otpService.verifyOTP(user, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    await otpService.clearOTP(user);
    await user.clearRefreshTokens();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Password reset failed', error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.signedCookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      tokenService.generateTokens(user);

    await user.removeRefreshToken(refreshToken);
    const newExpiresAt = tokenService.getTokenExpiry(newRefreshToken);
    await user.addRefreshToken(newRefreshToken, newExpiresAt);

    tokenService.setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      token: newAccessToken,
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Failed to refresh token', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.signedCookies?.refreshToken;

    if (refreshToken) {
      try {
        const decoded = tokenService.decodeToken(refreshToken);
        if (decoded && decoded.id) {
          const user = await User.findById(decoded.id);
          if (user) {
            await user.removeRefreshToken(refreshToken);
          }
        }
      } catch (error) {
        console.error('Error removing refresh token:', error);
      }
    }

    tokenService.clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    return res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-refreshTokens -loginHistory -__v -password -otp');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });

  } catch (error) {
    console.error('❌ Get current user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get user', error: error.message });
  }
};