/**
 * Main App Component
 * Sets up routing and global providers with authentication
 */

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { fetchCurrentUser } from "./redux/slices/authSlice.js";

// Components
import PrivateRoute from "./Components/common/PrivateRoute.jsx";
import Navbar from "./Pages/Layout/Header/Navbar.jsx";
import LoadingScreen from "./Components/common/LoadingScreen.jsx";

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

// ============================================
// PROTECTED PAGES (Will be added later)
// ============================================
// import Dashboard from "./pages/Dashboard.jsx";
// import Profile from "./pages/Profile.jsx";

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
};

const App = () => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Loading your account..." />;
  }

  return (
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

      {/* Navbar - Shows user profile if authenticated */}
      <Navbar />

      {/* ============================================
          ROUTES
          ============================================ */}
      <Routes>
        {/* ============================================
            PUBLIC ROUTES - Accessible without authentication
            ============================================ */}
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.ABOUT} element={<AboutUs />} />
        <Route path="/AboutUs" element={<AboutUs />} />

        <Route path="/why-aurevian" element={<WhyAurevian />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/franchise" element={<Franchise />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />



        {/* ============================================
            AUTH ROUTES - Redirect to dashboard if already logged in
            ============================================ */}
        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Register />
          }
        />
        <Route
          path={ROUTES.VERIFY_OTP}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <VerifyOTP />
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <ForgotPassword />
          }
        />
        <Route
          path={ROUTES.RESET_PASSWORD}
          element={
            isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <ResetPassword />
          }
        />

        {/* ============================================
            PROTECTED ROUTES - Require authentication
            ============================================ */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <PrivateRoute>
              <div className="p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome to your dashboard!</p>
                <p className="text-gray-500 mt-4">(Dashboard page coming soon...)</p>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <PrivateRoute>
              <div className="p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-600 mt-2">Manage your profile</p>
                <p className="text-gray-500 mt-4">(Profile page coming soon...)</p>
              </div>
            </PrivateRoute>
          }
        />

        {/* ============================================
            REDIRECT - Any unknown routes to home
            ============================================ */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

      </Routes>
    </div>
  );
};

export default App;