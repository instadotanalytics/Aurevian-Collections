import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

// ============================================
// HELPERS
// ============================================

export const getKycStatus = (seller) =>
  seller?.kyc?.status || seller?.kycStatus || "not_submitted";

// ============================================
// ASYNC THUNKS
// ============================================

// Register Seller
export const registerSeller = createAsyncThunk(
  "seller/register",
  async (sellerData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/seller/register`,
        sellerData,
      );
      if (response.data.success) {
        localStorage.setItem("sellerEmail", sellerData.email);
        localStorage.setItem("sellerPhone", sellerData.phone);

        if (response.data.otpDeliveryStatus) {
          console.log(
            "📊 OTP Delivery Status:",
            response.data.otpDeliveryStatus,
          );
          console.log(
            "📧 Email OTP:",
            response.data.otpDeliveryStatus.email ? "✅ Sent" : "❌ Failed",
          );
          console.log(
            "📱 Phone OTP:",
            response.data.otpDeliveryStatus.phone ? "✅ Sent" : "❌ Failed",
          );
        }

        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Verify Email OTP
export const verifyEmailOTP = createAsyncThunk(
  "seller/verifyEmailOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/seller/verify-email`, {
        email,
        otp,
      });
      if (response.data.success) {
        toast.success("Email verified successfully!");
        return response.data;
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "OTP verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Verify Phone OTP
export const verifyPhoneOTP = createAsyncThunk(
  "seller/verifyPhoneOTP",
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/seller/verify-phone`, {
        phone,
        otp,
      });
      if (response.data.success) {
        toast.success("Phone verified successfully!");
        return response.data;
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "OTP verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  "seller/resendOTP",
  async ({ contact, type }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/seller/resend-otp`, {
        contact,
        type,
      });
      if (response.data.success) {
        if (response.data.otpDeliveryStatus) {
          const { email, phone } = response.data.otpDeliveryStatus;
          console.log(
            "📊 Resend OTP Delivery Status:",
            response.data.otpDeliveryStatus,
          );

          if (email && phone) {
            toast.success("✅ OTPs resent successfully!");
          } else if (email && !phone) {
            toast.error(
              "⚠️ Email OTP resent, but phone OTP failed. Please check your phone number.",
            );
          } else if (!email && phone) {
            toast.error(
              "⚠️ Phone OTP resent, but email OTP failed. Please check your email.",
            );
          } else {
            toast.error("❌ Failed to resend OTPs. Please try again.");
          }
        } else {
          toast.success(
            `OTP sent to your ${type === "email" ? "email" : "phone"}!`,
          );
        }
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Login Seller
export const sellerLogin = createAsyncThunk(
  "seller/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/seller/login`, {
        email,
        password,
      });
      if (response.data.success) {
        const { data, tokens } = response.data;
        localStorage.setItem("sellerAccessToken", tokens.accessToken);
        localStorage.setItem("sellerRefreshToken", tokens.refreshToken);
        toast.success("Login successful!");
        return data;
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      const status = error.response?.data?.status;
      toast.error(message);
      return rejectWithValue({ message, status });
    }
  },
);

// Get Current Seller
export const fetchCurrentSeller = createAsyncThunk(
  "seller/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      if (!token) {
        return rejectWithValue("No token found");
      }
      const response = await axios.get(`${API_URL}/seller/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("sellerAccessToken");
        localStorage.removeItem("sellerRefreshToken");
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller",
      );
    }
  },
);

// Update Seller Profile
export const updateSellerProfile = createAsyncThunk(
  "seller/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      const response = await axios.put(
        `${API_URL}/seller/profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        return response.data.data;
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Upload Documents (KYC)
export const uploadSellerDocuments = createAsyncThunk(
  "seller/uploadDocuments",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      const response = await axios.post(
        `${API_URL}/seller/upload-documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.success) {
        toast.success("Documents uploaded successfully!");
        return response.data.data;
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to upload documents";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Get Verification Status
export const fetchVerificationStatus = createAsyncThunk(
  "seller/fetchVerificationStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      const response = await axios.get(
        `${API_URL}/seller/verification-status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch verification status",
      );
    }
  },
);

// Get Dashboard Stats
export const fetchSellerDashboard = createAsyncThunk(
  "seller/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      const response = await axios.get(`${API_URL}/seller/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard",
      );
    }
  },
);

// Get Recent Orders
export const fetchRecentOrders = createAsyncThunk(
  "seller/fetchRecentOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      const response = await axios.get(`${API_URL}/seller/orders/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders",
      );
    }
  },
);

// Get Recent Activities
export const fetchRecentActivities = createAsyncThunk(
  "seller/fetchRecentActivities",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      const response = await axios.get(`${API_URL}/seller/activities/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch activities",
      );
    }
  },
);

// Logout Seller
export const sellerLogout = createAsyncThunk(
  "seller/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("sellerAccessToken");
      if (token) {
        await axios.post(
          `${API_URL}/seller/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("sellerAccessToken");
      localStorage.removeItem("sellerRefreshToken");
    }
  },
);

