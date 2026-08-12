/**
 * Main App Component
 * Sets up routing and global providers with authentication
 */

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { fetchCurrentUser } from "./redux/slices/authSlice.js";
import { fetchCurrentSuperAdmin } from "./redux/slices/superAdminSlice.js";
import { fetchCurrentSeller } from "./redux/slices/sellerSlice.js";

// Components
import PrivateRoute from "./Components/common/PrivateRoute.jsx";
import SuperAdminRoute from "./Components/common/SuperAdminRoute.jsx";
import SellerRoute from "./Components/common/SellerRoute.jsx";
import Navbar from "./Pages/Layout/Header/Navbar.jsx";
import LoadingScreen from "./Components/common/LoadingScreen.jsx";

// ============================================
// SELLER AUTH PROVIDER
// ============================================
import { SellerAuthProvider } from "./contexts/SellerAuthContext";

// Pages
import Home from "./Pages/Home/Home";
import WhyAurevian from "./Pages/About/WhyAurevian";
import Contact from "./Pages/About/Contact";
import Support from "./Pages/About/Support";
import AboutUs from "./Pages/About/AboutUs";
import Franchise from "./Pages/About/Franchise";
import Cart from "./Pages/Cart/Cart";
import Wishlist from "./Pages/Wishlist/Wishlist.jsx";
import Checkout from "./Pages/Checkout/Checkout.jsx";
import OrdersPage from "./Pages/Orders/OrdersPage.jsx";
import OrderSuccess from "./Pages/Orders/OrderSuccess.jsx";
import OrderDetail from "./Pages/Orders/OrderDetail.jsx";
import Story from "./Pages/About/Story";

// ============================================
// AUTHENTICATION PAGES
// ============================================
import Login from "./Auth/Login.jsx";
import Register from "./Auth/Register.jsx";
import VerifyOTP from "./Auth/VerifyOTP.jsx";
import ForgotPassword from "./Auth/ForgotPassowrd";
import ResetPassword from "./Auth/ResetPassword.jsx";
import SuperAdminLogin from "./Pages/SuperAdmin/SuperAdminLogin.jsx";
import SuperAdminDashboard from "./Pages/SuperAdmin/SuperAdminDashboard/SuperAdminDashboard.jsx";
import PrivacyPolicy from "./Auth/PrivacyPolicy.jsx";
import Terms from "./Auth/Terms.jsx";

// ============================================
// SELLER PAGES
// ============================================
import SellerDashboard from "./Pages/Seller/SellerDashboard/SellerDashboard.jsx";
import BecomePartner from "./Pages/Seller/BecomePartner.jsx";
import SellerLogin from "./Pages/Seller/SellerAuth/SellerLogin.jsx";
import SellerRegister from "./Pages/Seller/SellerAuth/SellerRegister.jsx";
import SellerVerifyOTP from "./Pages/Seller/SellerAuth/SellerVerifyOTP.jsx";
import SellerForgotPassword from "./Pages/Seller/SellerAuth/SellerForgotPassword";
import SellerResetPassword from "./Pages/Seller/SellerAuth/SellerResetPassword";
import SellerPayment from "./Pages/Seller/SellerPayment/SellerPayment.jsx";

// ============================================
// BLOG PAGES ✅
// ============================================
import BlogList from "./Pages/UserBlog/BlogList.jsx";
import BlogDetail from "./Pages/UserBlog/BlogDetail.jsx";
import Profile from "./Pages/Profile/Profile.jsx";

import SellerKYC from "./Pages/Seller/SellerKYC/SellerKYC";
import ScrollToTop from "./Pages/Seller/ScrollToTop.jsx";

import Shop from "./Components/Shop/shop.jsx";

import Gifts from "./Components/Gifts/gifts.jsx";
import Collections from "./Components/Collections/Collections.jsx";
import Offers from "./Components/Offers/Offers.jsx";
// import GiftGuide from "./Components/ShopCard/GiftGuide.jsx";

