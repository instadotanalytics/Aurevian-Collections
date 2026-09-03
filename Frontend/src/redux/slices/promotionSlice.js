// src/redux/slices/promotionSlice.js — NEW FILE

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const sellerAuthHeader = () => {
  const token = localStorage.getItem("sellerAccessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminAuthHeader = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// GUIDELINES (public)
// ============================================
export const fetchPromotionGuidelines = createAsyncThunk(
  "promotions/fetchGuidelines",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/promotions/guidelines`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load guidelines",
      );
    }
  },
);

// ============================================
// SELLER
// ============================================
export const fetchSellerEntitlements = createAsyncThunk(
  "promotions/fetchSellerEntitlements",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/promotions/seller/entitlements`,
        { headers: sellerAuthHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load entitlements",
      );
    }
  },
);

export const fetchSellerPromotionRequests = createAsyncThunk(
  "promotions/fetchSellerRequests",
  async (section, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/promotions/seller`, {
        params: section ? { section } : {},
        headers: sellerAuthHeader(),
      });
      return { section, requests: data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load promotion requests",
      );
    }
  },
);

export const fetchSellerAvailableProductsForPromotion = createAsyncThunk(
  "promotions/fetchSellerAvailableProducts",
  async ({ section, search, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("section", section);
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);

      const { data } = await axios.get(
        `${API_URL}/promotions/seller/available-products?${params.toString()}`,
        { headers: sellerAuthHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to search products",
      );
    }
  },
);

export const submitPromotionRequest = createAsyncThunk(
  "promotions/submit",
  async ({ section, productId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/promotions/seller`,
        { section, productId },
        { headers: sellerAuthHeader() },
      );
      return { section, request: data.data };
    } catch (error) {
      const payload = error.response?.data;
      return rejectWithValue({
        message: payload?.message || "Failed to submit promotion request",
        errors: payload?.errors,
        code: payload?.code,
      });
    }
  },
);

export const cancelPromotionRequest = createAsyncThunk(
  "promotions/cancel",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/promotions/seller/${id}`, {
        headers: sellerAuthHeader(),
      });
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel request",
      );
    }
  },
);

// ============================================
// ADMIN
// ============================================
export const fetchAdminPromotionRequests = createAsyncThunk(
  "promotions/fetchAdminRequests",
  async (
    { status, section, page = 1, limit = 20 } = {},
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.get(`${API_URL}/promotions/admin`, {
        params: { status, section, page, limit },
        headers: adminAuthHeader(),
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load promotion requests",
      );
    }
  },
);

export const approvePromotionRequestAdmin = createAsyncThunk(
  "promotions/approveAdmin",
  async (
    { id, startDate, endDate, keepActiveAfterPlanExpiry },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/promotions/admin/${id}/approve`,
        { startDate, endDate, keepActiveAfterPlanExpiry },
        { headers: adminAuthHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve request",
      );
    }
  },
);

export const rejectPromotionRequestAdmin = createAsyncThunk(
  "promotions/rejectAdmin",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/promotions/admin/${id}/reject`,
        { reason },
        { headers: adminAuthHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject request",
      );
    }
  },
);

export const removePromotionRequestAdmin = createAsyncThunk(
  "promotions/removeAdmin",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/promotions/admin/${id}/remove`,
        {},
        { headers: adminAuthHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove promotion",
      );
    }
  },
);