// ============================================
// SLICE
// ============================================
const initialState = {
  seller: null,
  isAuthenticated: false,
  isLoading: false,
  dashboardLoading: false,
  ordersLoading: false,
  activitiesLoading: false,
  error: null,
  status: "idle",
  dashboardStats: null,
  recentOrders: [],
  recentActivities: [],
  registrationData: null,
  verificationStatus: null,
  otpDeliveryStatus: null,
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    clearSellerError: (state) => {
      state.error = null;
    },
    resetSellerState: (state) => {
      state.seller = null;
      state.isAuthenticated = false;
      state.error = null;
      state.dashboardStats = null;
      state.recentOrders = [];
      state.recentActivities = [];
      state.status = "idle";
      state.otpDeliveryStatus = null;
    },
    clearOtpDeliveryStatus: (state) => {
      state.otpDeliveryStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ============================================
      // REGISTER
      // ============================================
      .addCase(registerSeller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.status = "loading";
        state.otpDeliveryStatus = null;
      })
      .addCase(registerSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationData = action.payload;
        state.seller =
          action.payload.data?.seller || action.payload.data || action.payload;
        state.isAuthenticated = false;
        state.status = "succeeded";
        state.otpDeliveryStatus = action.payload.otpDeliveryStatus || null;

        if (state.otpDeliveryStatus) {
          const { email, phone } = state.otpDeliveryStatus;

          if (email && phone) {
            toast.success("✅ OTPs sent successfully to email and phone!");
          } else if (email && !phone) {
            toast.error(
              "⚠️ Email OTP sent, but phone OTP failed to send. Please check your phone number.",
            );
          } else if (!email && phone) {
            toast.error(
              "⚠️ Phone OTP sent, but email OTP failed to send. Please check your email.",
            );
          } else {
            toast.error("❌ Failed to send OTPs. Please try again.");
          }
        }
      })
      .addCase(registerSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = "failed";
        state.otpDeliveryStatus = null;
      })

      // ============================================
      // LOGIN
      // ============================================
      .addCase(sellerLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(sellerLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seller = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(sellerLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Login failed";
        state.status = "failed";
      })

      // ============================================
      // FETCH CURRENT SELLER
      // ============================================
      .addCase(fetchCurrentSeller.pending, (state) => {
        state.isLoading = true;
        state.status = "loading";
      })
      .addCase(fetchCurrentSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seller = action.payload;
        state.isAuthenticated = true;
        state.status = "succeeded";
      })
      .addCase(fetchCurrentSeller.rejected, (state) => {
        state.isLoading = false;
        state.seller = null;
        state.isAuthenticated = false;
        state.status = "failed";
      })

      // ============================================
      // UPDATE PROFILE
      // ============================================
      .addCase(updateSellerProfile.pending, (state) => {
        state.isLoading = true;
        state.status = "loading";
      })
      .addCase(updateSellerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seller = action.payload;
        state.error = null;
        state.status = "succeeded";
      })
      .addCase(updateSellerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = "failed";
      })

      // ============================================
      // UPLOAD DOCUMENTS (KYC)
      // ============================================
      .addCase(uploadSellerDocuments.pending, (state) => {
        state.isLoading = true;
        state.status = "loading";
      })
      .addCase(uploadSellerDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.seller) {
          state.seller.documents = action.payload.documents;

          if (!state.seller.verification) {
            state.seller.verification = {};
          }
          state.seller.verification.kycStatus = action.payload.kycStatus;
          state.seller.kycStatus = action.payload.kycStatus;
          state.seller.status = action.payload.status;
        }
        state.status = "succeeded";
      })
      .addCase(uploadSellerDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = "failed";
      })

      // ============================================
      // VERIFY EMAIL OTP
      // ============================================
      .addCase(verifyEmailOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailOTP.fulfilled, (state) => {
        state.isLoading = false;
        if (state.seller) {
          state.seller.emailVerified = true;
        }
      })
      .addCase(verifyEmailOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============================================
      // VERIFY PHONE OTP
      // ============================================
      .addCase(verifyPhoneOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPhoneOTP.fulfilled, (state) => {
        state.isLoading = false;
        if (state.seller) {
          state.seller.phoneVerified = true;
        }
      })
      .addCase(verifyPhoneOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ============================================
      // RESEND OTP
      // ============================================
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.otpDeliveryStatus = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpDeliveryStatus = action.payload.otpDeliveryStatus || null;
        state.status = "succeeded";
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = "failed";
      })

      // ============================================
      // VERIFICATION STATUS
      // ============================================
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        state.verificationStatus = action.payload;
      })

      // ============================================
      // DASHBOARD STATS
      // ============================================
      .addCase(fetchSellerDashboard.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(fetchSellerDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchSellerDashboard.rejected, (state) => {
        state.isLoading = false;
        state.status = "failed";
      })

      // ============================================
      // RECENT ORDERS
      // ============================================
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload;
      })

      // ============================================
      // RECENT ACTIVITIES
      // ============================================
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recentActivities = action.payload;
      })

      // ============================================
      // LOGOUT
      // ============================================
      .addCase(sellerLogout.fulfilled, (state) => {
        state.seller = null;
        state.isAuthenticated = false;
        state.dashboardStats = null;
        state.recentOrders = [];
        state.recentActivities = [];
        state.status = "idle";
        state.otpDeliveryStatus = null;
      });
  },
});

export const { clearSellerError, resetSellerState, clearOtpDeliveryStatus } =
  sellerSlice.actions;
export default sellerSlice.reducer;
