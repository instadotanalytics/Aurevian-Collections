// src/redux/slices/supportSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ============================================
// ✅ HELPER: GET AUTH HEADERS
// ============================================
const getAuthHeaders = () => {
  const token = 
    localStorage.getItem("superAdminToken") || 
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");
  
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    withCredentials: true,
  };
};

// ============================================
// ✅ CREATE SUPPORT TICKET (Public)
// ============================================
export const createSupportTicket = createAsyncThunk(
  "support/createTicket",
  async (formData, { rejectWithValue }) => {
    try {
      const config = getAuthHeaders();
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/support/create`,
        formData,
        config
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create support ticket"
      );
    }
  }
);

// ============================================
// ✅ GET USER TICKETS
// ============================================
export const getUserTickets = createAsyncThunk(
  "support/getUserTickets",
  async (params, { rejectWithValue }) => {
    try {
      const config = getAuthHeaders();
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/support/my-tickets`,
        {
          ...config,
          params: params || {},
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }
);

// ============================================
// ✅ GET SINGLE TICKET
// ============================================
export const getTicketById = createAsyncThunk(
  "support/getTicketById",
  async (ticketId, { rejectWithValue }) => {
    try {
      const config = getAuthHeaders();
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/support/my-tickets/${ticketId}`,
        config
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ticket"
      );
    }
  }
);

// ============================================
// ✅ ADMIN: GET ALL TICKETS
// ============================================
export const getAllTickets = createAsyncThunk(
  "support/getAllTickets",
  async (params, { rejectWithValue }) => {
    try {
      const token = 
        localStorage.getItem("superAdminToken") || 
        localStorage.getItem("accessToken");
      
      console.log("🔍 Fetching all tickets...");
      console.log("📌 Token present:", token ? "✅ Yes" : "❌ No");
      
      if (!token) {
        return rejectWithValue("No authentication token found. Please login again.");
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params: params || {},
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/support/admin/all`,
        config
      );

      console.log("✅ Tickets fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching tickets:", error.response?.status, error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }
);

// ============================================
// ✅ ADMIN: REPLY TO TICKET - FIXED ROUTE
// ============================================
export const replyToTicket = createAsyncThunk(
  "support/replyToTicket",
  async ({ ticketId, message, status }, { rejectWithValue }) => {
    try {
      const token = 
        localStorage.getItem("superAdminToken") || 
        localStorage.getItem("accessToken");
      
      console.log("📌 Replying to ticket:", ticketId);
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      // ✅ CORRECT ROUTE: /admin/:id/reply
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/support/admin/${ticketId}/reply`,
        { message, status },
        config
      );

      console.log("✅ Reply sent successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error sending reply:", error.response?.status, error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reply"
      );
    }
  }
);

// ============================================
// ✅ ADMIN: UPDATE TICKET STATUS
// ============================================
export const updateTicketStatus = createAsyncThunk(
  "support/updateTicketStatus",
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const token = 
        localStorage.getItem("superAdminToken") || 
        localStorage.getItem("accessToken");
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/support/admin/${ticketId}/status`,
        { status },
        config
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);

// ============================================
// ✅ ADMIN: GET TICKET STATS
// ============================================
export const getTicketStats = createAsyncThunk(
  "support/getTicketStats",
  async (_, { rejectWithValue }) => {
    try {
      const token = 
        localStorage.getItem("superAdminToken") || 
        localStorage.getItem("accessToken");
      
      console.log("🔍 Fetching ticket stats...");
      console.log("📌 Token present:", token ? "✅ Yes" : "❌ No");
      
      if (!token) {
        return rejectWithValue("No authentication token found. Please login again.");
      }
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/support/admin/stats`,
        config
      );

      console.log("✅ Stats fetched successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching stats:", error.response?.status, error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch stats"
      );
    }
  }
);

// ============================================
// ✅ ADMIN: DELETE TICKET
// ============================================
export const deleteTicket = createAsyncThunk(
  "support/deleteTicket",
  async (ticketId, { rejectWithValue }) => {
    try {
      const token = 
        localStorage.getItem("superAdminToken") || 
        localStorage.getItem("accessToken");
      
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      };

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/support/admin/${ticketId}`,
        config
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete ticket"
      );
    }
  }
);

// ============================================
// ✅ INITIAL STATE
// ============================================
const initialState = {
  tickets: [],
  currentTicket: null,
  allTickets: [],
  stats: {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  },
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// ============================================
// ✅ SLICE
// ============================================
const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {
    clearSupportError: (state) => {
      state.error = null;
    },
    clearSupportSuccess: (state) => {
      state.success = false;
    },
    resetSupportState: (state) => {
      state.tickets = [];
      state.currentTicket = null;
      state.allTickets = [];
      state.stats = {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
      };
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE TICKET
      .addCase(createSupportTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentTicket = action.payload.data?.ticket || null;
        state.error = null;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET USER TICKETS
      .addCase(getUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data?.tickets || [];
        state.pagination = action.payload.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        };
        state.error = null;
      })
      .addCase(getUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET TICKET BY ID
      .addCase(getTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload.data;
        state.error = null;
      })
      .addCase(getTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET ALL TICKETS (ADMIN)
      .addCase(getAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.allTickets = action.payload.data?.tickets || [];
        state.stats = action.payload.data?.stats || state.stats;
        state.pagination = action.payload.data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        };
        state.error = null;
      })
      .addCase(getAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REPLY TO TICKET (ADMIN)
      .addCase(replyToTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(replyToTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentTicket = action.payload.data;
        state.error = null;
      })
      .addCase(replyToTicket.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // UPDATE TICKET STATUS (ADMIN)
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentTicket = action.payload.data;
        state.error = null;
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET TICKET STATS (ADMIN)
      .addCase(getTicketStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data || state.stats;
        state.error = null;
      })
      .addCase(getTicketStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE TICKET (ADMIN)
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSupportError,
  clearSupportSuccess,
  resetSupportState,
} = supportSlice.actions;

export const selectSupportTickets = (state) => state.support.tickets;
export const selectAllTickets = (state) => state.support.allTickets;
export const selectCurrentTicket = (state) => state.support.currentTicket;
export const selectSupportStats = (state) => state.support.stats;
export const selectSupportLoading = (state) => state.support.loading;
export const selectSupportError = (state) => state.support.error;
export const selectSupportSuccess = (state) => state.support.success;
export const selectSupportPagination = (state) => state.support.pagination;

export default supportSlice.reducer;