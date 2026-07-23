// frontend/src/redux/slices/profileSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "../services/profileService";
import toast from "react-hot-toast";

// ============================================
// ASYNC THUNKS
// ============================================

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile();
      return response.data.userProfile;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch profile";
      return rejectWithValue(message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);
      toast.success("Profile updated successfully!");
      return response.data.userProfile;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to update profile";
      toast.error(message);
      return rejectWithValue(error.response?.data?.errors || message);
    }
  },
);

export const uploadAvatar = createAsyncThunk(
  "profile/uploadAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await profileService.uploadAvatar(formData);
      toast.success("Avatar updated successfully!");
      return response.data.userProfile;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to upload avatar";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const addAddress = createAsyncThunk(
  "profile/addAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await profileService.addAddress(addressData);
      toast.success("Address added successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to add address";
      toast.error(message);
      return rejectWithValue(error.response?.data?.errors || message);
    }
  },
);

export const updateAddress = createAsyncThunk(
  "profile/updateAddress",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await profileService.updateAddress(id, addressData);
      toast.success("Address updated successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to update address";
      toast.error(message);
      return rejectWithValue(error.response?.data?.errors || message);
    }
  },
);

export const deleteAddress = createAsyncThunk(
  "profile/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      const response = await profileService.deleteAddress(id);
      toast.success("Address deleted successfully!");
      return { id, ...response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to delete address";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const setDefaultAddress = createAsyncThunk(
  "profile/setDefaultAddress",
  async (id, { rejectWithValue }) => {
    try {
      const response = await profileService.updateAddress(id, { isDefault: true });
      toast.success("Default address updated!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to set default address";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const fetchOrders = createAsyncThunk(
  "profile/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getOrders();
      return response.data.orders;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch orders";
      return rejectWithValue(message);
    }
  },
);

export const fetchWishlist = createAsyncThunk(
  "profile/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getWishlist();
      return response.data.wishlist;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to fetch wishlist";
      return rejectWithValue(message);
    }
  },
);

export const removeWishlist = createAsyncThunk(
  "profile/removeWishlist",
  async (id, { rejectWithValue }) => {
    try {
      const response = await profileService.removeWishlist(id);
      toast.success("Removed from wishlist");
      return { id, ...response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to remove from wishlist";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const updatePreferences = createAsyncThunk(
  "profile/updatePreferences",
  async (preferencesData, { rejectWithValue }) => {
    try {
      const response = await profileService.updatePreferences(preferencesData);
      toast.success("Preferences updated successfully!");
      return response.data.userProfile;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to update preferences";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  profile: null,
  orders: [],
  wishlist: [],
  addresses: [],
  loading: false,
  error: null,
  success: false,
};

// ============================================
// SLICE
// ============================================

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.orders = [];
      state.wishlist = [];
      state.addresses = [];
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========== FETCH PROFILE ==========
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.addresses = action.payload?.addresses || [];
        state.success = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== UPDATE PROFILE ==========
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== UPLOAD AVATAR ==========
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== ADD ADDRESS ==========
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses || [];
        state.profile = action.payload.userProfile || state.profile;
        state.success = true;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== UPDATE ADDRESS ==========
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses || [];
        state.profile = action.payload.userProfile || state.profile;
        state.success = true;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== SET DEFAULT ADDRESS ==========
      .addCase(setDefaultAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses || state.addresses;
        state.profile = action.payload.userProfile || state.profile;
        state.success = true;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== DELETE ADDRESS ==========
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.addresses || state.addresses.filter(
          (address) => address._id !== action.payload.id,
        );
        state.success = true;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== FETCH ORDERS ==========
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        state.success = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== FETCH WISHLIST ==========
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload || [];
        state.success = true;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== REMOVE WISHLIST ==========
      .addCase(removeWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = state.wishlist.filter(
          (item) => item._id !== action.payload.id,
        );
        state.success = true;
      })
      .addCase(removeWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ========== UPDATE PREFERENCES ==========
      .addCase(updatePreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = true;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const { clearProfile, clearError, clearSuccess } = profileSlice.actions;

export default profileSlice.reducer;