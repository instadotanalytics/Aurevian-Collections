// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderApi from "../../api/orderApi.js";

export const fetchMyOrders = createAsyncThunk(
  "orders/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderApi.getMyOrders();
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchSellerOrders = createAsyncThunk(
  "orders/fetchSeller",
  async (_, { rejectWithValue }) => {
    try {
      const res = await orderApi.getSellerOrders();
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateSellerOrder = createAsyncThunk(
  "orders/updateSellerStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await orderApi.updateSellerOrderStatus(id, status);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  myOrders: [],
  sellerOrders: [],
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload || [];
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSellerOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellerOrders = action.payload || [];
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSellerOrder.fulfilled, (state, action) => {
        const updated = action.payload;
        state.sellerOrders = state.sellerOrders.map((o) =>
          o._id === updated._id
            ? { ...o, orderStatus: updated.orderStatus }
            : o,
        );
      });
  },
});

export default orderSlice.reducer;
