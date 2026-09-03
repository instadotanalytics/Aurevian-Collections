// src/Pages/Seller/SellerDashboard/SellerDashboard.jsx

import React, { useState, useEffect, useRef } from "react";
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
  FiBell,
  FiSearch,
  FiTrendingUp,
  FiUser,
  FiStar,
  FiGift,
  FiAward,
  FiSunrise,
  FiMapPin, // ✅ NEW — icon for Pickup Address
  FiChevronDown, // ✅ NEW — dropdown indicator for grouped nav items
  FiLayers, // ✅ NEW — icon for the "Homepage Sections" dropdown group
  FiRefreshCw, // ✅ NEW — icon for Returns
} from "react-icons/fi";

import { useSelector, useDispatch } from "react-redux";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";

import styles from "./SellerDashboard.module.css";
import planStyles from "./components/PlanTheme.module.css";

import DashboardOverview from "./components/DashboardOverview";
import Upgrade from "./components/Upgrade";
import ProductManagement from "./components/ProductManagement";
import ProductFormWizard from "./components/ProductFormWizard";
import Orders from "./components/Orders";
import Returns from "./components/Returns"; // ✅ NEW
import FeaturedProductsManagement from "../SellerDashboard/components/FeaturedProductsManagement/FeaturedProductsManagement.jsx";

import { sellerLogout } from "../../../redux/slices/sellerSlice";
import { fetchCurrentSubscription } from "../../../redux/slices/sellerSubscriptionSlice";
import logo from "../../../assets/newlogo.png";
import Earnings from "./components/Earnings";
import Customers from "./components/Customers";
import Settings from "./components/Settings";
import SellerKYC from "../SellerKYC/SellerKYC.jsx";
import PickupAddressSettings from "./components/PickupAddressSettings"; // ✅ NEW

import useSellerNotifications from "../../../hooks/useSellerNotifications.js";
import NotificationCenter from "../../../Components/common/NotificationCenter/NotificationCenter.jsx";

