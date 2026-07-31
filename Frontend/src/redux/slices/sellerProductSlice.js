// src/redux/slices/sellerProductSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://aurevian-collections.onrender.com/api";

// ============================================
// FIXED HELPER: Correctly fetches the token from localStorage
// ============================================
const authHeader = () => {
  // 🛑 FIX: Pehle 'accessToken' check karega, agar nahi mila toh 'sellerToken' check karega
  const token = localStorage.getItem("accessToken") || localStorage.getItem("sellerToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// FETCH PRODUCTS
// ============================================
export const fetchProducts = createAsyncThunk(
  "sellerProduct/fetchProducts",
  async ({ status, categoryId, search, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (categoryId) params.append("categoryId", categoryId);
      if (search) params.append("search", search);
      params.append("page", page);
      params.append("limit", limit);

      const { data } = await axios.get(
        `${API_URL}/seller/products?${params.toString()}`,
        { headers: authHeader() }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// ============================================
// FETCH CATEGORIES (YAHI CALL CATEGORY DROPDOWN KE LIYE HAI)
// ============================================
export const fetchCategories = createAsyncThunk(
  "sellerProduct/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/seller/products/categories`,
        { headers: authHeader() }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

// ============================================
// CREATE PRODUCT
// ============================================
export const createProduct = createAsyncThunk(
  "sellerProduct/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append all product data
      Object.keys(productData).forEach(key => {
        if (key === 'images' && Array.isArray(productData.images)) {
          productData.images.forEach((image, index) => {
            formData.append(`images`, image);
          });
        } else if (key === 'thumbnail' && productData.thumbnail) {
          formData.append('thumbnail', productData.thumbnail);
        } else if (key === 'variants' && Array.isArray(productData.variants)) {
          formData.append('variants', JSON.stringify(productData.variants));
        } else if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });

      const { data } = await axios.post(
        `${API_URL}/seller/products`,
        formData,
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create product"
      );
    }
  }
);

// ============================================
// UPDATE PRODUCT
// ============================================
export const updateProduct = createAsyncThunk(
  "sellerProduct/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key === 'images' && Array.isArray(productData.images)) {
          productData.images.forEach((image, index) => {
            if (image instanceof File) {
              formData.append(`images`, image);
            }
          });
        } else if (key === 'thumbnail' && productData.thumbnail instanceof File) {
          formData.append('thumbnail', productData.thumbnail);
        } else if (key === 'variants' && Array.isArray(productData.variants)) {
          formData.append('variants', JSON.stringify(productData.variants));
        } else if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });

      const { data } = await axios.put(
        `${API_URL}/seller/products/${id}`,
        formData,
        {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// ============================================
// DELETE PRODUCT
// ============================================
export const deleteProduct = createAsyncThunk(
  "sellerProduct/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.delete(
        `${API_URL}/seller/products/${id}`,
        { headers: authHeader() }
      );
      return { id, message: data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

// ============================================
// GET PRODUCT LIMIT STATUS
// ============================================
export const fetchProductLimitStatus = createAsyncThunk(
  "sellerProduct/fetchProductLimitStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/seller/products/limit-status`,
        { headers: authHeader() }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product limit status"
      );
    }
  }
);

// ============================================
// BULK UPLOAD PRODUCTS
// ============================================
export const bulkUploadProducts = createAsyncThunk(
  "sellerProduct/bulkUploadProducts",
  async (products, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/seller/products/bulk-upload`,
        { products },
        { headers: authHeader() }
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to bulk upload products"
      );
    }
  }
);

// ============================================
// SLICE
// ============================================
const sellerProductSlice = createSlice({
  name: "sellerProduct",
  initialState: {
    products: [],
    categories: [],
    selectedProduct: null,
    limitStatus: null,
    isLoading: false,
    isSaving: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    resetProductState: (state) => {
      state.products = [];
      state.selectedProduct = null;
      state.error = null;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.limitStatus = action.payload.limitStatus;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        state.products.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.selectedProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p._id !== action.payload.id);
        state.pagination.total -= 1;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Limit Status
      .addCase(fetchProductLimitStatus.fulfilled, (state, action) => {
        state.limitStatus = action.payload;
      })

      // Bulk Upload
      .addCase(bulkUploadProducts.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(bulkUploadProducts.fulfilled, (state, action) => {
        state.isSaving = false;
        state.products = [...action.payload.created, ...state.products];
        state.pagination.total += action.payload.successCount;
        if (state.limitStatus) {
          state.limitStatus.used += action.payload.successCount;
          state.limitStatus.remaining -= action.payload.successCount;
        }
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearProductError,
  setSelectedProduct,
  clearSelectedProduct,
  resetProductState,
} = sellerProductSlice.actions;

export default sellerProductSlice.reducer;