import ProductDetail from "./Pages/Layout/ProductDetail/ProductDetail";

// ============================================
// PRODUCT PAGES ✅ (NEW)
// ============================================
// Public Product Detail Page (Storefront)
// import ProductDetail from "./Pages/ProductDetail/ProductDetail.jsx";

// ============================================
// ROUTES CONSTANTS
// ============================================
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  SHOP: "/shop",

  GIFTS: "/gifts",
  COLLECTIONS: "/collections",
  OFFERS: "/offers",
  GIFT_GUIDE: "/gifts",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS: "/terms",
  DASHBOARD: "/",
  PROFILE: "/profile",
  STORY: "/stories",
  ORDERS: "/orders",
  CHECKOUT: "/checkout",
  ORDER_SUCCESS: "/order-success/:orderId",
  ORDER_DETAIL: "/orders/:id",
  SUPER_ADMIN_LOGIN: "/super-admin/login",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  // Seller Routes
  SELLER_LOGIN: "/seller/login",
  SELLER_REGISTER: "/seller/register",
  SELLER_VERIFY_OTP: "/seller/verify-otp",
  SELLER_DASHBOARD: "/seller/dashboard",
  SELLER_PROFILE: "/seller/profile",
  SELLER_DOCUMENTS: "/seller/documents",
  SELLER_KYC: "/seller/kyc",
  SELLER_ORDERS: "/seller/orders",
  SELLER_PRODUCTS: "/seller/dashboard/products", // Updated: Products inside dashboard
  SELLER_FORGOT_PASSWORD: "/seller/forgot-password",
  SELLER_RESET_PASSWORD: "/seller/reset-password/:token",
  BECOME_A_PARTNER: "/become-a-partner",
  // Blog Routes
  BLOG: "/blog",
  BLOG_DETAIL: "/blog/:slug",
  // Public Product Routes (Storefront)
  PRODUCT_DETAIL: "/product/:slug", // ✅ NEW
};

// ============================================
// LAYOUT COMPONENTS
// ============================================

// Layout with Header
const LayoutWithHeader = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// Layout without Header
const LayoutWithoutHeader = ({ children }) => <>{children}</>;

const App = () => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const { isLoading: superAdminLoading, isAuthenticated: isSuperAdmin } =
    useSelector((state) => state.superAdmin);
  const {
    isLoading: sellerLoading,
    isAuthenticated: isSeller,
    seller,
  } = useSelector((state) => state.seller);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCurrentUser());
    }

    const superAdminToken = localStorage.getItem("superAdminToken");
    if (superAdminToken) {
      dispatch(fetchCurrentSuperAdmin());
    }

    const sellerToken = localStorage.getItem("sellerAccessToken");
    if (sellerToken) {
      dispatch(fetchCurrentSeller());
    }
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (
    isLoading ||
    superAdminLoading ||
    (sellerLoading && localStorage.getItem("sellerAccessToken"))
  ) {
    return <LoadingScreen text="Loading your account..." />;
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 16px",
            },
            success: {
              style: {
                background: "#10B981",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#10B981",
              },
            },
            error: {
              style: {
                background: "#EF4444",
              },
              iconTheme: {
                primary: "#fff",
                secondary: "#EF4444",
              },
            },
          }}
        />
        <ScrollToTop />
        <Routes>
          {/* ============================================
                PUBLIC ROUTES - WITH HEADER
                ============================================ */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ABOUT} element={<AboutUs />} />

          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/stories" element={<Story />} />
          <Route path="/why-aurevian" element={<WhyAurevian />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path={ROUTES.CHECKOUT}
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ORDERS}
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route path={ROUTES.BECOME_A_PARTNER} element={<BecomePartner />} />

          {/* ============================================
                SHOP ROUTE - WITH HEADER
                ============================================ */}
          <Route path={ROUTES.SHOP} element={<Shop />} />

          <Route path={ROUTES.GIFTS} element={<Gifts />} />

          <Route
  path={ROUTES.GIFT_GUIDE}
  element={<Gifts />}
