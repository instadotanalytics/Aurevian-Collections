import axiosInstance from "./axiosConfig.js";
import { AUTH_CONFIG, API_ENDPOINTS } from "../utils/constants.js";

/**
 * Google Login
 */
export const googleLogin = async (idToken) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.GOOGLE_LOGIN, { idToken });
    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, response.data.token);
      }
      if (response.data.data) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.data));
      }
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Login failed" };
  }
};

/**
 * Register User
 */
export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Registration failed" };
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email, otp, type = "email") => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.VERIFY_OTP, { email, otp, type });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "OTP verification failed" };
  }
};

/**
 * Resend OTP
 */
export const resendOTP = async (email) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.RESEND_OTP, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to resend OTP" };
  }
};

/**
 * Login with Email
 */
export const loginWithEmail = async (email, password) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, { email, password });
    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, response.data.token);
      }
      if (response.data.data) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data.data));
      }
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Login failed" };
  }
};

/**
 * Forgot Password
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to send OTP" };
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Password reset failed" };
  }
};

/**
 * Get Current User
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.GET_ME);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to get user" };
  }
};

/**
 * Logout
 */
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.LOGOUT);
    if (response.data.success) {
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Logout failed" };
  }
};