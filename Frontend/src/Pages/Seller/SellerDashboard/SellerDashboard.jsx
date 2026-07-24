// src/Pages/Seller/SellerDashboard/SellerDashboard.jsx

import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiMessageSquare,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiShield,
  FiBell,
  FiSearch,
  FiTrendingUp,
} from "react-icons/fi";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import styles from "./SellerDashboard.module.css";
import planStyles from "./components/PlanTheme.module.css";

// Components
import DashboardOverview from "./components/DashboardOverview";
import Upgrade from "./components/Upgrade";

// ✅ Seller + subscription redux
import { sellerLogout } from "../../../redux/slices/sellerSlice";
import { fetchCurrentSubscription } from "../../../redux/slices/sellerSubscriptionSlice";

// ============================================
// PLAN THEME CONFIG — drives the premium feel across the dashboard
// ============================================
const PLAN_THEME = {
  free: {
    dashboardName: "Seller Dashboard",
    greeting: "Welcome to your Seller Dashboard",
    subtext: "Manage your store, orders, and products.",
    badgeLabel: null, // no badge for free tier
    color: "#64748b",
    gradient: "linear-gradient(135deg, #64748b, #475569)",
  },
  silver: {
    dashboardName: "Silver Seller Dashboard",
    greeting: "Welcome to your Silver Seller Dashboard",
    subtext:
      "You're a Silver Verified seller — enjoy better visibility and faster settlements.",
    badgeLabel: "🩶 Silver Seller",
    color: "#94a3b8",
    gradient: "linear-gradient(135deg, #cbd5e1, #64748b)",
  },
  gold: {
    dashboardName: "Gold Seller Dashboard",
    greeting: "Welcome to your Gold Seller Dashboard",
    subtext:
      "You're a Gold seller — featured placement, sponsored products, and priority support.",
    badgeLabel: "🥇 Gold Seller",
    color: "#d97706",
    gradient: "linear-gradient(135deg, #fbbf24, #d97706)",
  },
  platinum: {
    dashboardName: "Platinum Seller Dashboard",
    greeting: "Welcome to your Platinum Seller Dashboard",
    subtext:
      "You're a Platinum partner — the highest tier, with a dedicated account manager.",
    badgeLabel: "💎 Platinum Seller",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #a5b4fc, #4f46e5)",
  },
};

const getPlanTheme = (planId) => PLAN_THEME[planId] || PLAN_THEME.free;

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { seller } = useSelector((state) => state.seller);
  const { currentPlanId, current: subscriptionData } = useSelector(
    (state) => state.sellerSubscription,
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  // ✅ Resolve the seller's live plan: prefer the subscription slice (kept
  // fresh by fetchCurrentSubscription), fall back to the seller doc's own
  // subscriptionPlanId if the subscription call hasn't resolved yet.
  const planId =
    subscriptionData?.plan?.id ||
    currentPlanId ||
    seller?.subscriptionPlanId ||
    "free";
  const planTheme = getPlanTheme(planId);

  // Fetch the seller's current subscription plan on load, so the dashboard
  // reflects Silver/Gold/Platinum immediately without waiting for the
  // Upgrade page to be visited first.
  useEffect(() => {
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      const loadingToast = toast.loading("Logging out...");
      const result = await dispatch(sellerLogout()).unwrap();
      toast.dismiss(loadingToast);
      toast.success("Logged out successfully");
      navigate("/seller/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed");
      navigate("/seller/login");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiHome },
    { id: "products", label: "Products", icon: FiPackage },
    { id: "orders", label: "Orders", icon: FiShoppingBag },
    { id: "earnings", label: "Earnings", icon: FiDollarSign },
    { id: "customers", label: "Customers", icon: FiUsers },
    { id: "reviews", label: "Reviews", icon: FiMessageSquare },
    { id: "settings", label: "Settings", icon: FiSettings },
    { id: "upgrade", label: "Upgrade", icon: FiTrendingUp },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            {/* ✅ Premium welcome banner — changes with the seller's plan */}
            <div
              className={planStyles.welcomeBanner}
              style={{ "--plan-gradient": planTheme.gradient }}
            >
              <div className={planStyles.welcomeText}>
                <h2>{planTheme.greeting} 👋</h2>
                <p>{planTheme.subtext}</p>
              </div>
              {planTheme.badgeLabel && (
                <div className={planStyles.welcomeBadge}>
                  {planTheme.badgeLabel}
                </div>
              )}
            </div>
            <DashboardOverview />
          </>
        );

      case "upgrade":
        return <Upgrade />;

      default:
        return (
          <div className={styles.placeholderContent}>
            {activeMenu} Page Coming Soon
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* TOP HEADER */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FiMenu size={24} />
          </button>

          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <div className={styles.headerLogo}>
            <FiShield className={styles.logoIcon} />
            {/* ✅ Header title now reflects the current plan */}
            <span className={styles.logoText}>{planTheme.dashboardName}</span>
            {planTheme.badgeLabel && (
              <span
                className={planStyles.planBadge}
                style={{ background: planTheme.gradient }}
              >
                {planTheme.badgeLabel}
              </span>
            )}
          </div>

          <div className={styles.headerSearch}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.notificationBtn}>
            <FiBell size={20} />
            <span className={styles.notificationBadge}>0</span>
          </button>

          <div className={styles.adminProfile}>
            <div
              className={`${styles.avatar} ${planStyles.avatarRing}`}
              style={{ "--plan-color": planTheme.color }}
            >
              {seller?.profileImage ? (
                <img src={seller.profileImage} alt="Seller" />
              ) : (
                <span>{seller?.firstName?.charAt(0) || "S"}</span>
              )}
            </div>

            <div className={styles.adminInfo}>
              <span className={styles.adminName}>
                {seller?.firstName || "Seller"} {seller?.lastName || ""}
              </span>
              <span className={styles.adminRole}>
                {planTheme.badgeLabel || "Seller"}
              </span>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        {/* Sidebar */}
        <aside
          className={`${styles.sidebar} ${
            sidebarOpen ? styles.open : styles.closed
          } ${mobileMenuOpen ? styles.mobileOpen : ""}`}
        >
          <div className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`${styles.navItem} ${
                  activeMenu === item.id ? styles.active : ""
                }`}
              >
                <item.icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {activeMenu === item.id && (
                  <div className={styles.activeIndicator} />
                )}
              </button>
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarUser}>
              <div
                className={`${styles.sidebarAvatar} ${planStyles.avatarRing}`}
                style={{ "--plan-color": planTheme.color }}
              >
                {seller?.profileImage ? (
                  <img src={seller.profileImage} alt="Seller" />
                ) : (
                  <span>{seller?.firstName?.charAt(0) || "S"}</span>
                )}
              </div>

              {sidebarOpen && (
                <div className={styles.sidebarUserInfo}>
                  <span className={styles.sidebarUserName}>
                    {seller?.firstName} {seller?.lastName}
                  </span>
                  <span className={styles.sidebarUserRole}>
                    {planTheme.badgeLabel || "Seller"}
                  </span>
                </div>
              )}
            </div>

            <button className={styles.sidebarLogout} onClick={handleLogout}>
              <FiLogOut size={18} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Content */}
        <main
          className={`${styles.contentArea} ${
            !sidebarOpen ? styles.expanded : ""
          }`}
        >
          <div className={styles.contentWrapper}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