/>

          {/* ============================================
                COLLECTIONS ROUTE - WITH HEADER
                ============================================ */}
          <Route path={ROUTES.COLLECTIONS} element={<Collections />} />

          {/* ============================================
                OFFERS ROUTE - WITH HEADER
                ============================================ */}
          <Route path={ROUTES.OFFERS} element={<Offers />} />

  

          {/* ============================================
                PUBLIC PRODUCT DETAIL ROUTE - WITH HEADER ✅
                Storefront: Customer viewing product
                URL: /product/:slug
                Example: /product/diamond-pendant-necklace
                ============================================ */}
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetail />} />

          {/* ============================================
                BLOG ROUTES - WITH HEADER ✅
                ============================================ */}
          <Route path={ROUTES.BLOG} element={<BlogList />} />
          <Route path={ROUTES.BLOG_DETAIL} element={<BlogDetail />} />

          {/* ============================================
                AUTH ROUTES - WITHOUT HEADER
                ============================================ */}
          <Route
            path={ROUTES.LOGIN}
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LayoutWithoutHeader>
                  <Login />
                </LayoutWithoutHeader>
              )
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LayoutWithoutHeader>
                  <Register />
                </LayoutWithoutHeader>
              )
            }
          />

          <Route
            path={ROUTES.VERIFY_OTP}
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LayoutWithoutHeader>
                  <VerifyOTP />
                </LayoutWithoutHeader>
              )
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LayoutWithoutHeader>
                  <ForgotPassword />
                </LayoutWithoutHeader>
              )
            }
          />
          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LayoutWithoutHeader>
                  <ResetPassword />
                </LayoutWithoutHeader>
              )
            }
          />

          <Route
            path={ROUTES.PRIVACY_POLICY}
            element={
              <LayoutWithoutHeader>
                <PrivacyPolicy />
              </LayoutWithoutHeader>
            }
          />

          <Route
            path={ROUTES.TERMS}
            element={
              <LayoutWithoutHeader>
                <Terms />
              </LayoutWithoutHeader>
            }
          />

          {/* ============================================
                SUPER ADMIN ROUTES - WITHOUT HEADER
                ============================================ */}
          <Route
            path={ROUTES.SUPER_ADMIN_LOGIN}
            element={
              isSuperAdmin ? (
                <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />
              ) : (
                <LayoutWithoutHeader>
                  <SuperAdminLogin />
                </LayoutWithoutHeader>
              )
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN_DASHBOARD}
            element={
              <SuperAdminRoute>
                <LayoutWithoutHeader>
                  <SuperAdminDashboard />
                </LayoutWithoutHeader>
              </SuperAdminRoute>
            }
          />
          <Route
            path={`${ROUTES.SUPER_ADMIN_DASHBOARD}/seller-details/:id`}
            element={
              <SuperAdminRoute>
                <LayoutWithoutHeader>
                  <SuperAdminDashboard />
                </LayoutWithoutHeader>
              </SuperAdminRoute>
            }
          />
          <Route
            path={`${ROUTES.SUPER_ADMIN_DASHBOARD}/:section`}
            element={
              <SuperAdminRoute>
                <LayoutWithoutHeader>
                  <SuperAdminDashboard />
                </LayoutWithoutHeader>
              </SuperAdminRoute>
            }
          />

          {/* ============================================
                SELLER ROUTES - WITHOUT HEADER (Auth Pages)
                ============================================ */}
          <Route
            path={ROUTES.SELLER_LOGIN}
            element={
              isSeller && seller?.status === "approved" ? (
                <Navigate to={ROUTES.SELLER_DASHBOARD} replace />
              ) : (
                <LayoutWithoutHeader>
                  <SellerLogin />
                </LayoutWithoutHeader>
              )
            }
          />
          <Route
            path={ROUTES.SELLER_REGISTER}
            element={
              isSeller && seller?.status === "approved" ? (
                <Navigate to={ROUTES.SELLER_DASHBOARD} replace />
              ) : (
                <LayoutWithoutHeader>
                  <SellerRegister />
                </LayoutWithoutHeader>
              )
            }
          />
          <Route
            path={ROUTES.SELLER_VERIFY_OTP}
            element={
              <LayoutWithoutHeader>
                <SellerVerifyOTP />
              </LayoutWithoutHeader>
            }
          />

          {/* ✅ SELLER FORGOT PASSWORD ROUTES - WITHOUT HEADER */}
          <Route
            path={ROUTES.SELLER_FORGOT_PASSWORD}
            element={
              <LayoutWithoutHeader>
                <SellerForgotPassword />
              </LayoutWithoutHeader>
            }
          />
          <Route
            path={ROUTES.SELLER_RESET_PASSWORD}
            element={
              <LayoutWithoutHeader>
                <SellerResetPassword />
              </LayoutWithoutHeader>
            }
          />

          {/* ============================================
                SELLER DASHBOARD ROUTES - WITHOUT HEADER (Protected)
                This handles ALL seller dashboard routes including:
                - /seller/dashboard/products
                - /seller/dashboard/products/new
                - /seller/dashboard/products/edit/:id
                - /seller/dashboard/orders
                - /seller/dashboard/earnings
                - /seller/dashboard/upgrade
                etc.
                ============================================ */}
          <Route
            path={`${ROUTES.SELLER_DASHBOARD}/*`}
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <SellerDashboard />
                </LayoutWithoutHeader>
              </SellerRoute>
            }
          />

          {/* ============================================
                SELLER KYC ROUTE
                ============================================ */}
          <Route
            path="/seller/kyc"
            element={
              <SellerRoute>
                <SellerKYC />
              </SellerRoute>
            }
          />

          {/* ============================================
                SELLER PROFILE ROUTE
                ============================================ */}
          <Route
            path={ROUTES.SELLER_PROFILE}
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                      Seller Profile
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Manage your seller profile
                    </p>
                  </div>
                </LayoutWithoutHeader>
              </SellerRoute>
            }
          />

          {/* ============================================
                SELLER DOCUMENTS ROUTE
                ============================================ */}
          <Route
            path={ROUTES.SELLER_DOCUMENTS}
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                      Documents
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your documents</p>
                  </div>
                </LayoutWithoutHeader>
              </SellerRoute>
            }
          />

          {/* ============================================
                SELLER ORDERS ROUTE (Standalone - if needed)
                ============================================ */}
          <Route
            path={ROUTES.SELLER_ORDERS}
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                    <p className="text-gray-600 mt-2">View your orders</p>
                  </div>
                </LayoutWithoutHeader>
              </SellerRoute>
            }
          />

          {/* ============================================
                SELLER PAYMENT ROUTE
                ============================================ */}
          <Route
            path="/seller/payment/:planId"
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <SellerPayment />
                </LayoutWithoutHeader>
              </SellerRoute>
            }
          />

          {/* ============================================
                USER PROTECTED ROUTES - WITH HEADER
                ============================================ */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PrivateRoute>
                <LayoutWithHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                      Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Welcome to your dashboard!
                    </p>
                    <p className="text-gray-500 mt-4">
                      (Dashboard page coming soon...)
                    </p>
                  </div>
                </LayoutWithHeader>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* ============================================
                ORDER SUCCESS & ORDER DETAIL ROUTES - WITH HEADER
                ============================================ */}
          <Route
            path={ROUTES.ORDER_SUCCESS}
            element={
              <PrivateRoute>
                <OrderSuccess />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ORDER_DETAIL}
            element={
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            }
          />

          {/* ============================================
                REDIRECT - Any unknown routes to home
                ============================================ */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </div>
    </HelmetProvider>
  );
};

export default App;
