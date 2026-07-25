// src/redux/slices/subscriptionPlanSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = () => {
  const token =
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================
// THUNKS
// ============================================
export const fetchAllPlans = createAsyncThunk(
  "subscriptionPlans/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/super-admin/subscription-plans`,
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load plans",
      );
    }
  },
);

export const createPlan = createAsyncThunk(
  "subscriptionPlans/create",
  async (planData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/super-admin/subscription-plans`,
        planData,
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create plan",
      );
    }
  },
);

export const updatePlan = createAsyncThunk(
  "subscriptionPlans/update",
  async ({ id, planData }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${API_URL}/super-admin/subscription-plans/${id}`,
        planData,
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update plan",
      );
    }
  },
);

export const togglePlanStatus = createAsyncThunk(
  "subscriptionPlans/toggleStatus",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${API_URL}/super-admin/subscription-plans/${id}/toggle`,
        {},
        { headers: authHeader() },
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle plan status",
      );
    }
  },
);

export const deletePlan = createAsyncThunk(
  "subscriptionPlans/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/super-admin/subscription-plans/${id}`, {
        headers: authHeader(),
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete plan",
      );
    }
  },
);

// ============================================
// SLICE
// ============================================
const subscriptionPlanSlice = createSlice({
  name: "subscriptionPlans",
  initialState: {
    plans: [],
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {
    clearSubscriptionPlanError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchAllPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createPlan.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isSaving = false;
        state.plans.push(action.payload);
        state.plans.sort((a, b) => a.order - b.order);
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      .addCase(updatePlan.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.isSaving = false;
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(togglePlanStatus.fulfilled, (state, action) => {
        const idx = state.plans.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(togglePlanStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionPlanError } = subscriptionPlanSlice.actions;
export default subscriptionPlanSlice.reducer;
