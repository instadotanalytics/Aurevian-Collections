// src/redux/slices/featuredProductSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const authHeader = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const sellerAuthHeader = () => {
  const token = localStorage.getItem("sellerAccessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// PUBLIC — Home Page reads from here
// ============================================
export const fetchFeaturedProducts = createAsyncThunk(
  "featuredProducts/fetchPublic",
  async (section, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/featured-products/${section}`,
      );
      return { section, products: data.data?.products || [] };
    } catch (error) {
      return rejectWithValue({
        section,
        message:
          error.response?.data?.message || "Failed to load featured products",
      });
    }
  },
);

// ============================================
// ADMIN
// ============================================
export const fetchFeaturedProductsAdmin = createAsyncThunk(
  "featuredProducts/fetchAdmin",
  async (section, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/featured-products/admin/${section}`,
        { headers: authHeader() },
      );
      return { section, entries: data.data || [] };
    } catch (error) {
      return rejectWithValue({
        section,
        message:
          error.response?.data?.message || "Failed to load featured products",
      });
    }
  },
);

export const fetchAvailableProducts = createAsyncThunk(
  "featuredProducts/fetchAvailable",
  async ({ section, search, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("section", section);
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);

      const { data } = await axios.get(
        `${API_URL}/featured-products/admin/available-products?${params.toString()}`,
        { headers: authHeader() },
      );
      return { section, ...data.data };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.response?.data?.message || "Failed to search products",
      });
    }
  },
);

export const addFeaturedProduct = createAsyncThunk(
  "featuredProducts/add",
  async ({ section, productId, sellerId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/featured-products/admin`,
        { section, productId, sellerId },
        { headers: authHeader() },
      );
      return { section, entry: data.data };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.response?.data?.message || "Failed to add product",
      });
    }
  },
);

export const removeFeaturedProduct = createAsyncThunk(
  "featuredProducts/remove",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/featured-products/admin/${id}`, {
        headers: authHeader(),
      });
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove product",
      );
    }
  },
);

export const toggleFeaturedProductStatus = createAsyncThunk(
  "featuredProducts/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/featured-products/admin/${id}/status`,
        {},
        { headers: authHeader() },
      );
      return { entry: data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

export const reorderFeaturedProducts = createAsyncThunk(
  "featuredProducts/reorder",
  async ({ section, orderedIds }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `${API_URL}/featured-products/admin/reorder`,
        { section, orderedIds },
        { headers: authHeader() },
      );
      return { section, orderedIds };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.response?.data?.message || "Failed to update order",
      });
    }
  },
);

// ============================================
// SELLER
// ============================================
export const fetchFeaturedProductsSeller = createAsyncThunk(
  "featuredProducts/fetchSeller",
  async (section, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/featured-products/seller/${section}`,
        { headers: sellerAuthHeader() },
      );
      return { section, entries: data.data || [] };
    } catch (error) {
      return rejectWithValue({
        section,
        message:
          error.response?.data?.message || "Failed to load featured products",
      });
    }
  },
);

export const fetchAvailableProductsSeller = createAsyncThunk(
  "featuredProducts/fetchAvailableSeller",
  async ({ section, search, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("section", section);
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);

      const { data } = await axios.get(
        `${API_URL}/featured-products/seller/available-products?${params.toString()}`,
        { headers: sellerAuthHeader() },
      );
      return { section, ...data.data };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.response?.data?.message || "Failed to search products",
      });
    }
  },
);

export const addFeaturedProductSeller = createAsyncThunk(
  "featuredProducts/addSeller",
  async ({ section, productId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/featured-products/seller`,
        { section, productId },
        { headers: sellerAuthHeader() },
      );
      return { section, entry: data.data };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.response?.data?.message || "Failed to add product",
      });
    }
  },
);

export const removeFeaturedProductSeller = createAsyncThunk(
  "featuredProducts/removeSeller",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/featured-products/seller/${id}`, {
        headers: sellerAuthHeader(),
      });
      return { id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove product",
      );
    }
  },
);

export const toggleFeaturedProductStatusSeller = createAsyncThunk(
  "featuredProducts/toggleStatusSeller",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/featured-products/seller/${id}/status`,
        {},
        { headers: sellerAuthHeader() },
      );
      return { entry: data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status",
      );
    }
  },
);

export const reorderFeaturedProductsSeller = createAsyncThunk(
  "featuredProducts/reorderSeller",
  async ({ section, orderedIds }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `${API_URL}/featured-products/seller/reorder`,
        { section, orderedIds },
        { headers: sellerAuthHeader() },
      );
      return { section, orderedIds };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.response?.data?.message || "Failed to update order",
      });
    }
  },
);

// ============================================
// STATE SHAPE
// ============================================
const emptyPublicSection = () => ({
  products: [],
  isLoading: false,
  error: null,
});

const emptyManagementSection = () => ({
  entries: [],
  isLoading: false,
  isSaving: false,
  error: null,
  availableProducts: [],
  availablePagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  isSearching: false,
});

