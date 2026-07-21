// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import superAdminReducer from "./slices/superAdminSlice.js";
import sellerReducer from "./slices/sellerSlice.js";
import bannerReducer from './slices/bannerSlice.js';
import blogReducer from './slices/blogSlice.js'; // ✅ ADD BLOG REDUCER

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
    seller: sellerReducer,
    banners: bannerReducer,
    blogs: blogReducer, // ✅ ADD BLOG REDUCER HERE
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
          
          // ✅ Blog actions
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
          
          // ✅ Blog paths
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
        ],
      },
    }),
});

export default store;