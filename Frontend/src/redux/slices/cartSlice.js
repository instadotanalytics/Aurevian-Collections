// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cartApi from "../../api/cartApi.js";

export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.getCart();
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await cartApi.addToCart(productId, quantity);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItem",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await cartApi.updateCartItem(productId, quantity);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await cartApi.removeFromCart(productId);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const clearCartItems = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      const res = await cartApi.clearCart();
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = { items: [], isLoading: false, error: null };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setFromPayload = (state, action) => {
      state.isLoading = false;
      state.items = action.payload?.items || [];
    };
    const setLoading = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const setError = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Something went wrong";
    };

    builder
      .addCase(fetchCart.pending, setLoading)
      .addCase(fetchCart.fulfilled, setFromPayload)
      .addCase(fetchCart.rejected, setError)
      .addCase(addItemToCart.pending, setLoading)
      .addCase(addItemToCart.fulfilled, setFromPayload)
      .addCase(addItemToCart.rejected, setError)
      .addCase(updateItemQuantity.pending, setLoading)
      .addCase(updateItemQuantity.fulfilled, setFromPayload)
      .addCase(updateItemQuantity.rejected, setError)
      .addCase(removeItemFromCart.pending, setLoading)
      .addCase(removeItemFromCart.fulfilled, setFromPayload)
      .addCase(removeItemFromCart.rejected, setError)
      .addCase(clearCartItems.pending, setLoading)
      .addCase(clearCartItems.fulfilled, setFromPayload)
      .addCase(clearCartItems.rejected, setError);
  },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
