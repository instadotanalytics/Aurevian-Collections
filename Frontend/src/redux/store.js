// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import superAdminReducer from "./slices/superAdminSlice.js";
import sellerReducer from "./slices/sellerSlice.js";
import bannerReducer from "./slices/bannerSlice.js";
import blogReducer from "./slices/blogSlice.js";
import profileReducer from "./slices/profileSlice.js"; // ✅ ADD PROFILE REDUCER
import sellerSubscriptionReducer from "./slices/sellerSubscriptionSlice.js"; // ✅ ADD SUBSCRIPTION REDUCER

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
    seller: sellerReducer,
    banners: bannerReducer,
    blogs: blogReducer,
    profile: profileReducer, // ✅ ADD PROFILE REDUCER HERE
    sellerSubscription: sellerSubscriptionReducer, // ✅ ADD SUBSCRIPTION REDUCER HERE
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ Ignore these action types
        ignoredActions: [
          // Auth actions
          "auth/login/fulfilled",
          "auth/logout",

          // Super Admin actions
          "superAdmin/login/fulfilled",
          "superAdmin/logout",

          // Seller actions
          "seller/login/fulfilled",
          "seller/logout",
          "seller/register/fulfilled",
          "seller/fetchCurrent/fulfilled",
          "seller/updateProfile/fulfilled",
          "seller/uploadDocuments/fulfilled",
          "seller/fetchDashboard/fulfilled",

          // Banner actions
          "banners/fetchActive/fulfilled",
          "banners/fetchAll/fulfilled",
          "banners/create/fulfilled",
          "banners/create/pending",
          "banners/create/rejected",
          "banners/update/fulfilled",
          "banners/update/pending",
          "banners/update/rejected",
          "banners/delete/fulfilled",
          "banners/toggle/fulfilled",
          "banners/updateOrder/fulfilled",

          // Blog actions
          "blogs/fetchAll/fulfilled",
          "blogs/fetchAll/pending",
          "blogs/fetchAll/rejected",
          "blogs/fetchBySlug/fulfilled",
          "blogs/fetchBySlug/pending",
          "blogs/fetchBySlug/rejected",
          "blogs/search/fulfilled",
          "blogs/search/pending",
          "blogs/search/rejected",
          "blogs/fetchAllAdmin/fulfilled",
          "blogs/fetchAllAdmin/pending",
          "blogs/fetchAllAdmin/rejected",
          "blogs/create/fulfilled",
          "blogs/create/pending",
          "blogs/create/rejected",
          "blogs/update/fulfilled",
          "blogs/update/pending",
          "blogs/update/rejected",
          "blogs/delete/fulfilled",
          "blogs/delete/pending",
          "blogs/delete/rejected",

          // Profile actions
          "profile/fetchProfile/fulfilled",
          "profile/fetchProfile/pending",
          "profile/fetchProfile/rejected",
          "profile/updateProfile/fulfilled",
          "profile/updateProfile/pending",
          "profile/updateProfile/rejected",
          "profile/uploadAvatar/fulfilled",
          "profile/uploadAvatar/pending",
          "profile/uploadAvatar/rejected",
          "profile/addAddress/fulfilled",
          "profile/addAddress/pending",
          "profile/addAddress/rejected",
          "profile/updateAddress/fulfilled",
          "profile/updateAddress/pending",
          "profile/updateAddress/rejected",
          "profile/deleteAddress/fulfilled",
          "profile/deleteAddress/pending",
          "profile/deleteAddress/rejected",
          "profile/fetchOrders/fulfilled",
          "profile/fetchOrders/pending",
          "profile/fetchOrders/rejected",
          "profile/fetchWishlist/fulfilled",
          "profile/fetchWishlist/pending",
          "profile/fetchWishlist/rejected",
          "profile/removeWishlist/fulfilled",
          "profile/removeWishlist/pending",
          "profile/removeWishlist/rejected",
          "profile/updatePreferences/fulfilled",
          "profile/updatePreferences/pending",
          "profile/updatePreferences/rejected",

          // Seller Subscription actions
          "sellerSubscription/fetchPlans/fulfilled",
          "sellerSubscription/fetchPlans/pending",
          "sellerSubscription/fetchPlans/rejected",
          "sellerSubscription/fetchCurrent/fulfilled",
          "sellerSubscription/fetchCurrent/pending",
          "sellerSubscription/fetchCurrent/rejected",
          "sellerSubscription/fetchHistory/fulfilled",
          "sellerSubscription/fetchHistory/pending",
          "sellerSubscription/fetchHistory/rejected",
          "sellerSubscription/upgradePlan/fulfilled",
          "sellerSubscription/upgradePlan/pending",
          "sellerSubscription/upgradePlan/rejected",
          "sellerSubscription/cancel/fulfilled",
          "sellerSubscription/cancel/pending",
          "sellerSubscription/cancel/rejected",
        ],

        // ✅ Ignore these action paths
        ignoredActionPaths: [
          "payload.createdAt",
          "payload.updatedAt",
          "payload.lastLogin",
          "payload.registrationDate",
          "payload.statusUpdatedAt",
          "payload.approvedAt",
          "payload.rejectedAt",
          "payload.suspendedAt",
          "payload.timestamp",
          "payload.date",
          "payload.startDate",
          "payload.endDate",
          "payload.publishedAt",
          "payload.publishedAt",
          "payload.subscriptionStartedAt",
          "payload.subscriptionExpiresAt",
          "payload.plan.startDate",
          "payload.plan.endDate",
          "payload.lastOrder.createdAt",
          "payload.lastOrder.updatedAt",
          "payload.lastOrder.startDate",
          "payload.lastOrder.endDate",
          "meta.arg", // Fix for FormData serialization
        ],

        // ✅ Ignore these paths in state
        ignoredPaths: [
          // Seller paths
          "seller.seller.createdAt",
          "seller.seller.updatedAt",
          "seller.seller.lastLogin",
          "seller.seller.registrationDate",
          "seller.seller.statusUpdatedAt",
          "seller.seller.approvedAt",
          "seller.seller.rejectedAt",
          "seller.seller.suspendedAt",
          "seller.dashboardStats",
          "seller.recentOrders",
          "seller.recentActivities",

          // Banner paths
          "banners.banners.*.createdAt",
          "banners.banners.*.updatedAt",
          "banners.banners.*.startDate",
          "banners.banners.*.endDate",
          "banners.activeBanners.*.createdAt",
          "banners.activeBanners.*.updatedAt",
          "banners.activeBanners.*.startDate",
          "banners.activeBanners.*.endDate",
          "banners.selectedBanner.createdAt",
          "banners.selectedBanner.updatedAt",
          "banners.selectedBanner.startDate",
          "banners.selectedBanner.endDate",

          // Blog paths
          "blogs.blogs.*.createdAt",
          "blogs.blogs.*.updatedAt",
          "blogs.blogs.*.publishedAt",
          "blogs.currentBlog.createdAt",
          "blogs.currentBlog.updatedAt",
          "blogs.currentBlog.publishedAt",
          "blogs.searchResults.*.createdAt",
          "blogs.searchResults.*.updatedAt",
          "blogs.searchResults.*.publishedAt",
          "blogs.stats",

          // Profile paths
          "profile.profile.createdAt",
          "profile.profile.updatedAt",
          "profile.profile.lastLogin",
          "profile.profile.dateOfBirth",
          "profile.profile.createdAt",
          "profile.orders.*.createdAt",
          "profile.orders.*.updatedAt",
          "profile.orders.*.deliveredAt",
          "profile.orders.*.shippedAt",
          "profile.orders.*.confirmedAt",

          // Seller Subscription paths
          "sellerSubscription.current.subscriptionStartedAt",
          "sellerSubscription.current.subscriptionExpiresAt",
          "sellerSubscription.current.lastOrder.createdAt",
          "sellerSubscription.current.lastOrder.updatedAt",
          "sellerSubscription.current.lastOrder.startDate",
          "sellerSubscription.current.lastOrder.endDate",
          "sellerSubscription.history.*.createdAt",
          "sellerSubscription.history.*.updatedAt",
          "sellerSubscription.history.*.startDate",
          "sellerSubscription.history.*.endDate",
        ],
      },
    }),
});

export default store;
