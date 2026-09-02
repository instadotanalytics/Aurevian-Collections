// src/redux/slices/returnSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as returnApi from "../../api/returnApi.js";

export const fetchSellerReturns = createAsyncThunk(
  "returns/fetchSeller",
  async (_, { rejectWithValue }) => {
    try {
      const res = await returnApi.getSellerReturnRequests();
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const approveSellerReturn = createAsyncThunk(
  "returns/approve",
  async (id, { rejectWithValue }) => {
    try {
      const res = await returnApi.sellerApproveReturn(id);
      if (res.success) return res.data.returnRequest;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const rejectSellerReturn = createAsyncThunk(
  "returns/reject",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await returnApi.sellerRejectReturn(id, reason);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const retrySellerReturnSync = createAsyncThunk(
  "returns/retrySync",
  async (id, { rejectWithValue }) => {
    try {
      const res = await returnApi.retryReturnShiprocketSync(id);
      if (res.success) return res.data.returnRequest;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const updateSellerReturnStatus = createAsyncThunk(
  "returns/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await returnApi.updateReturnStatus(id, status);
      if (res.success) return res.data;
      return rejectWithValue(res.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

const initialState = {
  sellerReturns: [],
  isLoading: false,
  error: null,
};

const replaceReturn = (state, updated) => {
  if (!updated?._id) return;
  state.sellerReturns = state.sellerReturns.map((r) =>
    r._id === updated._id ? { ...r, ...updated } : r,
  );
};

const returnSlice = createSlice({
  name: "returns",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerReturns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerReturns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellerReturns = action.payload || [];
      })
      .addCase(fetchSellerReturns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(approveSellerReturn.fulfilled, (state, action) => {
        replaceReturn(state, action.payload);
      })
      .addCase(rejectSellerReturn.fulfilled, (state, action) => {
        replaceReturn(state, action.payload);
      })
      .addCase(retrySellerReturnSync.fulfilled, (state, action) => {
        replaceReturn(state, action.payload);
      })
      .addCase(updateSellerReturnStatus.fulfilled, (state, action) => {
        replaceReturn(state, action.payload);
      });
  },
});

export default returnSlice.reducer;
