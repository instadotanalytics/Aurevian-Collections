// src/redux/slices/bannerSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// ✅ FIX 1: Create axios instance with interceptor
// ============================================
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor - automatically add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('superAdminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      // Don't redirect automatically, let component handle it
    }
    return Promise.reject(error);
  }
);

// ============================================
// Async Thunks
// ============================================

// Get active banners (public - no auth needed)
export const fetchActiveBanners = createAsyncThunk(
  "banners/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/banners/active');
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get all banners (admin)
export const fetchAllBanners = createAsyncThunk(
  "banners/fetchAll",
  async ({ page = 1, limit = 20, isActive, isFeatured, search } = {}, { rejectWithValue, getState }) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (isActive !== undefined) params.append('isActive', isActive);
      if (isFeatured !== undefined) params.append('isFeatured', isFeatured);
      if (search) params.append('search', search);

      const response = await api.get(`/banners?${params.toString()}`);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ✅ FIX 2: Create banner - properly handle FormData
export const createBanner = createAsyncThunk(
  "banners/create",
  async (formData, { rejectWithValue }) => {
    try {
      // Check if token exists
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      // Create a new FormData to ensure it's clean
      const cleanFormData = new FormData();
      for (let [key, value] of formData.entries()) {
        if (value !== null && value !== undefined) {
          cleanFormData.append(key, value);
        }
      }

      const response = await api.post('/banners', cleanFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update banner
export const updateBanner = createAsyncThunk(
  "banners/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      const cleanFormData = new FormData();
      for (let [key, value] of formData.entries()) {
        if (value !== null && value !== undefined) {
          cleanFormData.append(key, value);
        }
      }

      const response = await api.put(`/banners/${id}`, cleanFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete banner
export const deleteBanner = createAsyncThunk(
  "banners/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      const response = await api.delete(`/banners/${id}`);
      
      if (response.data.success) {
        return id;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Toggle banner status
export const toggleBannerStatus = createAsyncThunk(
  "banners/toggle",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      const response = await api.patch(`/banners/${id}/toggle`);
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update banner order
export const updateBannerOrder = createAsyncThunk(
  "banners/updateOrder",
  async (orders, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      if (!token) {
        return rejectWithValue('No authentication token found. Please login again.');
      }

      const response = await api.put('/banners/order', { orders });
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// ============================================
// Banner Slice
// ============================================

const initialState = {
  banners: [],
  activeBanners: [],
  selectedBanner: null,
  isLoading: false,
  isUploading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

const bannerSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    clearBannerError: (state) => {
      state.error = null;
    },
    clearSelectedBanner: (state) => {
      state.selectedBanner = null;
    },
    setBannerPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Active Banners
    builder
      .addCase(fetchActiveBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeBanners = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.activeBanners = [];
      });

    // Fetch All Banners
    builder
      .addCase(fetchAllBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.banners = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.banners = [];
      });

    // Create Banner
    builder
      .addCase(createBanner.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isUploading = false;
        state.banners = [action.payload, ...state.banners];
        state.selectedBanner = action.payload;
        state.error = null;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });

    // Update Banner
    builder
      .addCase(updateBanner.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isUploading = false;
        const index = state.banners.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.selectedBanner = action.payload;
        state.error = null;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      });

    // Delete Banner
    builder
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter(b => b._id !== action.payload);
        if (state.selectedBanner?._id === action.payload) {
          state.selectedBanner = null;
        }
        state.error = null;
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Toggle Banner Status
    builder
      .addCase(toggleBannerStatus.fulfilled, (state, action) => {
        const index = state.banners.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        // Update active banners if present
        const activeIndex = state.activeBanners.findIndex(b => b._id === action.payload._id);
        if (activeIndex !== -1) {
          if (!action.payload.isActive) {
            state.activeBanners.splice(activeIndex, 1);
          } else {
            state.activeBanners[activeIndex] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(toggleBannerStatus.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Update Banner Order
    builder
      .addCase(updateBannerOrder.fulfilled, (state, action) => {
        state.banners = action.payload;
        state.error = null;
      })
      .addCase(updateBannerOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearBannerError, clearSelectedBanner, setBannerPage } = bannerSlice.actions;
export default bannerSlice.reducer;