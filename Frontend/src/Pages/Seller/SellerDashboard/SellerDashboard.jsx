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
  FiTrendingUp, // ✅ Import upgrade icon
} from "react-icons/fi";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import styles from "./SellerDashboard.module.css";

// Components
import DashboardOverview from "./components/DashboardOverview";
import Upgrade from "./components/Upgrade"; // ✅ Import Upgrade component

// ✅ Import seller logout action
import { sellerLogout } from "../../../redux/slices/sellerSlice";

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { seller } = useSelector((state) => state.seller);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

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
      // Show loading toast
      const loadingToast = toast.loading('Logging out...');
      
      // Call logout API via Redux
      const result = await dispatch(sellerLogout()).unwrap();
      
      toast.dismiss(loadingToast);
      toast.success('Logged out successfully');
      
      // Redirect to seller login page
      navigate('/seller/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
      
      // Even if API fails, clear local data and redirect
      navigate('/seller/login');
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
    // ✅ Add Upgrade menu item
    { id: "upgrade", label: "Upgrade", icon: FiTrendingUp },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardOverview />;
      
      // ✅ Add Upgrade case
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
            <span className={styles.logoText}>Seller Panel</span>
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
            <div className={styles.avatar}>
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
              <span className={styles.adminRole}>Seller</span>
            </div>

            {/* ✅ Fix: Use handleLogout instead of direct navigate */}
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
            >
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
              <div className={styles.sidebarAvatar}>
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
                  <span className={styles.sidebarUserRole}>Seller</span>
                </div>
              )}
            </div>

            {/* ✅ Fix: Use handleLogout instead of direct navigate */}
            <button
              className={styles.sidebarLogout}
              onClick={handleLogout}
            >
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