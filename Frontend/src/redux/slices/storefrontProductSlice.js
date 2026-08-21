// src/redux/slices/storefrontProductSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

// ============================================
// FETCH PRODUCTS BY PLACEMENT (Public - No Auth)
// ============================================
export const fetchProductsByPlacement = createAsyncThunk(
  "storefrontProducts/fetchByPlacement",
  async (
    { placement, page = 1, limit = 20, categoryId, sort },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (categoryId) params.append("categoryId", categoryId);
      if (sort) params.append("sort", sort);

      const { data } = await axios.get(
        `${API_URL}/seller/products/placements/${placement}?${params.toString()}`,
      );
      return { placement, ...data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);

// ============================================
// ✅ NEW: FETCH SINGLE PRODUCT BY SLUG (Public)
// ============================================
export const fetchProductBySlug = createAsyncThunk(
  "storefrontProducts/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/seller/products/${slug}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Product not found",
      );
    }
  },
);

// ============================================
// ✅ NEW: FETCH RELEVANT PRODUCTS ("You May Also Like") (Public)
// One request per product-detail-page load, keyed by productId so a
// fast product-to-product navigation can't let a slow, superseded
// request overwrite the newer one (see fulfilled/rejected guards below).
// ============================================
export const fetchRelevantProducts = createAsyncThunk(
  "storefrontProducts/fetchRelevant",
  async ({ productId, limit = 8 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/seller/products/${productId}/relevant?limit=${limit}`,
      );
      return { productId, products: data.data?.products || [] };
    } catch (error) {
      return rejectWithValue({
        productId,
        message:
          error.response?.data?.message || "Failed to fetch relevant products",
      });
    }
  },
);

// ============================================
// SLICE
// ============================================
const storefrontProductSlice = createSlice({
  name: "storefrontProducts",
  initialState: {
    byPlacement: {
      shop: {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      collections: {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      gifts: {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      offers: {
        products: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
    },
    isLoading: false,
    error: null,
    // ✅ NEW: single product detail state
    currentProduct: null,
    currentProductLoading: false,
    currentProductError: null,
    // ✅ NEW: relevant products ("You May Also Like") state
    relevantProducts: {
      products: [],
      isLoading: false,
      error: null,
      forProductId: null, // guards against stale responses on fast navigation
    },
  },
  reducers: {
    clearStorefrontError: (state) => {
      state.error = null;
    },
    clearPlacementProducts: (state, action) => {
      const placement = action.payload;
      if (placement && state.byPlacement[placement]) {
        state.byPlacement[placement] = {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        };
      }
    },
    clearAllPlacements: (state) => {
      state.byPlacement = {
        shop: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
        collections: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
        gifts: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
        offers: {
          products: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        },
      };
    },
    // ✅ NEW: Clear current product
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductError = null;
      state.currentProductLoading = false;
    },
    // ✅ NEW: Clear relevant products (e.g. on unmount)
    clearRelevantProducts: (state) => {
      state.relevantProducts = {
        products: [],
        isLoading: false,
        error: null,
        forProductId: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByPlacement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsByPlacement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.byPlacement[action.payload.placement] = {
          products: action.payload.products || [],
          pagination: action.payload.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
      })
      .addCase(fetchProductsByPlacement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      // ✅ NEW: single product by slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.currentProductLoading = true;
        state.currentProductError = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.currentProductLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.currentProductLoading = false;
        state.currentProductError = action.payload || "Product not found";
        state.currentProduct = null;
      })

      // ✅ NEW: relevant products
      .addCase(fetchRelevantProducts.pending, (state, action) => {
        // Reset immediately — this is what guarantees stale product-A
        // recommendations never linger visually once a request for
        // product B has started.
        state.relevantProducts = {
          products: [],
          isLoading: true,
          error: null,
          forProductId: action.meta.arg.productId,
        };
      })
      .addCase(fetchRelevantProducts.fulfilled, (state, action) => {
        // Ignore a response that arrives after a newer request has
        // already superseded it (rapid product-to-product navigation).
        if (action.payload.productId !== state.relevantProducts.forProductId) {
          return;
        }
        state.relevantProducts.isLoading = false;
        state.relevantProducts.products = action.payload.products;
      })
      .addCase(fetchRelevantProducts.rejected, (state, action) => {
        const failedProductId = action.payload?.productId;
        if (
          failedProductId &&
          failedProductId !== state.relevantProducts.forProductId
        ) {
          return;
        }
        state.relevantProducts.isLoading = false;
        state.relevantProducts.error =
          action.payload?.message || "Failed to fetch relevant products";
      });
  },
});

export const {
  clearStorefrontError,
  clearPlacementProducts,
  clearAllPlacements,
  clearCurrentProduct, // ✅ NEW: Export the new action
  clearRelevantProducts, // ✅ NEW: Export the new action
} = storefrontProductSlice.actions;

export default storefrontProductSlice.reducer;
