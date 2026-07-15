import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  superAdminLogin as superAdminLoginAPI,
  superAdminLogout as superAdminLogoutAPI,
  getCurrentSuperAdmin as getCurrentSuperAdminAPI,
  refreshSuperAdminToken as refreshSuperAdminTokenAPI,
} from "../../api/superAdminApi.js";
import { AUTH_CONFIG } from "../../utils/constants.js";

const initialState = {
  user: JSON.parse(localStorage.getItem("superAdminUser")) || null,
  isAuthenticated: !!localStorage.getItem("superAdminToken"),
  isLoading: false,
  error: null,
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
      return rejectWithValue(error.message || "Logout failed");
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
      state.error = null;
      localStorage.removeItem("superAdminUser");
      localStorage.removeItem("superAdminToken");
    },
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
        state.error = null;
        localStorage.setItem("superAdminUser", JSON.stringify(action.payload));
      })
      .addCase(superAdminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
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
        state.error = null;
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      })
      .addCase(superAdminLogout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
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
        state.error = null;
        localStorage.setItem("superAdminUser", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentSuperAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Failed to fetch user";
        localStorage.removeItem("superAdminUser");
        localStorage.removeItem("superAdminToken");
      });
  },
});

export const { clearSuperAdminError, clearSuperAdminAuth } = superAdminSlice.actions;
export default superAdminSlice.reducer;