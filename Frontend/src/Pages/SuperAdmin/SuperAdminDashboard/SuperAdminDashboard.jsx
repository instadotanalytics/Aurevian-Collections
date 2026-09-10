// src/Pages/SuperAdmin/SuperAdminDashboard/SuperAdminDashboard.jsx

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiClock,
  FiSearch,
  FiPlus,
  FiGrid,
  FiList,
  FiTag,
  FiMessageSquare,
  FiFileText,
  FiImage,
  FiPenTool,
  FiCreditCard,
  FiLayout,
  FiGift,
  FiInbox,
  FiMail,
  FiBriefcase,
  FiTrendingUp,
  FiMapPin,
} from "react-icons/fi";

import {
  superAdminLogout,
} from "../../../redux/slices/superAdminSlice";

import toast from "react-hot-toast";
import styles from "./SuperAdminDashboard.module.css";

// Components
import SellerRequests from "../components/SellerRequests";
import SellerDetails from "../components/SellerDetails";
import DashboardOverview from "../components/DashboardOverview";
import BannerManagement from "../components/BannerManagement/BannerManagement";
import BlogManagement from "../components/BlogManagement/BlogManagement";
import PaymentsManagement from "../components/PaymentsManagement/PaymentsManagement";
import SupportManagement from "../components/SupportManagement";
import SubscriptionPlanManagement from "../components/SubscriptionPlanManagement/SubscriptionPlanManagement";
import HeaderManagement from "../components/HeaderManagement/HeaderManagement";
import OrdersManagement from "../components/OrdersManagement/OrdersManagement";
import OrderHistory from "../components/OrderHistory/OrderHistory.jsx";
import SellersProducts from "../components/SellersProducts/SellersProducts.jsx";
import SellerProductsPage from "../components/SellersProducts/SellerProductsPage.jsx";
import PromotionRequestsManagement from "../components/PromotionRequestsManagement/PromotionRequestsManagement.jsx";
import ContactManagement from "../components/ContactManagement.jsx";
import FranchiseManagement from "../components/FranchiseManagement.jsx";
import LocationSettings from "../../Seller/SellerDashboard/components/LocationSettings/LocationSettings.jsx";

// SOCKET.IO — admin notifications
import useAdminNotifications from "../../../hooks/useAdminNotifications.js";
import NotificationCenter from "../../../Components/common/NotificationCenter/NotificationCenter.jsx";

// Same logo asset used on the Seller Dashboard header
import logo from "../../../assets/newlogo.png";

