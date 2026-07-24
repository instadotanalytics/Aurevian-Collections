// src/redux/slices/checkoutSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Validate referral code
export const validateReferralCode = createAsyncThunk(
  "checkout/validateReferralCode",
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/referrals/validate",
        { code, cartTotal },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error validating referral code"
      );
    }
  }
);

// Apply referral code
export const applyReferralCode = createAsyncThunk(
  "checkout/applyReferralCode",
  async ({ code, cartTotal }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/referrals/apply",
        { code, cartTotal },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error applying referral code"
      );
    }
  }
);

// Remove referral code
export const removeReferralCode = createAsyncThunk(
  "checkout/removeReferralCode",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "/api/referrals/remove",
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error removing referral code"
      );
    }
  }
);

const initialState = {
  referralCode: null,
  appliedDiscount: 0,
  loading: false,
  error: null,
  validationResult: null,
  isApplied: false,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    clearReferralData: (state) => {
      state.referralCode = null;
      state.appliedDiscount = 0;
      state.loading = false;
      state.error = null;
      state.validationResult = null;
      state.isApplied = false;
    },
    setAppliedDiscount: (state, action) => {
      state.appliedDiscount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate referral code
      .addCase(validateReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateReferralCode.fulfilled, (state, action) => {
        state.loading = false;
        state.validationResult = action.payload.data;
        state.error = null;
      })
      .addCase(validateReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Validation failed";
        state.validationResult = null;
      })
      // Apply referral code
      .addCase(applyReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyReferralCode.fulfilled, (state, action) => {
        state.loading = false;
        state.isApplied = true;
        state.appliedDiscount = action.payload.data.discountAmount;
        state.referralCode = action.payload.data.code;
        state.error = null;
      })
      .addCase(applyReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to apply referral code";
        state.isApplied = false;
      })
      // Remove referral code
      .addCase(removeReferralCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeReferralCode.fulfilled, (state) => {
        state.loading = false;
        state.referralCode = null;
        state.appliedDiscount = 0;
        state.isApplied = false;
        state.validationResult = null;
        state.error = null;
      })
      .addCase(removeReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove referral code";
      });
  },
});

export const { clearReferralData, setAppliedDiscount } = checkoutSlice.actions;
export default checkoutSlice.reducer;