import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import superAdminReducer from "./slices/superAdminSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "auth/login/fulfilled",
          "auth/logout",
          "superAdmin/login/fulfilled",
          "superAdmin/logout",
        ],
      },
    }),
});

export default store;