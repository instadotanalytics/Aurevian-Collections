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

// ============================================
// SELLER PAGES
// ============================================
import SellerDashboard from "./Pages/Seller/SellerDashboard/SellerDashboard.jsx";
import BecomePartner from "./Pages/Seller/BecomePartner.jsx";
import SellerLogin from "./Pages/Seller/SellerAuth/SellerLogin.jsx";
import SellerRegister from "./Pages/Seller/SellerAuth/SellerRegister.jsx";
import SellerVerifyOTP from "./Pages/Seller/SellerAuth/SellerVerifyOTP.jsx";

// ============================================
// BLOG PAGES ✅
// ============================================
import BlogList from "./Pages/UserBlog/BlogList.jsx";
import BlogDetail from "./Pages/UserBlog/BlogDetail.jsx";
import Profile from "./Pages/Profile/Profile.jsx";


import SellerKYC from "./Pages/Seller/SellerKYC/SellerKYC";

// ============================================
// ROUTES CONSTANTS
// ============================================
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SUPER_ADMIN_LOGIN: "/super-admin/login",
  SUPER_ADMIN_DASHBOARD: "/super-admin/dashboard",
  // Seller Routes
  SELLER_LOGIN: "/seller/login",
  SELLER_REGISTER: "/seller/register",
  SELLER_VERIFY_OTP: "/seller/verify-otp",
  SELLER_DASHBOARD: "/seller/dashboard",
  SELLER_PROFILE: "/seller/profile",
  SELLER_DOCUMENTS: "/seller/documents",
  SELLER_KYC: "/seller/kyc", // ✅ NEW
  SELLER_ORDERS: "/seller/orders",
  SELLER_PRODUCTS: "/seller/products",
  BECOME_A_PARTNER: "/become-a-partner",
  // Blog Routes
  BLOG: "/blog",
  BLOG_DETAIL: "/blog/:slug",
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
        <Routes>
          {/* ============================================
                PUBLIC ROUTES - WITH HEADER
                ============================================ */}
          <Route
            path={ROUTES.HOME}
            element={
              <LayoutWithHeader>
                <Home />
              </LayoutWithHeader>
            }
          />
          <Route
            path={ROUTES.ABOUT}
            element={
              <LayoutWithHeader>
                <AboutUs />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/AboutUs"
            element={
              <LayoutWithHeader>
                <AboutUs />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/why-aurevian"
            element={
              <LayoutWithHeader>
                <WhyAurevian />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/contact"
            element={
              <LayoutWithHeader>
                <Contact />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/support"
            element={
              <LayoutWithHeader>
                <Support />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/franchise"
            element={
              <LayoutWithHeader>
                <Franchise />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/cart"
            element={
              <LayoutWithHeader>
                <Cart />
              </LayoutWithHeader>
            }
          />
          <Route
            path="/wishlist"
            element={
              <LayoutWithHeader>
                <Wishlist />
              </LayoutWithHeader>
            }
          />
          <Route
            path={ROUTES.BECOME_A_PARTNER}
            element={
              <LayoutWithHeader>
                <BecomePartner />
              </LayoutWithHeader>
            }
          />

          {/* ============================================
                BLOG ROUTES - WITH HEADER ✅
                ============================================ */}
          <Route
            path={ROUTES.BLOG}
            element={
              <LayoutWithHeader>
                <BlogList />
              </LayoutWithHeader>
            }
          />
          <Route
            path={ROUTES.BLOG_DETAIL}
            element={
              <LayoutWithHeader>
                <BlogDetail />
              </LayoutWithHeader>
            }
          />

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

          {/* ============================================
                SELLER ROUTES - WITHOUT HEADER (Protected)
                ============================================ */}
          <Route
            path={ROUTES.SELLER_DASHBOARD}
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <SellerDashboard />
                </LayoutWithoutHeader>
              </SellerRoute>
            }
          />
          <Route
            path="/seller/kyc"
            element={
              <SellerRoute>
                <SellerKYC />
              </SellerRoute>
            }
          />
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
          <Route
            path={ROUTES.SELLER_PRODUCTS}
            element={
              <SellerRoute>
                <LayoutWithoutHeader>
                  <div className="p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                      Products
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your products</p>
                  </div>
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
              
                <Profile/>
              
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
