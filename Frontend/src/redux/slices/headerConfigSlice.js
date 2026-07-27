// src/redux/slices/headerConfigSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://aurevian-collections.onrender.com/api";

const authHeader = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// PUBLIC — used by the storefront Header component
// ============================================
export const fetchPublicHeaderConfig = createAsyncThunk(
  "headerConfig/fetchPublic",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/header-config/active`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load header config",
      );
    }
  },
);

// ============================================
// ADMIN — used by the Super Admin header management screen
// ============================================
export const fetchAdminHeaderConfig = createAsyncThunk(
  "headerConfig/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/header-config`, {
        headers: authHeader(),
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load header config",
      );
    }
  },
);

export const updateHeaderConfig = createAsyncThunk(
  "headerConfig/update",
  async (configData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_URL}/header-config`, configData, {
        headers: authHeader(),
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update header config",
      );
    }
  },
);

const headerConfigSlice = createSlice({
  name: "headerConfig",
  initialState: {
    config: null, // used by the public Header component
    adminConfig: null, // used by the admin editor (mirrors config, edited locally then saved)
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {
    clearHeaderConfigError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicHeaderConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      .addCase(fetchPublicHeaderConfig.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchAdminHeaderConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminHeaderConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminConfig = action.payload;
      })
      .addCase(fetchAdminHeaderConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateHeaderConfig.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateHeaderConfig.fulfilled, (state, action) => {
        state.isSaving = false;
        state.adminConfig = action.payload;
        state.config = action.payload; // keep public copy fresh too
      })
      .addCase(updateHeaderConfig.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const { clearHeaderConfigError } = headerConfigSlice.actions;
export default headerConfigSlice.reducer;
