// src/redux/slices/storefrontProductSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

// ============================================
// FETCH PRODUCTS BY PLACEMENT (Public - No Auth)
// ✅ CHANGED — accepts optional lat/lng; if present (and valid), the
// backend prioritizes closer showrooms while preserving the chosen
// sort as a tiebreak. Omitting lat/lng behaves exactly as before.
// ============================================
export const fetchProductsByPlacement = createAsyncThunk(
  "storefrontProducts/fetchByPlacement",
  async (
    {
      placement,
      page = 1,
      limit = 20,
      categoryId,
      collection,
      occasion,
      sort,
      lat,
      lng,
    },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (categoryId) params.append("categoryId", categoryId);
      if (collection) params.append("collection", collection);
      if (occasion) params.append("occasion", occasion);
      if (sort) params.append("sort", sort);
      if (lat != null && lng != null) {
        params.append("lat", lat);
        params.append("lng", lng);
      }

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
// ✅ FETCH SINGLE PRODUCT BY SLUG (Public)
// ✅ CHANGED — now takes { slug, lat, lng } instead of a bare slug
// string, so the product page can also show distance info.
// ============================================
export const fetchProductBySlug = createAsyncThunk(
  "storefrontProducts/fetchBySlug",
  async ({ slug, lat, lng } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (lat != null && lng != null) {
        params.append("lat", lat);
        params.append("lng", lng);
      }
      const qs = params.toString();
      const { data } = await axios.get(
        `${API_URL}/seller/products/${slug}${qs ? `?${qs}` : ""}`,
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Product not found",
      );
    }
  },
);

// ============================================
// ✅ FETCH RELEVANT PRODUCTS ("You May Also Like") (Public)
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
// ✅ SEARCH PRODUCTS (Public — header search bar + /shop?search=)
// ✅ CHANGED — accepts optional lat/lng, forwarded straight through to
// the backend's location+relevance ranking.
// ============================================
export const searchProducts = createAsyncThunk(
  "storefrontProducts/search",
  async (
    { q, page = 1, limit = 20, categoryId, sort, lat, lng },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("q", q);
      params.append("page", page);
      params.append("limit", limit);
      if (categoryId) params.append("categoryId", categoryId);
      if (sort) params.append("sort", sort);
      if (lat != null && lng != null) {
        params.append("lat", lat);
        params.append("lng", lng);
      }

      const { data } = await axios.get(
        `${API_URL}/seller/products/search?${params.toString()}`,
      );
      return { query: data.data?.query ?? q, ...data.data };
    } catch (error) {
      return rejectWithValue({
        query: q,
        message: error.response?.data?.message || "Search failed",
      });
    }
  },
);

// ============================================
// SLICE
// ============================================
const initialSearchResultsState = {
  products: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  isLoading: false,
  error: null,
  query: "",
  forQuery: null,
};

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
    currentProduct: null,
    currentProductLoading: false,
    currentProductError: null,
    relevantProducts: {
      products: [],
      isLoading: false,
      error: null,
      forProductId: null,
    },
    searchResults: { ...initialSearchResultsState },
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
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductError = null;
      state.currentProductLoading = false;
    },
    clearRelevantProducts: (state) => {
      state.relevantProducts = {
        products: [],
        isLoading: false,
        error: null,
        forProductId: null,
      };
    },
    clearSearchResults: (state) => {
      state.searchResults = { ...initialSearchResultsState };
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

      .addCase(fetchRelevantProducts.pending, (state, action) => {
        state.relevantProducts = {
          products: [],
          isLoading: true,
          error: null,
          forProductId: action.meta.arg.productId,
        };
      })
      .addCase(fetchRelevantProducts.fulfilled, (state, action) => {
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
      })

      .addCase(searchProducts.pending, (state, action) => {
        state.searchResults.isLoading = true;
        state.searchResults.error = null;
        state.searchResults.forQuery = action.meta.arg.q;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        if (action.payload.query !== state.searchResults.forQuery) {
          return;
        }
        state.searchResults.isLoading = false;
        state.searchResults.products = action.payload.products || [];
        state.searchResults.pagination = action.payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        };
        state.searchResults.query = action.payload.query;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        const failedQuery = action.payload?.query;
        if (failedQuery && failedQuery !== state.searchResults.forQuery) {
          return;
        }
        state.searchResults.isLoading = false;
        state.searchResults.error = action.payload?.message || "Search failed";
      });
  },
});

export const {
  clearStorefrontError,
  clearPlacementProducts,
  clearAllPlacements,
  clearCurrentProduct,
  clearRelevantProducts,
  clearSearchResults,
} = storefrontProductSlice.actions;

export default storefrontProductSlice.reducer;
