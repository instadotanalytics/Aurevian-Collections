// Backend/controllers/authController.js

import firebaseAdmin from "../config/firebase-admin.js";
import User from "../models/User.js";
import tokenService from "../services/tokenService.js";
import otpService from "../services/otpService.js";
import emailService from "../services/emailService.js";
import bcrypt from "bcryptjs";

// ============================================
// GOOGLE LOGIN WITH FIREBASE
// ============================================
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    let decodedToken;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        return handleMockLogin(req, res);
      }
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase token",
        error: error.message,
      });
    }

    let firebaseUser;
    try {
      firebaseUser = await firebaseAdmin.auth().getUser(decodedToken.uid);
    } catch (userError) {
      firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || "User",
        photoURL: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false,
      };
    }

    let user;
    try {
      user = await User.findOrCreateFromFirebase(firebaseUser);
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: "Failed to process user data",
        error: dbError.message,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const { accessToken, refreshToken } = tokenService.generateTokens(user);
    const expiresAt = tokenService.getTokenExpiry(refreshToken);
    await user.addRefreshToken(refreshToken, expiresAt);

    // Fire-and-forget: don't block the response on login history write
    user
      .addLoginHistory({
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        success: true,
      })
      .catch((err) => console.error("Login history save failed:", err.message));

    tokenService.setAuthCookies(res, accessToken, refreshToken);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage?.url || null,
      avatar: user.avatar?.url || null,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      phone: user.phone,
      preferences: user.preferences,
      authProvider: user.authProvider,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: userData,
      token: accessToken,
    });
  } catch (error) {
    console.error("❌ Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// ============================================
// MOCK LOGIN HANDLER
// ============================================
const handleMockLogin = async (req, res) => {
  try {
    let user = await User.findOne({ email: "test@example.com" });
    if (!user) {
      user = new User({
        firstName: "Test",
        lastName: "User",
        fullName: "Test User",
        email: "test@example.com",
        authProvider: "google",
        isVerified: true,
        isActive: true,
        role: "customer",
        profileImage: { url: null, publicId: null },
        avatar: { url: null, publicId: null },
      });
      await user.save();
    }

    const { accessToken, refreshToken } = tokenService.generateTokens(user);
    const expiresAt = tokenService.getTokenExpiry(refreshToken);
    await user.addRefreshToken(refreshToken, expiresAt);
    tokenService.setAuthCookies(res, accessToken, refreshToken);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage?.url || null,
      avatar: user.avatar?.url || null,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      phone: user.phone,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful (Mock mode)",
      data: userData,
      token: accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Mock login failed",
      error: error.message,
    });
  }
};

// ============================================
// REGISTER
// ============================================
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
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
      authProvider: "email",
      isVerified: false,
      emailVerified: false,
      profileImage: { url: null, publicId: null },
      avatar: { url: null, publicId: null },
    });

    await user.save();

    const otp = otpService.generateOTP(6);
    await otpService.storeOTP(user, otp, "email");

    // Respond immediately; send OTP in background so the request doesn't hang
    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: { email: user.email, userId: user._id },
    });

    emailService
      .sendOTPEmail(email, otp, "verification")
      .catch((err) =>
        console.error("❌ Failed to send verification email:", err.message),
      );

    if (phone) {
      otpService
        .sendOTPviaSMS(phone, otp)
        .catch((err) =>
          console.error("❌ Failed to send verification SMS:", err.message),
        );
    }
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
// VERIFY OTP
// ============================================
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type = "email" } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const result = await otpService.verifyOTP(user, otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    if (type === "email") {
      user.emailVerified = true;
      user.isVerified = true;
      await user.save();

      // Don't block the response on the welcome email/notification
      emailService
        .sendWelcomeEmail(user.email, user.firstName)
        .catch((err) => console.error("❌ Welcome email failed:", err.message));

      user
        .addNotification({
          type: "welcome",
          title: "Welcome to Aurevian Collections!",
          message: `Welcome ${user.firstName}! Your email has been verified.`,
          link: "/dashboard",
        })
        .catch((err) =>
          console.error("❌ Notification save failed:", err.message),
        );
    }

    await otpService.clearOTP(user);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

// ============================================
// RESEND OTP
// ============================================
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = otpService.generateOTP(6);
    await otpService.storeOTP(user, otp, "email");

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });

    emailService
      .sendOTPEmail(email, otp, "verification")
      .catch((err) =>
        console.error("❌ Resend OTP email failed:", err.message),
      );

    if (user.phone) {
      otpService
        .sendOTPviaSMS(user.phone, otp)
        .catch((err) =>
          console.error("❌ Resend OTP SMS failed:", err.message),
        );
    }
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
// LOGIN WITH EMAIL
// ============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });
    }

    if (!user.emailVerified) {
      const otp = otpService.generateOTP(6);
      await otpService.storeOTP(user, otp, "email");

      res.status(403).json({
        success: false,
        message: "Email not verified. OTP sent to your email.",
        requireVerification: true,
      });

      emailService
        .sendOTPEmail(email, otp, "verification")
        .catch((err) =>
          console.error("❌ Verification email failed:", err.message),
        );
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = tokenService.generateTokens(user);
    const expiresAt = tokenService.getTokenExpiry(refreshToken);
    await user.addRefreshToken(refreshToken, expiresAt);

    user
      .addLoginHistory({
        ipAddress: req.ip || req.headers["x-forwarded-for"],
        userAgent: req.headers["user-agent"],
        success: true,
      })
      .catch((err) => console.error("Login history save failed:", err.message));

    tokenService.setAuthCookies(res, accessToken, refreshToken);

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage?.url || null,
      avatar: user.avatar?.url || null,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      phone: user.phone,
      preferences: user.preferences,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: userData,
      token: accessToken,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

// ============================================
// FORGOT PASSWORD  ← the main fix for your reported issue
// ============================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If your email exists, OTP has been sent.",
      });
    }

    const otp = otpService.generateOTP(6);
    await otpService.storeOTP(user, otp, "forgot_password");

    // Respond right away — do NOT make the client wait on SMTP/Twilio
    res.status(200).json({
      success: true,
      message: "OTP sent to your email for password reset.",
    });

    emailService
      .sendOTPEmail(email, otp, "forgot_password")
      .catch((err) =>
        console.error("❌ Forgot-password email failed:", err.message),
      );

    if (user.phone) {
      otpService
        .sendOTPviaSMS(user.phone, otp)
        .catch((err) =>
          console.error("❌ Forgot-password SMS failed:", err.message),
        );
    }
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};

// ============================================
// REFRESH ACCESS TOKEN
// ============================================
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token required" });
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const tokenExists = user.refreshTokens?.some(
      (rt) => rt.token === refreshToken,
    );
    if (!tokenExists) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token not found" });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      tokenService.generateTokens(user);

    await user.removeRefreshToken(refreshToken);
    const newExpiresAt = tokenService.getTokenExpiry(newRefreshToken);
    await user.addRefreshToken(newRefreshToken, newExpiresAt);

    tokenService.setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newAccessToken,
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
// LOGOUT
// ============================================
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

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
        console.error("Error removing refresh token:", error);
      }
    }

    tokenService.clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Logout failed", error: error.message });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-refreshTokens -loginHistory -__v -password -otp",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage?.url || null,
        avatar: user.avatar?.url || null,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        phone: user.phone,
        preferences: user.preferences,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("❌ Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};