// ============================================
// SLICE
// ============================================
const promotionSlice = createSlice({
  name: "promotions",
  initialState: {
    guidelines: {},
    guidelinesLoading: false,

    seller: {
      entitlements: null,
      entitlementsLoading: false,
      requestsBySection: {}, // { [section]: PromotionRequest[] }
      requestsLoading: false,
      availableProducts: [],
      availablePagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      isSearching: false,
      isSubmitting: false,
      error: null,
    },

    admin: {
      requests: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      isLoading: false,
      isSaving: false,
      error: null,
    },
  },
  reducers: {
    clearSellerPromotionError: (state) => {
      state.seller.error = null;
    },
    clearAdminPromotionError: (state) => {
      state.admin.error = null;
    },
    clearSellerAvailableProductsForPromotion: (state) => {
      state.seller.availableProducts = [];
      state.seller.availablePagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // guidelines
      .addCase(fetchPromotionGuidelines.pending, (state) => {
        state.guidelinesLoading = true;
      })
      .addCase(fetchPromotionGuidelines.fulfilled, (state, action) => {
        state.guidelinesLoading = false;
        state.guidelines = action.payload;
      })
      .addCase(fetchPromotionGuidelines.rejected, (state) => {
        state.guidelinesLoading = false;
      })

      // seller entitlements
      .addCase(fetchSellerEntitlements.pending, (state) => {
        state.seller.entitlementsLoading = true;
      })
      .addCase(fetchSellerEntitlements.fulfilled, (state, action) => {
        state.seller.entitlementsLoading = false;
        state.seller.entitlements = action.payload;
      })
      .addCase(fetchSellerEntitlements.rejected, (state, action) => {
        state.seller.entitlementsLoading = false;
        state.seller.error = action.payload;
      })

      // seller requests list
      .addCase(fetchSellerPromotionRequests.pending, (state) => {
        state.seller.requestsLoading = true;
        state.seller.error = null;
      })
      .addCase(fetchSellerPromotionRequests.fulfilled, (state, action) => {
        state.seller.requestsLoading = false;
        state.seller.requestsBySection[action.payload.section || "all"] =
          action.payload.requests;
      })
      .addCase(fetchSellerPromotionRequests.rejected, (state, action) => {
        state.seller.requestsLoading = false;
        state.seller.error = action.payload;
      })

      // seller available products
      .addCase(fetchSellerAvailableProductsForPromotion.pending, (state) => {
        state.seller.isSearching = true;
      })
      .addCase(
        fetchSellerAvailableProductsForPromotion.fulfilled,
        (state, action) => {
          state.seller.isSearching = false;
          state.seller.availableProducts = action.payload.products || [];
          state.seller.availablePagination = action.payload.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          };
        },
      )
      .addCase(
        fetchSellerAvailableProductsForPromotion.rejected,
        (state, action) => {
          state.seller.isSearching = false;
          state.seller.error = action.payload;
        },
      )

      // submit
      .addCase(submitPromotionRequest.pending, (state) => {
        state.seller.isSubmitting = true;
        state.seller.error = null;
      })
      .addCase(submitPromotionRequest.fulfilled, (state, action) => {
        state.seller.isSubmitting = false;
        const { section, request } = action.payload;
        if (!state.seller.requestsBySection[section]) {
          state.seller.requestsBySection[section] = [];
        }
        state.seller.requestsBySection[section].unshift(request);
        state.seller.availableProducts = state.seller.availableProducts.filter(
          (p) => p._id !== request.product._id,
        );
      })
      .addCase(submitPromotionRequest.rejected, (state, action) => {
        state.seller.isSubmitting = false;
        state.seller.error = action.payload?.message || action.payload;
      })

      // cancel
      .addCase(cancelPromotionRequest.fulfilled, (state, action) => {
        const { id } = action.payload;
        Object.keys(state.seller.requestsBySection).forEach((section) => {
          state.seller.requestsBySection[section] =
            state.seller.requestsBySection[section].filter((r) => r._id !== id);
        });
      })

      // admin list
      .addCase(fetchAdminPromotionRequests.pending, (state) => {
        state.admin.isLoading = true;
        state.admin.error = null;
      })
      .addCase(fetchAdminPromotionRequests.fulfilled, (state, action) => {
        state.admin.isLoading = false;
        state.admin.requests = action.payload.data;
        state.admin.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminPromotionRequests.rejected, (state, action) => {
        state.admin.isLoading = false;
        state.admin.error = action.payload;
      })

      // admin approve
      .addCase(approvePromotionRequestAdmin.pending, (state) => {
        state.admin.isSaving = true;
      })
      .addCase(approvePromotionRequestAdmin.fulfilled, (state, action) => {
        state.admin.isSaving = false;
        const idx = state.admin.requests.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (idx !== -1) state.admin.requests[idx] = action.payload;
      })
      .addCase(approvePromotionRequestAdmin.rejected, (state, action) => {
        state.admin.isSaving = false;
        state.admin.error = action.payload;
      })

      // admin reject
      .addCase(rejectPromotionRequestAdmin.fulfilled, (state, action) => {
        const idx = state.admin.requests.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (idx !== -1) state.admin.requests[idx] = action.payload;
      })
      .addCase(rejectPromotionRequestAdmin.rejected, (state, action) => {
        state.admin.error = action.payload;
      })

      // admin remove
      .addCase(removePromotionRequestAdmin.fulfilled, (state, action) => {
        const idx = state.admin.requests.findIndex(
          (r) => r._id === action.payload._id,
        );
        if (idx !== -1) state.admin.requests[idx] = action.payload;
      })
      .addCase(removePromotionRequestAdmin.rejected, (state, action) => {
        state.admin.error = action.payload;
      });
  },
});

export const {
  clearSellerPromotionError,
  clearAdminPromotionError,
  clearSellerAvailableProductsForPromotion,
} = promotionSlice.actions;
export default promotionSlice.reducer;