// Lazily creates state.<scope>.bySection[section] the first time it's touched.
const ensureSection = (bySectionMap, section) => {
  if (!bySectionMap[section]) {
    bySectionMap[section] = emptyManagementSection();
  }
  return bySectionMap[section];
};

// remove/toggle responses only carry an entry id, not its section — find
// which section bucket currently holds that id so we can update it.
const findSectionContainingEntry = (bySectionMap, id) =>
  Object.keys(bySectionMap).find((section) =>
    bySectionMap[section].entries.some((e) => e._id === id),
  );

const featuredProductSlice = createSlice({
  name: "featuredProducts",
  initialState: {
    // Public — keyed by section, consumed by storefront components
    bySection: {},
    // Admin — Super Admin management screens, keyed by section
    admin: { bySection: {} },
    // Seller — seller's own management screens, keyed by section
    seller: { bySection: {} },
  },
  reducers: {
    // NOTE: these now take the section as their payload, e.g.
    // dispatch(clearFeaturedProductsError(SECTION))
    clearFeaturedProductsError: (state, action) => {
      const bucket = state.admin.bySection[action.payload];
      if (bucket) bucket.error = null;
    },
    clearAvailableProducts: (state, action) => {
      const bucket = state.admin.bySection[action.payload];
      if (bucket) {
        bucket.availableProducts = [];
        bucket.availablePagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        };
      }
    },
    clearSellerFeaturedProductsError: (state, action) => {
      const bucket = state.seller.bySection[action.payload];
      if (bucket) bucket.error = null;
    },
    clearSellerAvailableProducts: (state, action) => {
      const bucket = state.seller.bySection[action.payload];
      if (bucket) {
        bucket.availableProducts = [];
        bucket.availablePagination = {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- PUBLIC ----------
      .addCase(fetchFeaturedProducts.pending, (state, action) => {
        const section = action.meta.arg;
        state.bySection[section] = {
          ...(state.bySection[section] || emptyPublicSection()),
          isLoading: true,
          error: null,
        };
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        const { section, products } = action.payload;
        state.bySection[section] = { products, isLoading: false, error: null };
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        const section = action.meta.arg;
        state.bySection[section] = {
          products: [],
          isLoading: false,
          error: action.payload?.message || "Failed to load featured products",
        };
      })

      // ---------- ADMIN: list ----------
      .addCase(fetchFeaturedProductsAdmin.pending, (state, action) => {
        const bucket = ensureSection(state.admin.bySection, action.meta.arg);
        bucket.isLoading = true;
        bucket.error = null;
      })
      .addCase(fetchFeaturedProductsAdmin.fulfilled, (state, action) => {
        const { section, entries } = action.payload;
        const bucket = ensureSection(state.admin.bySection, section);
        bucket.isLoading = false;
        bucket.entries = entries;
      })
      .addCase(fetchFeaturedProductsAdmin.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg;
        const bucket = ensureSection(state.admin.bySection, section);
        bucket.isLoading = false;
        bucket.error = action.payload?.message;
      })

      // ---------- ADMIN: available products search ----------
      .addCase(fetchAvailableProducts.pending, (state, action) => {
        ensureSection(
          state.admin.bySection,
          action.meta.arg.section,
        ).isSearching = true;
      })
      .addCase(fetchAvailableProducts.fulfilled, (state, action) => {
        const { section, products, pagination } = action.payload;
        const bucket = ensureSection(state.admin.bySection, section);
        bucket.isSearching = false;
        bucket.availableProducts = products || [];
        bucket.availablePagination = pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        };
      })
      .addCase(fetchAvailableProducts.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg.section;
        const bucket = ensureSection(state.admin.bySection, section);
        bucket.isSearching = false;
        bucket.error = action.payload?.message;
      })

      // ---------- ADMIN: add ----------
      .addCase(addFeaturedProduct.pending, (state, action) => {
        const bucket = ensureSection(
          state.admin.bySection,
          action.meta.arg.section,
        );
        bucket.isSaving = true;
        bucket.error = null;
      })
      .addCase(addFeaturedProduct.fulfilled, (state, action) => {
        const { section, entry } = action.payload;
        const bucket = ensureSection(state.admin.bySection, section);
        bucket.isSaving = false;
        bucket.entries.push(entry);
        bucket.availableProducts = bucket.availableProducts.filter(
          (p) => p._id !== entry.product._id,
        );
      })
      .addCase(addFeaturedProduct.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg.section;
        const bucket = ensureSection(state.admin.bySection, section);
        bucket.isSaving = false;
        bucket.error = action.payload?.message;
      })

      // ---------- ADMIN: remove ----------
      .addCase(removeFeaturedProduct.fulfilled, (state, action) => {
        const { id } = action.payload;
        const section = findSectionContainingEntry(state.admin.bySection, id);
        if (section) {
          state.admin.bySection[section].entries = state.admin.bySection[
            section
          ].entries.filter((e) => e._id !== id);
        }
      })

      // ---------- ADMIN: toggle status ----------
      .addCase(toggleFeaturedProductStatus.fulfilled, (state, action) => {
        const { entry } = action.payload;
        const bucket = state.admin.bySection[entry.section];
        if (bucket) {
          const index = bucket.entries.findIndex((e) => e._id === entry._id);
          if (index !== -1) {
            bucket.entries[index] = {
              ...bucket.entries[index],
              isActive: entry.isActive,
            };
          }
        }
      })

      // ---------- ADMIN: reorder ----------
      .addCase(reorderFeaturedProducts.fulfilled, (state, action) => {
        const { section, orderedIds } = action.payload;
        const bucket = state.admin.bySection[section];
        if (!bucket) return;
        const byId = new Map(bucket.entries.map((e) => [e._id, e]));
        bucket.entries = orderedIds
          .map((id, index) => {
            const entry = byId.get(id);
            return entry ? { ...entry, order: index } : null;
          })
          .filter(Boolean);
      })

      // ---------- SELLER: list ----------
      .addCase(fetchFeaturedProductsSeller.pending, (state, action) => {
        const bucket = ensureSection(state.seller.bySection, action.meta.arg);
        bucket.isLoading = true;
        bucket.error = null;
      })
      .addCase(fetchFeaturedProductsSeller.fulfilled, (state, action) => {
        const { section, entries } = action.payload;
        const bucket = ensureSection(state.seller.bySection, section);
        bucket.isLoading = false;
        bucket.entries = entries;
      })
      .addCase(fetchFeaturedProductsSeller.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg;
        const bucket = ensureSection(state.seller.bySection, section);
        bucket.isLoading = false;
        bucket.error = action.payload?.message;
      })

      // ---------- SELLER: available products search ----------
      .addCase(fetchAvailableProductsSeller.pending, (state, action) => {
        ensureSection(
          state.seller.bySection,
          action.meta.arg.section,
        ).isSearching = true;
      })
      .addCase(fetchAvailableProductsSeller.fulfilled, (state, action) => {
        const { section, products, pagination } = action.payload;
        const bucket = ensureSection(state.seller.bySection, section);
        bucket.isSearching = false;
        bucket.availableProducts = products || [];
        bucket.availablePagination = pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        };
      })
      .addCase(fetchAvailableProductsSeller.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg.section;
        const bucket = ensureSection(state.seller.bySection, section);
        bucket.isSearching = false;
        bucket.error = action.payload?.message;
      })

      // ---------- SELLER: add ----------
      .addCase(addFeaturedProductSeller.pending, (state, action) => {
        const bucket = ensureSection(
          state.seller.bySection,
          action.meta.arg.section,
        );
        bucket.isSaving = true;
        bucket.error = null;
      })
      .addCase(addFeaturedProductSeller.fulfilled, (state, action) => {
        const { section, entry } = action.payload;
        const bucket = ensureSection(state.seller.bySection, section);
        bucket.isSaving = false;
        bucket.entries.push(entry);
        bucket.availableProducts = bucket.availableProducts.filter(
          (p) => p._id !== entry.product._id,
        );
      })
      .addCase(addFeaturedProductSeller.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg.section;
        const bucket = ensureSection(state.seller.bySection, section);
        bucket.isSaving = false;
        bucket.error = action.payload?.message;
      })

      // ---------- SELLER: remove ----------
      .addCase(removeFeaturedProductSeller.fulfilled, (state, action) => {
        const { id } = action.payload;
        const section = findSectionContainingEntry(state.seller.bySection, id);
        if (section) {
          state.seller.bySection[section].entries = state.seller.bySection[
            section
          ].entries.filter((e) => e._id !== id);
        }
      })

      // ---------- SELLER: toggle status ----------
      .addCase(toggleFeaturedProductStatusSeller.fulfilled, (state, action) => {
        const { entry } = action.payload;
        const bucket = state.seller.bySection[entry.section];
        if (bucket) {
          const index = bucket.entries.findIndex((e) => e._id === entry._id);
          if (index !== -1) {
            bucket.entries[index] = {
              ...bucket.entries[index],
              isActive: entry.isActive,
            };
          }
        }
      })

      // ---------- SELLER: reorder ----------
      .addCase(reorderFeaturedProductsSeller.fulfilled, (state, action) => {
        const { section, orderedIds } = action.payload;
        const bucket = state.seller.bySection[section];
        if (!bucket) return;
        const byId = new Map(bucket.entries.map((e) => [e._id, e]));
        bucket.entries = orderedIds
          .map((id, index) => {
            const entry = byId.get(id);
            return entry ? { ...entry, order: index } : null;
          })
          .filter(Boolean);
      });
  },
});

export const {
  clearFeaturedProductsError,
  clearAvailableProducts,
  clearSellerFeaturedProductsError,
  clearSellerAvailableProducts,
} = featuredProductSlice.actions;
export default featuredProductSlice.reducer;
