// src/Pages/SuperAdmin/SuperAdminDashboard/SuperAdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiSettings,
  FiShield,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiClipboard,
  FiStar,
  FiTrendingUp,
  FiBell,
  FiSearch,
  FiPlus,
  FiGrid,
  FiList,
  FiDownload,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiBookOpen,
  FiTag,
  FiMessageSquare,
  FiFileText,
  FiLayers,
  FiImage,
  FiPenTool, // ✅ ADD THIS FOR BLOG
} from 'react-icons/fi';
import { superAdminLogout } from '../../../redux/slices/superAdminSlice';
import toast from 'react-hot-toast';
import styles from './SuperAdminDashboard.module.css';

// Components
import StatsCards from '../components/StatsCards';
import SellerRequests from '../components/SellerRequests';
import SellerDetails from '../components/SellerDetails';
import DashboardOverview from '../components/DashboardOverview';
import RecentActivities from '../components/RecentActivities';
import BannerManagement from '../components/BannerManagement/BannerManagement';
import BlogManagement from '../components/BlogManagement/BlogManagement'; // ✅ ADD THIS

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.superAdmin);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(superAdminLogout()).unwrap();
      toast.success('Logged out successfully');
      navigate('/super-admin/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleViewSeller = (seller) => {
    setSelectedSeller(seller);
    setShowDetails(true);
    setActiveMenu('seller-details');
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedSeller(null);
    setActiveMenu('sellers');
  };

  const toggleSubMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      isSubMenu: false
    },
    {
      id: 'sellers',
      label: 'Seller Requests',
      icon: FiUsers,
      isSubMenu: false
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: FiShoppingBag,
      isSubMenu: false
    },
    {
      id: 'products',
      label: 'Products',
      icon: FiPackage,
      isSubMenu: false
    },
    {
      id: 'blog', // ✅ ADD BLOG MENU
      label: 'Blog Management',
      icon: FiPenTool,
      isSubMenu: true, // ✅ Submenu with options
      subItems: [
        { id: 'blog-all', label: 'All Blogs', icon: FiList },
        { id: 'blog-create', label: 'Create Blog', icon: FiPlus },
        { id: 'blog-drafts', label: 'Drafts', icon: FiFileText },
        { id: 'blog-categories', label: 'Categories', icon: FiTag },
        { id: 'blog-comments', label: 'Comments', icon: FiMessageSquare },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: FiTrendingUp,
      isSubMenu: false
    },
    {
      id: 'banners',
      label: 'Banners',
      icon: FiImage,
      isSubMenu: false
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      isSubMenu: false
    },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'sellers':
        return <SellerRequests onViewSeller={handleViewSeller} />;
      case 'seller-details':
        return <SellerDetails seller={selectedSeller} onClose={handleCloseDetails} />;
      case 'orders':
        return <div className={styles.placeholderContent}>Orders Management Coming Soon</div>;
      case 'products':
        return <div className={styles.placeholderContent}>Products Management Coming Soon</div>;
      case 'blog-all': // ✅ ALL BLOGS
      case 'blog-create': // ✅ CREATE BLOG
      case 'blog-drafts': // ✅ DRAFTS
      case 'blog-categories': // ✅ CATEGORIES
      case 'blog-comments': // ✅ COMMENTS
        return <BlogManagement activeTab={activeMenu} />;
      case 'analytics':
        return <div className={styles.placeholderContent}>Analytics Dashboard Coming Soon</div>;
      case 'banners':
        return <BannerManagement />;
      case 'settings':
        return <div className={styles.placeholderContent}>Settings Coming Soon</div>;
      default:
        return <DashboardOverview />;
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
            <span className={styles.logoText}>Super Admin</span>
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
            <span className={styles.notificationBadge}>3</span>
          </button>
          <div className={styles.adminProfile}>
            <div className={styles.avatar}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Admin" />
              ) : (
                <span>{user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || 'A'}</span>
              )}
            </div>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</span>
              <span className={styles.adminRole}>Super Admin</span>
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
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <div className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.isSubMenu ? (
                  // SubMenu Item
                  <div>
                    <button
                      className={`${styles.navItem} ${expandedMenus[item.id] ? styles.expanded : ''}`}
                      onClick={() => toggleSubMenu(item.id)}
                    >
                      <item.icon className={styles.navIcon} />
                      <span className={styles.navLabel}>{item.label}</span>
                      <FiChevronDown className={`${styles.chevron} ${expandedMenus[item.id] ? styles.rotated : ''}`} />
                    </button>
                    <div className={`${styles.subMenu} ${expandedMenus[item.id] ? styles.open : ''}`}>
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          className={`${styles.subNavItem} ${activeMenu === subItem.id ? styles.active : ''}`}
                          onClick={() => {
                            setActiveMenu(subItem.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <subItem.icon className={styles.subNavIcon} />
                          <span className={styles.subNavLabel}>{subItem.label}</span>
                          {activeMenu === subItem.id && <div className={styles.activeIndicator} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Normal Menu Item
                  <button
                    className={`${styles.navItem} ${activeMenu === item.id ? styles.active : ''}`}
                    onClick={() => {
                      setActiveMenu(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className={styles.navIcon} />
                    <span className={styles.navLabel}>{item.label}</span>
                    {activeMenu === item.id && <div className={styles.activeIndicator} />}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.sidebarUser}>
              <div className={styles.sidebarAvatar}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Admin" />
                ) : (
                  <span>{user?.firstName?.[0] || 'S'}{user?.lastName?.[0] || 'A'}</span>
                )}
              </div>
              {sidebarOpen && (
                <div className={styles.sidebarUserInfo}>
                  <span className={styles.sidebarUserName}>{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</span>
                  <span className={styles.sidebarUserRole}>Super Admin</span>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className={styles.sidebarLogout}>
              <FiLogOut size={18} />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {mobileMenuOpen && (
          <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Content Area */}
        <main className={`${styles.contentArea} ${!sidebarOpen ? styles.expanded : ''}`}>
          <div className={styles.contentWrapper}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;