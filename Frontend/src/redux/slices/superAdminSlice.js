// src/redux/slices/superAdminSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  superAdminLogin as superAdminLoginAPI,
  superAdminLogout as superAdminLogoutAPI,
  getCurrentSuperAdmin as getCurrentSuperAdminAPI,
  refreshSuperAdminToken as refreshSuperAdminTokenAPI,
  verifySuperAdminToken as verifySuperAdminTokenAPI,
} from "../../api/superAdminApi.js";
import { AUTH_CONFIG } from "../../utils/constants.js";

// ✅ FIX: Get token safely
const getToken = () => {
  return localStorage.getItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY) || 
         localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY) || 
         localStorage.getItem("superAdminToken") ||
         null;
};

// ✅ FIX: Get user safely from localStorage
const getUserFromStorage = () => {
  try {
    // Try to get user from SUPER_ADMIN_USER_KEY
    const userData = localStorage.getItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Try fallback key
    const fallbackUser = localStorage.getItem("superAdminUser");
    if (fallbackUser) {
      return JSON.parse(fallbackUser);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
    localStorage.removeItem("superAdminUser");
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  isAuthenticated: !!getToken(),
  isLoading: false,
  error: null,
  isVerified: false,
};

// ============================================
// Async Thunks
// ============================================

export const superAdminLogin = createAsyncThunk(
  "superAdmin/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await superAdminLoginAPI(email, password);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const superAdminLogout = createAsyncThunk(
  "superAdmin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await superAdminLogoutAPI();
      if (response.success) {
        return null;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      // Still clear local state even if API fails
      return null;
    }
  }
);

export const fetchCurrentSuperAdmin = createAsyncThunk(
  "superAdmin/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentSuperAdminAPI();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  }
);

export const verifySuperAdminToken = createAsyncThunk(
  "superAdmin/verifyToken",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if already verified
      const state = getState();
      if (state.superAdmin?.isVerified && state.superAdmin?.user) {
        return state.superAdmin.user;
      }
      
      const response = await verifySuperAdminTokenAPI();
      if (response.success) {
        return response.admin;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Token verification failed");
    }
  }
);

// ============================================
// Super Admin Slice
// ============================================

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  reducers: {
    clearSuperAdminError: (state) => {
      state.error = null;
    },
    clearSuperAdminAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.error = null;
      localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
      localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY);
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      localStorage.removeItem("superAdminUser");
      localStorage.removeItem("superAdminToken");
    },
    setSuperAdminAuth: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isVerified = true;
      state.error = null;
      if (action.payload) {
        try {
          localStorage.setItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY, JSON.stringify(action.payload));
          localStorage.setItem("superAdminUser", JSON.stringify(action.payload));
        } catch (error) {
          console.error('Error saving user to localStorage:', error);
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(superAdminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(superAdminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isVerified = true;
        state.error = null;
        try {
          localStorage.setItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY, JSON.stringify(action.payload));
          localStorage.setItem("superAdminUser", JSON.stringify(action.payload));
          // ✅ Store token separately
          const token = localStorage.getItem("superAdminToken");
          if (token) {
            localStorage.setItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY, token);
          }
        } catch (error) {
          console.error('Error saving data to localStorage:', error);
        }
      })
      .addCase(superAdminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.error = action.payload || "Login failed";
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      });

    // Logout
    builder
      .addCase(superAdminLogout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(superAdminLogout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.error = null;
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      })
      .addCase(superAdminLogout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.error = null;
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      });

    // Verify Token
    builder
      .addCase(verifySuperAdminToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifySuperAdminToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isVerified = true;
        state.error = null;
        if (action.payload) {
          try {
            localStorage.setItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY, JSON.stringify(action.payload));
            localStorage.setItem("superAdminUser", JSON.stringify(action.payload));
          } catch (error) {
            console.error('Error saving user to localStorage:', error);
          }
        }
      })
      .addCase(verifySuperAdminToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.user = null;
        state.error = action.payload || "Token verification failed";
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentSuperAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentSuperAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isVerified = true;
        state.error = null;
        if (action.payload) {
          try {
            localStorage.setItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY, JSON.stringify(action.payload));
            localStorage.setItem("superAdminUser", JSON.stringify(action.payload));
          } catch (error) {
            console.error('Error saving user to localStorage:', error);
          }
        }
      })
      .addCase(fetchCurrentSuperAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.error = action.payload || "Failed to fetch user";
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.SUPER_ADMIN_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      });
  },
});

export const { clearSuperAdminError, clearSuperAdminAuth, setSuperAdminAuth } = superAdminSlice.actions;
export default superAdminSlice.reducer;