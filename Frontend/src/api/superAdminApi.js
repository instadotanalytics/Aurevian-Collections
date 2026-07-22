// src/api/superAdminApi.js

import axiosInstance from "./axiosConfig.js";
import { AUTH_CONFIG } from "../utils/constants.js";

// Use constants for keys
const SUPER_ADMIN_TOKEN_KEY = AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY || "superAdminToken";
const SUPER_ADMIN_USER_KEY = AUTH_CONFIG.SUPER_ADMIN_USER_KEY || "superAdminUser";

/**
 * Super Admin Login
 */
export const superAdminLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post("/super-admin/login", { 
      email, 
      password 
    });
    
    if (response.data.success) {
      // Save token to localStorage
      if (response.data.token) {
        localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, response.data.token);
        // Also set as accessToken for axios interceptor
        localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, response.data.token);
      }
      if (response.data.data) {
        localStorage.setItem(SUPER_ADMIN_USER_KEY, JSON.stringify(response.data.data));
      }
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Login failed" };
  }
};

/**
 * Super Admin Logout
 */
export const superAdminLogout = async () => {
  try {
    const token = localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
    const response = await axiosInstance.post(
      "/super-admin/logout",
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // Clear all storage regardless of response
    localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
    localStorage.removeItem(SUPER_ADMIN_USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    
    return response.data;
  } catch (error) {
    // Clear storage even if API fails
    localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
    localStorage.removeItem(SUPER_ADMIN_USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    throw error.response?.data || { success: false, message: "Logout failed" };
  }
};

/**
 * Get Current Super Admin
 */
export const getCurrentSuperAdmin = async () => {
  try {
    const response = await axiosInstance.get("/super-admin/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to get user" };
  }
};

/**
 * Refresh Super Admin Token
 */
export const refreshSuperAdminToken = async () => {
  try {
    const response = await axiosInstance.post("/super-admin/refresh");
    if (response.data.success && response.data.token) {
      localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, response.data.token);
      localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to refresh token" };
  }
};

/**
 * Verify Super Admin Token
 */
export const verifySuperAdminToken = async () => {
  try {
    const response = await axiosInstance.get("/super-admin/verify-token");
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Token verification failed" };
  }
};