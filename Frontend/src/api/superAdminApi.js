import axiosInstance from "./axiosConfig.js";

const SUPER_ADMIN_TOKEN_KEY = "superAdminToken";
const SUPER_ADMIN_USER_KEY = "superAdminUser";

/**
 * Super Admin Login
 */
export const superAdminLogin = async (email, password) => {
  try {
    const response = await axiosInstance.post("/super-admin/login", { email, password });
    if (response.data.success) {
      if (response.data.token) {
        localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, response.data.token);
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
    const response = await axiosInstance.post("/super-admin/logout");
    if (response.data.success) {
      localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY);
      localStorage.removeItem(SUPER_ADMIN_USER_KEY);
    }
    return response.data;
  } catch (error) {
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
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: "Failed to refresh token" };
  }
};