// Sidebar menu — static, so it lives outside the component
const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: FiHome, isSubMenu: false },
  { id: "sellers", label: "Seller Requests", icon: FiUsers, isSubMenu: false },
  {
    id: "sellers-products",
    label: "Sellers & Products",
    icon: FiGrid,
    isSubMenu: false,
  },
  { id: "orders", label: "Orders", icon: FiShoppingBag, isSubMenu: false },
  {
    id: "order-history",
    label: "Order History",
    icon: FiClock,
    isSubMenu: false,
  },
  { id: "products", label: "Products", icon: FiPackage, isSubMenu: false },
  {
    id: "payments",
    label: "Payments",
    icon: FiDollarSign,
    isSubMenu: false,
  },
  {
    id: "subscription-plans",
    label: "Subscription Plans",
    icon: FiCreditCard,
    isSubMenu: false,
  },
  {
    id: "promotions",
    label: "Promotion Requests",
    icon: FiGift,
    isSubMenu: false,
  },
  {
    id: "location-settings",
    label: "Location Settings",
    icon: FiMapPin,
    isSubMenu: false,
  },
  {
    id: "blog",
    label: "Blog Management",
    icon: FiPenTool,
    isSubMenu: true,
    subItems: [
      { id: "blog-all", label: "All Blogs", icon: FiList },
      { id: "blog-create", label: "Create Blog", icon: FiPlus },
      { id: "blog-drafts", label: "Drafts", icon: FiFileText },
      { id: "blog-categories", label: "Categories", icon: FiTag },
      { id: "blog-comments", label: "Comments", icon: FiMessageSquare },
    ],
  },
  {
    id: "requests",
    label: "Customer Requests",
    icon: FiInbox,
    isSubMenu: true,
    subItems: [
      { id: "support", label: "Support Tickets", icon: FiMessageSquare },
      { id: "contact-messages", label: "Contact Messages", icon: FiMail },
      {
        id: "franchise-enquiries",
        label: "Franchise Enquiries",
        icon: FiBriefcase,
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: FiTrendingUp,
    isSubMenu: false,
  },
  { id: "banners", label: "Banners", icon: FiImage, isSubMenu: false },
  {
    id: "header",
    label: "Header Management",
    icon: FiLayout,
    isSubMenu: false,
  },
  { id: "settings", label: "Settings", icon: FiSettings, isSubMenu: false },
];

const dropdownMenuItems = menuItems.filter((item) => item.isSubMenu);

const SuperAdminDashboard = () => {
  useEffect(() => {
    document.title = "Super Admin Dashboard | Aurevian Collections";
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { section, id, sellerId } = useParams();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.superAdmin,
  );

  const profileRef = useRef(null);

  // Route precedence: /seller-details/:id and /sellers-products/:sellerId
  // are both more specific than the generic /:section route.
  const activeMenu = sellerId
    ? "seller-products-detail"
    : id
      ? "seller-details"
      : section || "dashboard";

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  // Which sidebar dropdown group ("blog" / "requests") is currently open
  const [openMenu, setOpenMenu] = useState(() => {
    const found = dropdownMenuItems.find((item) =>
      item.subItems.some((c) => c.id === activeMenu),
    );
    return found ? found.id : null;
  });

  useEffect(() => {
    const found = dropdownMenuItems.find((item) =>
      item.subItems.some((c) => c.id === activeMenu),
    );
    if (found) setOpenMenu(found.id);
  }, [activeMenu]);

  useEffect(() => {
    setMobileProfileOpen(false);
  }, [activeMenu]);

  // SOCKET.IO — mounted at the persistent dashboard shell level
  const { notifications, unreadCount, handleItemClick } =
    useAdminNotifications();

  const goToSection = (sectionId) => {
    navigate(`/super-admin/dashboard/${sectionId}`);
  };

  const handleLogout = async () => {
    try {
      await dispatch(superAdminLogout()).unwrap();
      toast.success("Logged out successfully");
      navigate("/super-admin/login");
    } catch (error) {
      toast.error("Logout failed");
      navigate("/super-admin/login");
    }
  };

  // Instant render using the seller object we already have, while the
  // URL updates to a shareable/refreshable /seller-details/:id route
  const handleViewSeller = (seller) => {
    setSelectedSeller(seller);
    navigate(`/super-admin/dashboard/seller-details/${seller._id}`);
  };

  const handleCloseDetails = () => {
    setSelectedSeller(null);
    goToSection("sellers");
  };

  const handleViewSellerProducts = (seller) => {
    navigate(`/super-admin/dashboard/sellers-products/${seller._id}`);
  };

  const handleBackToSellersProducts = () => {
    goToSection("sellers-products");
  };

  const handleMenuClick = (item) => {
    goToSection(item.id);
    setMobileMenuOpen(false);
  };

  const handleDropdownToggle = (id) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  const handleDropdownMouseEnter = (id) => {
    setOpenMenu(id);
  };

  const handleDropdownMouseLeave = (id) => {
    setOpenMenu((prev) => (prev === id ? null : prev));
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate("/super-admin/login");
    return null;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardOverview />;
      case "sellers":
        return <SellerRequests onViewSeller={handleViewSeller} />;
      case "seller-details":
        return (
          <SellerDetails
            seller={selectedSeller}
            sellerId={id}
            onClose={handleCloseDetails}
          />
        );
      case "sellers-products":
        return (
          <SellersProducts
            onViewSeller={handleViewSeller}
            onViewSellerProducts={handleViewSellerProducts}
          />
        );
      case "seller-products-detail":
        return (
          <SellerProductsPage
            sellerId={sellerId}
            onBack={handleBackToSellersProducts}
          />
        );
      case "orders":
        return <OrdersManagement />;
      case "order-history":
        return <OrderHistory />;
      case "products":
        return (
          <div className={styles.placeholderContent}>
            Products Management Coming Soon
          </div>
        );
      case "payments":
        return <PaymentsManagement />;
      case "subscription-plans":
        return (
          <div className={styles.subscriptionPlansContainer}>
            <div className={styles.pageHeader}>
              <div>
                <h1 className={styles.pageTitle}>
                  Subscription Plan Management
                </h1>
                <p className={styles.pageSubtitle}>
                  Manage your subscription plans, pricing, and features
                </p>
              </div>
            </div>
            <SubscriptionPlanManagement />
          </div>
        );
      case "promotions":
        return <PromotionRequestsManagement />;
      case "location-settings":
        return <LocationSettings />;
      case "blog-all":
      case "blog-create":
      case "blog-drafts":
      case "blog-categories":
      case "blog-comments":
        return <BlogManagement activeTab={activeMenu} />;
      case "analytics":
        return (
          <div className={styles.placeholderContent}>
            Analytics Dashboard Coming Soon
          </div>
        );
      case "banners":
        return <BannerManagement />;
      case "header":
        return <HeaderManagement />;
      case "support":
        return <SupportManagement />;
      case "contact-messages":
        return <ContactManagement />;
      case "franchise-enquiries":
        return <FranchiseManagement />;
      case "settings":
        return (
          <div className={styles.placeholderContent}>Settings Coming Soon</div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  const initials = `${user?.firstName?.[0] || "S"}${user?.lastName?.[0] || "A"}`;

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

          <div
            className={styles.headerLogo}
            onClick={() => goToSection("dashboard")}
          >
            <img
              src={logo}
              alt="Aurevian Collections"
              className={styles.logoImage}
            />
          </div>

          <div className={styles.headerTitleBlock}>
            <span className={styles.logoText}>Super Admin Dashboard</span>
            <span className={styles.headerRoleBadge}>Super Admin</span>
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
              <div className={styles.avatar}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Admin" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className={styles.adminInfo}>
                <span className={styles.adminName}>
                  {user?.firstName || "Super"} {user?.lastName || "Admin"}
                </span>
                <span className={styles.adminRole}>Super Admin</span>
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
                    <div className={styles.mobileProfileAvatar}>
                      {user?.profileImage ? (
                        <img src={user.profileImage} alt="Admin" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className={styles.mobileProfileInfo}>
                      <span className={styles.mobileProfileName}>
                        {user?.firstName || "Super"} {user?.lastName || "Admin"}
                      </span>
                      <span className={styles.mobileProfileRole}>
                        Super Admin
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
        {/* Sidebar — hover to expand on desktop, hamburger on mobile */}
        <aside
          className={`${styles.sidebar} ${sidebarExpanded ? styles.expanded : ""} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className={styles.sidebarNav}>
            {menuItems.map((item) => {
              if (item.isSubMenu) {
                const isOpen = openMenu === item.id;
                const isChildActive = item.subItems.some(
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
                      className={`${styles.navItem} ${isChildActive ? styles.active : ""}`}
                      title={item.label}
                      aria-expanded={isOpen}
                    >
                      <item.icon className={styles.navIcon} />
                      <span className={styles.navLabel}>{item.label}</span>
                      <FiChevronDown
                        className={`${styles.navChevron} ${isOpen ? styles.navChevronOpen : ""}`}
                      />
                    </button>

                    <div
                      className={`${styles.submenu} ${isOpen ? styles.submenuOpen : ""}`}
                    >
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleMenuClick(subItem)}
                          className={`${styles.subNavItem} ${activeMenu === subItem.id ? styles.active : ""}`}
                          title={subItem.label}
                        >
                          <subItem.icon className={styles.subNavIcon} />
                          <span className={styles.navLabel}>
                            {subItem.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              const isActive =
                activeMenu === item.id ||
                // Keep "Sellers & Products" highlighted while viewing a
                // specific seller's product catalog
                (item.id === "sellers-products" &&
                  activeMenu === "seller-products-detail");

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
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
              <div className={styles.sidebarAvatar}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Admin" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className={styles.sidebarUserInfo}>
                <span className={styles.sidebarUserName}>
                  {user?.firstName || "Super"} {user?.lastName || "Admin"}
                </span>
                <span className={styles.sidebarUserRole}>Super Admin</span>
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

        {/* Content Area */}
        <main className={styles.contentArea}>
          <div className={styles.contentWrapper}>{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;