const PLAN_THEME = {
  free: {
    dashboardName: "Seller Dashboard",
    greeting: "Welcome to your Seller Dashboard",
    subtext: "Manage your store, orders, and products.",
    badgeLabel: null,
    color: "#8a8a8a",
    gradient: "linear-gradient(135deg, #b8b8b8, #8a8a8a)",
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
    badgeLabel: "Gold Seller",
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
// ✅ Updated menuItems — "Offers Section", "Curated For You", "Trending Picks"
// and "New Collections" are now grouped under a single dropdown item
// called "Homepage Sections" (isDropdown: true, with a children array).
// ✅ Updated menuItems with New Collections, Pickup Address and Returns
const menuItems = [
  { id: "", label: "Dashboard", icon: FiHome },
  { id: "products", label: "Products", icon: FiPackage },
  {
    id: "homepage-sections",
    label: "Homepage Sections",
    icon: FiLayers,
    isDropdown: true,
    children: [
      { id: "featured-offers", label: "Offers Section", icon: FiStar },
      { id: "curated-for-you", label: "Curated For You", icon: FiGift },
      { id: "trending-picks", label: "Trending Picks", icon: FiAward },
      { id: "new-collections", label: "New Collections", icon: FiSunrise },
    ],
  },
  { id: "orders", label: "Orders", icon: FiShoppingBag },
  { id: "returns", label: "Returns", icon: FiRefreshCw }, // ✅ NEW
  { id: "earnings", label: "Earnings", icon: FiDollarSign },
  { id: "customers", label: "Customers", icon: FiUsers },
  { id: "settings", label: "Settings", icon: FiSettings },
  { id: "pickup-address", label: "Pickup Address", icon: FiMapPin }, // ✅ NEW
  { id: "upgrade", label: "Upgrade", icon: FiTrendingUp },
];

const ComingSoon = ({ label }) => (
  <div className={styles.placeholderContent}>{label} Page Coming Soon</div>
);

const DashboardHome = ({ planTheme }) => (
  <>
    <div
      className={`${planStyles.welcomeBanner} ${styles.welcomeBannerOverride}`}
      style={{ "--plan-gradient": planTheme.gradient }}
    >
      <div className={planStyles.welcomeText}>
        <h2>{planTheme.greeting}</h2>
        <p>{planTheme.subtext}</p>
      </div>
      {planTheme.badgeLabel && (
        <div className={planStyles.welcomeBadge}>{planTheme.badgeLabel}</div>
      )}
    </div>
    <DashboardOverview />
  </>
);

const SellerDashboard = () => {
  useEffect(() => {
    document.title = "Seller Dashboard | Aurevian Collections";
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { seller } = useSelector((state) => state.seller);
  const { currentPlanId, current: subscriptionData } = useSelector(
    (state) => state.sellerSubscription,
  );

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const basePath = "/seller/dashboard";
  const relativePath = location.pathname
    .replace(basePath, "")
    .replace(/^\//, "");
  const activeMenu = relativePath.split("/")[0] || "";

  // ✅ NEW — tracks which sidebar dropdown group is currently open.
  // Works for both hover (mouse enter/leave on the group) and click
  // (toggle on the group's header button) — see handlers below.
  const dropdownGroup = menuItems.find((item) => item.isDropdown);
  const [openMenu, setOpenMenu] = useState(() => {
    if (dropdownGroup && dropdownGroup.children.some((c) => c.id === activeMenu)) {
      return dropdownGroup.id;
    }
    return null;
  });

  // Keep the dropdown open automatically whenever the active route is
  // one of its children (e.g. deep link or page refresh on a child page).
  useEffect(() => {
    if (dropdownGroup && dropdownGroup.children.some((c) => c.id === activeMenu)) {
      setOpenMenu(dropdownGroup.id);
    }
  }, [activeMenu]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDropdownToggle = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleDropdownMouseEnter = (id) => {
    setOpenMenu(id);
  };

  const handleDropdownMouseLeave = (id) => {
    setOpenMenu((prev) => (prev === id ? null : prev));
  };

  const planId =
    subscriptionData?.plan?.id ||
    currentPlanId ||
    seller?.subscriptionPlanId ||
    "free";
  const planTheme = getPlanTheme(planId);

  const { notifications, unreadCount, handleItemClick } =
    useSellerNotifications();

  useEffect(() => {
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  useEffect(() => {
    setMobileProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const loadingToast = toast.loading("Logging out...");
      await dispatch(sellerLogout()).unwrap();
      toast.dismiss(loadingToast);
      toast.success("Logged out successfully");
      navigate("/seller/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed");
      navigate("/seller/login");
    }
  };

  const handleMenuClick = (id) => {
    navigate(id ? `${basePath}/${id}` : basePath);
    setMobileMenuOpen(false);
  };

  const initials = seller?.firstName?.charAt(0);

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <div className={styles.headerLogo} onClick={() => navigate(basePath)}>
            <img
              src={logo}
              alt="Aurevian Collections"
              className={styles.logoImage}
            />
          </div>

          <div className={styles.headerTitleBlock}>
            <span className={styles.logoText}>{planTheme.dashboardName}</span>
            {planTheme.badgeLabel && (
              <span
                className={`${planStyles.planBadge} ${styles.headerPlanBadge}`}
                style={{ background: planTheme.gradient }}
              >
                {planTheme.badgeLabel}
              </span>
            )}
          </div>

          <div className={styles.headerSearch}>
            <FiSearch className={styles.searchIcon} size={17} />
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.mobileSearchToggle}
            onClick={() => setMobileSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <FiSearch size={19} />
          </button>

          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onItemClick={handleItemClick}
          />

          <div className={styles.profileWrap} ref={profileRef}>
            <button
              className={styles.adminProfile}
              onClick={() => setMobileProfileOpen((v) => !v)}
              aria-label="Account"
            >
              <div
                className={`${styles.avatar} ${planStyles.avatarRing}`}
                style={{ "--plan-color": planTheme.color }}
              >
                {seller?.profileImage ? (
                  <img src={seller.profileImage} alt="Seller" />
                ) : initials ? (
                  <span>{initials}</span>
                ) : (
                  <FiUser size={16} />
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

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className={styles.logoutBtn}
              >
                <FiLogOut size={18} />
              </span>
            </button>

            {mobileProfileOpen && (
              <>
                <div
                  className={styles.profileDropdownOverlay}
                  onClick={() => setMobileProfileOpen(false)}
                />
                <div className={styles.mobileProfileDropdown}>
                  <div className={styles.mobileProfileHeader}>
                    <div
                      className={`${styles.mobileProfileAvatar} ${planStyles.avatarRing}`}
                      style={{ "--plan-color": planTheme.color }}
                    >
                      {seller?.profileImage ? (
                        <img src={seller.profileImage} alt="Seller" />
                      ) : initials ? (
                        <span>{initials}</span>
                      ) : (
                        <FiUser size={20} />
                      )}
                    </div>
                    <div className={styles.mobileProfileInfo}>
                      <span className={styles.mobileProfileName}>
                        {seller?.firstName || "Seller"} {seller?.lastName || ""}
                      </span>
                      <span className={styles.mobileProfileRole}>
                        {planTheme.badgeLabel || "Seller"}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.mobileProfileLogout}
                    onClick={handleLogout}
                  >
                    <FiLogOut size={17} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {mobileSearchOpen && (
          <div className={styles.mobileSearchBar}>
            <FiSearch className={styles.searchIcon} size={17} />
            <input
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              autoFocus
            />
            <button
              className={styles.mobileSearchClose}
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
            >
              <FiX size={18} />
            </button>
          </div>
        )}
      </header>

      <div className={styles.mainContent}>
        <aside
          className={`${styles.sidebar} ${sidebarExpanded ? styles.expanded : ""} ${
            mobileMenuOpen ? styles.mobileOpen : ""
          }`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className={styles.sidebarNav}>
            {menuItems.map((item) => {
              // ✅ NEW — dropdown group rendering (hover + click support)
              if (item.isDropdown) {
                const isOpen = openMenu === item.id;
                const isChildActive = item.children.some(
                  (child) => child.id === activeMenu,
                );

                return (
                  <div
                    key={item.id}
                    className={styles.navGroup}
                    onMouseEnter={() => handleDropdownMouseEnter(item.id)}
                    onMouseLeave={() => handleDropdownMouseLeave(item.id)}
                  >
                    <button
                      onClick={() => handleDropdownToggle(item.id)}
                      className={`${styles.navItem} ${
                        isChildActive ? styles.active : ""
                      }`}
                      title={item.label}
                      aria-expanded={isOpen}
                    >
                      <item.icon className={styles.navIcon} />
                      <span className={styles.navLabel}>{item.label}</span>
                      <FiChevronDown
                        className={`${styles.navChevron} ${
                          isOpen ? styles.navChevronOpen : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`${styles.submenu} ${
                        isOpen ? styles.submenuOpen : ""
                      }`}
                    >
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleMenuClick(child.id)}
                          className={`${styles.subNavItem} ${
                            activeMenu === child.id ? styles.active : ""
                          }`}
                          title={child.label}
                        >
                          <child.icon className={styles.subNavIcon} />
                          <span className={styles.navLabel}>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={item.id || "dashboard"}
                  onClick={() => handleMenuClick(item.id)}
                  className={`${styles.navItem} ${
                    activeMenu === item.id ? styles.active : ""
                  }`}
                  title={item.label}
                >
                  <item.icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarUser}>
              <div
                className={`${styles.sidebarAvatar} ${planStyles.avatarRing}`}
                style={{ "--plan-color": planTheme.color }}
              >
                {seller?.profileImage ? (
                  <img src={seller.profileImage} alt="Seller" />
                ) : initials ? (
                  <span>{initials}</span>
                ) : (
                  <FiUser size={15} />
                )}
              </div>

              <div className={styles.sidebarUserInfo}>
                <span className={styles.sidebarUserName}>
                  {seller?.firstName} {seller?.lastName}
                </span>
                <span className={styles.sidebarUserRole}>
                  {planTheme.badgeLabel || "Seller"}
                </span>
              </div>
            </div>

            <button
              className={styles.sidebarLogout}
              onClick={handleLogout}
              title="Logout"
            >
              <span className={styles.logoutIconWrap}>
                <FiLogOut size={18} />
              </span>
              <span className={styles.logoutLabel}>Logout</span>
            </button>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className={styles.overlay}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className={styles.contentArea}>
          <div className={styles.contentWrapper}>
            <Routes>
              <Route index element={<DashboardHome planTheme={planTheme} />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="products/new" element={<ProductFormWizard />} />
              <Route path="products/edit/:id" element={<ProductFormWizard />} />

              {/* ✅ Offers Section — "Offers Worth The Splurge" */}
              <Route
                path="featured-offers"
                element={
                  <FeaturedProductsManagement
                    section="specially-made"
                    title="Offers Worth The Splurge"
                    subtitle="Add or remove your products from this Home Page section, and control the order they appear in."
                  />
                }
              />

              {/* ✅ Curated For You — "You May Also Like" section */}
              <Route
                path="curated-for-you"
                element={
                  <FeaturedProductsManagement
                    section="curated-for-you"
                    title="Curated For You"
                    subtitle="Add or remove your products from the 'You May Also Like' section on the homepage, and control the order they appear in."
                    pickerTitle="Add Product to Curated For You"
                  />
                }
              />

              {/* ✅ Trending Picks section */}
              <Route
                path="trending-picks"
                element={
                  <FeaturedProductsManagement
                    section="trending-picks"
                    title="Trending Picks"
                    subtitle="Add or remove your products from the 'Trending Picks' section on the homepage, and control the order they appear in."
                    pickerTitle="Add Product to Trending Picks"
                  />
                }
              />

              {/* ✅ NEW — New Collections / "Fresh Arrivals" section */}
              <Route
                path="new-collections"
                element={
                  <FeaturedProductsManagement
                    section="new-collections"
                    title="New Collections"
                    subtitle="Add or remove your products from the 'Fresh Arrivals — New Collections' section on the homepage, and control the order they appear in."
                    pickerTitle="Add Product to New Collections"
                  />
                }
              />

              <Route path="orders" element={<Orders />} />
              {/* ✅ NEW — Return/Exchange requests for this seller's products */}
              <Route path="returns" element={<Returns />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="pickup-address"
                element={<PickupAddressSettings />}
              />
              <Route path="upgrade" element={<Upgrade />} />
              <Route path="kyc" element={<SellerKYC />} />
              <Route path="*" element={<Navigate to={basePath} replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;