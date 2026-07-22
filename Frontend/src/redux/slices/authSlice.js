// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  googleLogin as googleLoginAPI,
  registerUser as registerUserAPI,
  verifyOTP as verifyOTPAPI,
  resendOTP as resendOTPAPI,
  loginWithEmail as loginWithEmailAPI,
  forgotPassword as forgotPasswordAPI,
  resetPassword as resetPasswordAPI,
  getCurrentUser as getCurrentUserAPI,
  logoutUser as logoutUserAPI,
} from "../../api/authApi.js";
import { AUTH_CONFIG } from "../../utils/constants.js";

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY)) || null,
  isAuthenticated: !!localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN_KEY),
  isLoading: false,
  error: null,
  otpSent: false,
  emailForOTP: null,
  requireVerification: false,
};

// ============================================
// Async Thunks
// ============================================

// ✅ FIXED: Google Login
export const loginWithGoogle = createAsyncThunk(
  "auth/googleLogin",
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await googleLoginAPI(idToken);
      console.log('📊 Google login response:', response);
      
      // ✅ Check if response has success field
      if (response.success) {
        // ✅ Save token if exists
        if (response.token) {
          localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, response.token);
        }
        // ✅ Save user if exists
        if (response.data) {
          localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));
        }
        // ✅ Return full response with success
        return response;
      }
      
      // ✅ If response has data but no success field, treat as success
      if (response.data && !response.success) {
        if (response.token) {
          localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, response.token);
        }
        if (response.data) {
          localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.data));
        }
        return { success: true, data: response.data, token: response.token };
      }
      
      return rejectWithValue(response.message || "Google login failed");
    } catch (error) {
      console.error('❌ Google login error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to login with Google"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUserAPI(userData);
      if (response.success) {
        return { email: response.data.email, message: response.message };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp, type }, { rejectWithValue }) => {
    try {
      const response = await verifyOTPAPI(email, otp, type);
      if (response.success) {
        return { email, message: response.message };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "OTP verification failed");
    }
  }
);

export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async (email, { rejectWithValue }) => {
    try {
      const response = await resendOTPAPI(email);
      if (response.success) {
        return { email, message: response.message };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to resend OTP");
    }
  }
);

export const loginWithEmail = createAsyncThunk(
  "auth/emailLogin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginWithEmailAPI(email, password);
      if (response.success) {
        return response.data;
      }
      if (response.requireVerification) {
        return rejectWithValue({ 
          message: response.message, 
          requireVerification: true,
          email 
        });
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordAPI(email);
      if (response.success) {
        return { email, message: response.message };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send OTP");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPasswordAPI(email, otp, newPassword);
      if (response.success) {
        return { message: response.message };
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Password reset failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUserAPI();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logoutUserAPI();
      if (response.success) {
        return null;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

// ============================================
// Auth Slice
// ============================================

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload));
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.otpSent = false;
      state.emailForOTP = null;
      state.requireVerification = false;
      localStorage.removeItem(AUTH_CONFIG.USER_KEY);
      localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
    },
    setOTPSent: (state, action) => {
      state.otpSent = true;
      state.emailForOTP = action.payload;
    },
    clearOTPState: (state) => {
      state.otpSent = false;
      state.emailForOTP = null;
      state.requireVerification = false;
    },
  },
  extraReducers: (builder) => {
    // ✅ FIXED: Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.error = null;
        state.requireVerification = false;
        
        // ✅ Extract user data properly
        if (action.payload?.data) {
          state.user = action.payload.data;
          localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload.data));
        } else if (action.payload?.user) {
          state.user = action.payload.user;
          localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload.user));
        } else if (action.payload) {
          state.user = action.payload;
          localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload));
        }
        
        // ✅ Save token
        if (action.payload?.token) {
          localStorage.setItem(AUTH_CONFIG.ACCESS_TOKEN_KEY, action.payload.token);
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Google login failed";
        state.user = null;
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.emailForOTP = action.payload.email;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = false;
        state.emailForOTP = null;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "OTP verification failed";
      });

    // Resend OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to resend OTP";
      });

    // Email Login
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.requireVerification = false;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.requireVerification = false;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        if (action.payload?.requireVerification) {
          state.requireVerification = true;
          state.emailForOTP = action.payload.email;
          state.error = action.payload.message;
        } else {
          state.error = action.payload || "Login failed";
        }
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.emailForOTP = action.payload.email;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send OTP";
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = false;
        state.emailForOTP = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Password reset failed";
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Failed to fetch user";
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.otpSent = false;
        state.emailForOTP = null;
        state.requireVerification = false;
        localStorage.removeItem(AUTH_CONFIG.USER_KEY);
        localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN_KEY);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { clearError, setUser, clearAuth, setOTPSent, clearOTPState } = authSlice.actions;
export default authSlice.reducer;