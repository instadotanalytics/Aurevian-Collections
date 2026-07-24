// src/redux/slices/sellerSubscriptionSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = () => {
  const token = localStorage.getItem("sellerAccessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// ============================================
// THUNKS
// ============================================
export const fetchPlans = createAsyncThunk(
  "sellerSubscription/fetchPlans",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/seller/subscription/plans`, {
        headers: authHeader(),
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load plans",
      );
    }
  },
);

export const fetchCurrentSubscription = createAsyncThunk(
  "sellerSubscription/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/seller/subscription/current`,
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load subscription",
      );
    }
  },
);

export const fetchSubscriptionHistory = createAsyncThunk(
  "sellerSubscription/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/seller/subscription/history`,
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load history",
      );
    }
  },
);

// ✅ Step 1: create the order (called when the Payment page loads)
export const createSubscriptionOrder = createAsyncThunk(
  "sellerSubscription/createOrder",
  async ({ planId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/seller/subscription/create-order`,
        { planId },
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create order";
      return rejectWithValue(message);
    }
  },
);

// ✅ Step 2: verify the payment (called when the seller clicks "Pay Now")
export const verifySubscriptionPayment = createAsyncThunk(
  "sellerSubscription/verifyPayment",
  async (
    { subscriptionId, razorpayOrderId, razorpayPaymentId, razorpaySignature },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/seller/subscription/verify-payment`,
        {
          subscriptionId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        },
        { headers: authHeader() },
      );
      toast.success(data.message);
      dispatch(fetchCurrentSubscription());
      dispatch(fetchPlans());
      return data.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Payment verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const cancelSubscriptionPlan = createAsyncThunk(
  "sellerSubscription/cancel",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/seller/subscription/cancel`,
        {},
        { headers: authHeader() },
      );
      toast.success(data.message);
      dispatch(fetchCurrentSubscription());
      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel subscription";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// ============================================
// SLICE
// ============================================
const sellerSubscriptionSlice = createSlice({
  name: "sellerSubscription",
  initialState: {
    plans: [],
    currentPlanId: "free",
    current: null,
    history: [],
    loading: false,
    error: null,

    // Payment-page specific state
    order: null, // { subscriptionId, orderId, amount, currency, keyId, isMockPayment, plan }
    orderStatus: "idle", // idle | creating | ready | error
    paymentStatus: "idle", // idle | processing | success | failed
    paymentResult: null, // { plan, startDate, endDate }
    paymentError: null,
  },
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
    resetPaymentState: (state) => {
      state.order = null;
      state.orderStatus = "idle";
      state.paymentStatus = "idle";
      state.paymentResult = null;
      state.paymentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Current subscription
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.current = action.payload;
        state.currentPlanId = action.payload?.plan?.id || "free";
      })

      // History
      .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })

      // Create order
      .addCase(createSubscriptionOrder.pending, (state) => {
        state.orderStatus = "creating";
        state.order = null;
        state.paymentError = null;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
        state.orderStatus = "ready";
        state.order = action.payload;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.orderStatus = "error";
        state.paymentError = action.payload;
      })

      // Verify payment
      .addCase(verifySubscriptionPayment.pending, (state) => {
        state.paymentStatus = "processing";
        state.paymentError = null;
      })
      .addCase(verifySubscriptionPayment.fulfilled, (state, action) => {
        state.paymentStatus = "success";
        state.paymentResult = action.payload;
      })
      .addCase(verifySubscriptionPayment.rejected, (state, action) => {
        state.paymentStatus = "failed";
        state.paymentError = action.payload;
      });
  },
});

export const { clearSubscriptionError, resetPaymentState } =
  sellerSubscriptionSlice.actions;
export default sellerSubscriptionSlice.reducer;
