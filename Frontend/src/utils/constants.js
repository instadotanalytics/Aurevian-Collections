/**
 * Application Constants
 * Centralized configuration for the entire app
 */

// ============================================
// API Configuration
// ============================================
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ============================================
// Firebase Configuration (from environment variables)
// ============================================
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// ============================================
// Validate Firebase Config
// ============================================
console.log('📋 Firebase Config Validation:');
console.log('  - API Key:', FIREBASE_CONFIG.apiKey ? '✅ Set' : '❌ MISSING');
console.log('  - Auth Domain:', FIREBASE_CONFIG.authDomain ? '✅ Set' : '❌ MISSING');
console.log('  - Project ID:', FIREBASE_CONFIG.projectId ? '✅ Set' : '❌ MISSING');

if (!FIREBASE_CONFIG.apiKey) {
  console.error('❌ Firebase API Key is missing! Please check your .env file');
}

// ============================================
// App Configuration
// ============================================
export const APP_NAME = "Aurevian Collections";
export const APP_VERSION = "1.0.0";

// ============================================
// Auth Configuration
// ============================================
export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: "accessToken",
  USER_KEY: "user",
  REFRESH_TOKEN_KEY: "refreshToken",
};

// ============================================
// Routes
// ============================================
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  ABOUT: "/about",
};

// ============================================
// API Endpoints
// ============================================
export const API_ENDPOINTS = {
  GOOGLE_LOGIN: `${API_URL}/auth/google`,
  REGISTER: `${API_URL}/auth/register`,
  VERIFY_OTP: `${API_URL}/auth/verify-otp`,
  RESEND_OTP: `${API_URL}/auth/resend-otp`,
  LOGIN: `${API_URL}/auth/login`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  REFRESH_TOKEN: `${API_URL}/auth/refresh`,
  LOGOUT: `${API_URL}/auth/logout`,
  GET_ME: `${API_URL}/auth/me`,
};

// ============================================
// Toast Configuration
// ============================================
export const TOAST_CONFIG = {
  duration: 4000,
  position: "top-right",
  style: {
    background: "#363636",
    color: "#fff",
    borderRadius: "8px",
    padding: "12px 16px",
  },
  success: {
    style: {
      background: "#10B981",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#10B981",
    },
  },
  error: {
    style: {
      background: "#EF4444",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#EF4444",
    },
  },
};

// ============================================
// Validation Messages
// ============================================
export const VALIDATION = {
  REQUIRED: "This field is required",
  EMAIL_INVALID: "Please enter a valid email address",
  PASSWORD_MIN: "Password must be at least 6 characters",
  PASSWORD_MATCH: "Passwords do not match",
  PHONE_INVALID: "Please enter a valid phone number",
};