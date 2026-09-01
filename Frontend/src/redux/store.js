import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice.js";
import superAdminReducer from "./slices/superAdminSlice.js";
import sellerReducer from "./slices/sellerSlice.js";
import bannerReducer from "./slices/bannerSlice.js";
import blogReducer from "./slices/blogSlice.js";
import profileReducer from "./slices/profileSlice.js";
import sellerSubscriptionReducer from "./slices/sellerSubscriptionSlice.js";
import subscriptionPlanReducer from "./slices/subscriptionPlanSlice.js";
import supportReducer from "./slices/supportSlice";
import headerConfigReducer from "./slices/headerConfigSlice.js";
import sellerProductReducer from "./slices/sellerProductSlice.js";
import storefrontProductReducer from "./slices/storefrontProductSlice.js";

// ✅ ADDED: Featured Products reducer
import featuredProductReducer from "./slices/featuredProductSlice.js";

import cartReducer from "./slices/cartSlice.js";
import wishlistReducer from "./slices/wishlistSlice.js";
import orderReducer from "./slices/orderSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superAdmin: superAdminReducer,
    seller: sellerReducer,
    banners: bannerReducer,
    blogs: blogReducer,
    profile: profileReducer,
    sellerSubscription: sellerSubscriptionReducer,
    support: supportReducer,
    subscriptionPlans: subscriptionPlanReducer,
    headerConfig: headerConfigReducer,
    sellerProduct: sellerProductReducer,
    storefrontProduct: storefrontProductReducer,

    // ✅ ADDED: Featured Products
    featuredProducts: featuredProductReducer,

    cart: cartReducer,
    wishlist: wishlistReducer,
    orders: orderReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ============================================
        // IGNORED ACTION TYPES
        // ============================================
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
          "seller/updatePickupAddress/fulfilled", // ✅ NEW

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

          // Subscription Plan actions
          "subscriptionPlans/fetchAll/fulfilled",
          "subscriptionPlans/fetchAll/pending",
          "subscriptionPlans/fetchAll/rejected",
          "subscriptionPlans/create/fulfilled",
          "subscriptionPlans/update/fulfilled",
          "subscriptionPlans/toggleStatus/fulfilled",

          // Header Config actions
          "headerConfig/fetchPublic/fulfilled",
          "headerConfig/fetchPublic/rejected",
          "headerConfig/fetchAdmin/fulfilled",
          "headerConfig/fetchAdmin/pending",
          "headerConfig/fetchAdmin/rejected",
          "headerConfig/update/fulfilled",

          // Seller Product actions
          "sellerProduct/fetchProducts/fulfilled",
          "sellerProduct/fetchProducts/pending",
          "sellerProduct/fetchProducts/rejected",
          "sellerProduct/fetchCategories/fulfilled",
          "sellerProduct/fetchCategories/pending",
          "sellerProduct/fetchCategories/rejected",
          "sellerProduct/createProduct/fulfilled",
          "sellerProduct/createProduct/pending",
          "sellerProduct/createProduct/rejected",
          "sellerProduct/updateProduct/fulfilled",
          "sellerProduct/updateProduct/pending",
          "sellerProduct/updateProduct/rejected",
          "sellerProduct/deleteProduct/fulfilled",
          "sellerProduct/deleteProduct/pending",
          "sellerProduct/deleteProduct/rejected",
          "sellerProduct/fetchProductLimitStatus/fulfilled",
          "sellerProduct/fetchProductLimitStatus/pending",
          "sellerProduct/fetchProductLimitStatus/rejected",
          "sellerProduct/bulkUploadProducts/fulfilled",
          "sellerProduct/bulkUploadProducts/pending",
          "sellerProduct/bulkUploadProducts/rejected",

          // Storefront Product actions
          "storefrontProducts/fetchByPlacement/fulfilled",
          "storefrontProducts/fetchByPlacement/pending",
          "storefrontProducts/fetchByPlacement/rejected",
          "storefrontProducts/fetchByPlacement/fulfilled",
          "storefrontProducts/fetchBySlug/fulfilled",
          "storefrontProducts/fetchBySlug/pending",
          "storefrontProducts/fetchBySlug/rejected",

          // Cart actions
          "cart/fetch/fulfilled",
          "cart/addItem/fulfilled",
          "cart/updateItem/fulfilled",
          "cart/removeItem/fulfilled",
          "cart/clear/fulfilled",

          // Wishlist actions
          "wishlist/fetch/fulfilled",
          "wishlist/toggle/fulfilled",
          "wishlist/remove/fulfilled",

          // Order actions
          "orders/fetchMine/fulfilled",
          "orders/fetchSeller/fulfilled",
          "orders/updateSellerStatus/fulfilled",
        ],

        // ============================================
        // IGNORED ACTION PATHS
        // ============================================
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
          "payload.subscriptionStartedAt",
          "payload.subscriptionExpiresAt",
          "payload.lastSyncedAt", // ✅ NEW — Seller pickupAddress.lastSyncedAt
          "payload.plan.startDate",
          "payload.plan.endDate",
          "payload.lastOrder.createdAt",
          "payload.lastOrder.updatedAt",
          "payload.lastOrder.startDate",
          "payload.lastOrder.endDate",
          "meta.arg",

          // Seller Product paths
          "payload.product.createdAt",
          "payload.product.updatedAt",
          "payload.products.*.createdAt",
          "payload.products.*.updatedAt",
          "payload.pagination",
          "payload.limitStatus",

          // Storefront Product paths
          "payload.products.*.createdAt",
          "payload.products.*.updatedAt",
          "payload.pagination",
          "payload.placement",

          // Cart paths
          "payload.items.*.addedAt",
          "payload.createdAt",

          // Order paths
          "payload.placedAt",
        ],

        // ============================================
        // IGNORED STATE PATHS
        // ============================================
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
          "seller.seller.pickupAddress.lastSyncedAt", // ✅ NEW
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

          // Header Config paths
          "headerConfig.config.updatedAt",
          "headerConfig.config.createdAt",

          // Seller Product paths
          "sellerProduct.products.*.createdAt",
          "sellerProduct.products.*.updatedAt",
          "sellerProduct.products.*.pricing.costPrice",
          "sellerProduct.selectedProduct.createdAt",
          "sellerProduct.selectedProduct.updatedAt",
          "sellerProduct.pagination",
          "sellerProduct.limitStatus",

          // Storefront Product paths
          "storefrontProduct.byPlacement.*.products.*.createdAt",
          "storefrontProduct.byPlacement.*.products.*.updatedAt",
          "storefrontProduct.byPlacement.*.pagination",
          "storefrontProduct.currentProduct.createdAt",
          "storefrontProduct.currentProduct.updatedAt",

          // Cart paths
          "cart.items",

          // Wishlist paths
          "wishlist.items",

          // Order paths
          "orders.myOrders",
          "orders.sellerOrders",
        ],
      },
    }),
});

export default store;
