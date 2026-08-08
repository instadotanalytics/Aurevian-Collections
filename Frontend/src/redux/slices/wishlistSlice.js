// src/redux/slices/wishlistSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as wishlistApi from "../../api/wishlistApi.js";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.getWishlist();
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.toggleWishlist(productId);
      if (res.success) return { data: res.data, inWishlist: res.inWishlist };
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await wishlistApi.removeFromWishlist(productId);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = { items: [], isLoading: false, error: null };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    resetWishlistState: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload?.items || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload.data?.items || [];
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
      });
  },
});

export const { resetWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
