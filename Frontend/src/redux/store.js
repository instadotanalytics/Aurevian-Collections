// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import superAdminReducer from "./slices/superAdminSlice.js";
import sellerReducer from "./slices/sellerSlice.js"; // ← ADD THIS IMPORT

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
    seller: sellerReducer, // ← ADD THIS
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/login/fulfilled",
          "auth/logout",
          "superAdmin/login/fulfilled",
          "superAdmin/logout",
          // Add seller actions to ignore
          "seller/login/fulfilled",
          "seller/logout",
          "seller/register/fulfilled",
          "seller/fetchCurrent/fulfilled",
          "seller/updateProfile/fulfilled",
          "seller/uploadDocuments/fulfilled",
          "seller/fetchDashboard/fulfilled",
        ],
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
        ],
        ignoredPaths: [
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
        ],
      },
    }),
});

export default store;