// src/Pages/Layout/Header/Header.jsx - Fixed scroll lock

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiSettings,
  FiUser as FiUserIcon,
  FiShoppingBag as FiOrders,
  FiHome,
  FiBox,
  FiGrid,
  FiGift,
  FiTag
} from "react-icons/fi";
import {
  FaUserPlus, FaUserCheck
} from "react-icons/fa6";

import styles from "./Header.module.css";

import AnnouncementBar from "./AnnouncementBar";
import SearchPanel from "./Searchpanel";
// ✅ Static NavData is now only the LOADING-STATE fallback
import {
  mainNav as fallbackMainNav,
  aboutDropdown as fallbackAboutDropdown,
} from "./NavData";

import logo from "../../../assets/newlogo.png";
import { logoutUser } from "../../../redux/slices/authSlice.js";
import { fetchPublicHeaderConfig } from "../../../redux/slices/headerConfigSlice.js";
import toast from "react-hot-toast";

// Placeholder "recent searches"
const defaultRecentSearches = [
  "Bridal lehenga",
  "Gold earrings",
  "Silk saree",
  "Men's watches",
];

const Header = ({
  cartCount = 0,
  wishlistCount = 0,
  onSearchSubmit,
  logoHref = "/",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { config } = useSelector((state) => state.headerConfig);

  const avatarUrl = user?.profileImage?.url || user?.avatar?.url || null;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileShopSubOpen, setMobileShopSubOpen] = useState(null);
  const [mobileGiftSubOpen, setMobileGiftSubOpen] = useState(null);

  const accountRef = useRef(null);
  const searchRef = useRef(null);
  const drawerRef = useRef(null);

  const navbarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  
  // ✅ Store scroll position to restore later
  const scrollYRef = useRef(0);

  // ✅ Fetch the admin-managed header content once on mount
  useEffect(() => {
    dispatch(fetchPublicHeaderConfig());
  }, [dispatch]);

  // ✅ Derive every content block from the live config, falling back to static defaults
  const announcements = config?.announcements?.length
    ? config.announcements
    : undefined;
  const mainNav = config?.mainNav?.length ? config.mainNav : fallbackMainNav;
  const shopCategories = config?.shopMegaMenu?.categories || [];
  const shopQuickLinks = config?.shopMegaMenu?.quickLinks || [];
  const shopByStyle = config?.shopMegaMenu?.byStyle || [];
  const fashionItems = config?.shopMegaMenu?.fashionItems || [];
  const shopBanner = config?.shopMegaMenu?.banner || {};
  const giftGuide = config?.giftGuideMegaMenu || {
    byRecipient: [],
    byOccasion: [],
    byBudget: [],
  };
  const collectionsDropdown = config?.collectionsDropdown || [];
  const offersDropdown = config?.offersDropdown || [];
  const aboutDropdown = config?.aboutDropdown?.length
    ? config.aboutDropdown
    : fallbackAboutDropdown || [];

  // Mobile drawer columns are built from the same dynamic data
  const mobileShopColumns = [
    { id: "category", label: "Shop by Category", items: shopCategories },
    { id: "quicklinks", label: "Quick Links", items: shopQuickLinks },
    { id: "style", label: "Shop by Style", items: shopByStyle },
    { id: "fashion", label: "Fashion Items", items: fashionItems },
  ];
  const mobileGiftColumns = [
    { id: "recipient", label: "By Recipient", items: giftGuide.byRecipient },
    { id: "occasion", label: "By Occasion", items: giftGuide.byOccasion },
    { id: "budget", label: "By Budget", items: giftGuide.byBudget },
  ];

  // ---- Header height tracking ----
  useEffect(() => {
    const node = navbarRef.current;
    if (!node) return;

    const updateHeaderHeight = () => {
      setHeaderHeight(node.getBoundingClientRect().height);
    };

    updateHeaderHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateHeaderHeight);
      observer.observe(node);
      window.addEventListener("orientationchange", updateHeaderHeight);
      return () => {
        observer.disconnect();
        window.removeEventListener("orientationchange", updateHeaderHeight);
      };
    }

    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, [mainNav]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setAccountOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
        setMobileShopSubOpen(null);
        setMobileGiftSubOpen(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // ✅ FIXED: Proper body scroll lock for mobile drawer and search
  useEffect(() => {
    const isLocked = mobileOpen || searchOpen;
    
    if (isLocked) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      if (scrollYRef.current) {
        window.scrollTo(0, scrollYRef.current);
        scrollYRef.current = 0;
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992 && mobileOpen) {
        setMobileOpen(false);
        setOpenAccordion(null);
        setMobileShopSubOpen(null);
        setMobileGiftSubOpen(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileOpen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && mobileOpen) {
        setMobileOpen(false);
        setOpenAccordion(null);
        setMobileShopSubOpen(null);
        setMobileGiftSubOpen(null);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
        setOpenAccordion(null);
        setMobileShopSubOpen(null);
        setMobileGiftSubOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
    if (id !== "shop" && id !== "gift-guide") {
      setMobileShopSubOpen(null);
      setMobileGiftSubOpen(null);
    }
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenAccordion(null);
    setMobileShopSubOpen(null);
    setMobileGiftSubOpen(null);
  };

  const handleOverlayClick = () => {
    closeMobileMenu();
  };

  const handleDrawerClick = (e) => {
    e.stopPropagation();
  };

  const handleLogout = async () => {
    try {
      setAccountOpen(false);
      closeMobileMenu();
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const accountMenuItems = isAuthenticated
    ? [
      { icon: FiUserIcon, label: "Profile", path: "/profile" },
      { icon: FiOrders, label: "My Orders", path: "/orders" },
      { icon: FiHeart, label: "Wishlist", path: "/wishlist" },
      { icon: FiSettings, label: "Settings", path: "/settings" },
    ]
    : [];

  const toggleMobileShopSub = (id) => {
    setMobileShopSubOpen((prev) => (prev === id ? null : id));
  };

  const toggleMobileGiftSub = (id) => {
    setMobileGiftSubOpen((prev) => (prev === id ? null : id));
  };

  return (
    <header
      className={styles.navbar}
      ref={navbarRef}
      style={{ "--header-h": headerHeight ? `${headerHeight}px` : undefined }}
    >
      <AnnouncementBar items={announcements} />

      <div className={styles.topRow}>
        <button
          className={styles.hamburgerBtn}
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu />
        </button>

        <Link to={logoHref} className={styles.logo}>
          <img
            src={logo}
            alt="Aurevian"
            className={styles.logoImage}
            onLoad={() => {
              if (navbarRef.current) {
                setHeaderHeight(
                  navbarRef.current.getBoundingClientRect().height,
                );
              }
            }}
          />
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary navigation">
          <ul className={styles.mainNav}>
            {mainNav.map((item) => {
              const hasSub = item.hasDropdown || item.hasMegaMenu;
              return (
                <li className={styles.navItem} key={item.id}>
                  <Link
                    to={item.path}
                    className={styles.navLink}
                    aria-haspopup={hasSub ? "true" : undefined}
                  >
                    {item.label}
                    {hasSub && (
                      <FiChevronDown
                        className={styles.chevron}
                        aria-hidden="true"
                      />
                    )}
                  </Link>

                  {item.id === "shop" && (
                    <div
                      className={`${styles.megaMenu} ${styles.megaMenuShop}`}
                    >
                      <div className={styles.megaMenuGrid}>
                        <div className={styles.megaCol}>
                          <h4>Shop by Category</h4>
                          <ul>
                            {shopCategories.map((c) => (
                              <li key={c.id}>
                                <Link to={c.path}>{c.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>Quick Links</h4>
                          <ul>
                            {shopQuickLinks.map((c) => (
                              <li key={c.id}>
                                <Link to={c.path}>{c.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>Shop by Style</h4>
                          <ul>
                            {shopByStyle.map((c) => (
                              <li key={c.id}>
                                <Link to={c.path}>{c.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>Fashion Items</h4>
                          <ul>
                            {fashionItems.map((f) => (
                              <li key={f.id}>
                                <Link to={f.path}>{f.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaBanner}>
                          <span>{shopBanner.tag}</span>
                          <strong>{shopBanner.title}</strong>
                          <p className={styles.megaBannerOffer}>
                            {shopBanner.offer}
                          </p>
                          <Link to={shopBanner.linkPath || "/"}>
                            {shopBanner.linkText}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.id === "collections" && (
                    <div className={styles.dropdown}>
                      {collectionsDropdown.map((c) => (
                        <Link key={c.id} to={c.path}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {item.id === "gift-guide" && (
                    <div className={styles.megaMenu}>
                      <div className={styles.megaMenuFlex}>
                        <div className={styles.megaCol}>
                          <h4>By Recipient</h4>
                          <ul>
                            {giftGuide.byRecipient.map((g) => (
                              <li key={g.id}>
                                <Link to={g.path}>{g.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>By Occasion</h4>
                          <ul>
                            {giftGuide.byOccasion.map((g) => (
                              <li key={g.id}>
                                <Link to={g.path}>{g.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>By Budget</h4>
                          <ul>
                            {giftGuide.byBudget.map((g) => (
                              <li key={g.id}>
                                <Link to={g.path}>{g.label}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.id === "offers" && (
                    <div className={styles.dropdown}>
                      {offersDropdown.map((o) => (
                        <Link key={o.id} to={o.path}>
                          {o.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {item.id === "about" && (
                    <div className={styles.dropdown}>
                      {aboutDropdown.map((a) => (
                        <Link key={a.id} to={a.path}>
                          {a.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.iconGroup}>
          <div className={styles.searchWrap} ref={searchRef}>
            <button
              className={styles.iconBtn}
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((p) => !p)}
            >
              <FiSearch />
            </button>

            <div
              className={`${styles.searchPanel} ${searchOpen ? styles.open : ""}`}
            >
              <button
                className={styles.searchPanelCloseBtn}
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <FiX />
              </button>
              <SearchPanel
                styles={styles}
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSearchSubmit={onSearchSubmit}
                variant="dropdown"
                autoFocus={searchOpen}
                inputId="aurevian-search-input-desktop"
                recentSearches={defaultRecentSearches}
              />
            </div>
          </div>

          <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <FiHeart />
            {wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          <div className={styles.accountWrap} ref={accountRef}>
            <button
              className={styles.iconBtn}
              aria-label="Account"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((p) => !p)}
            >
              {isAuthenticated && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName || "User"}
                  className={styles.avatarImage}
                />
              ) : isAuthenticated ? (
                <span className={styles.avatarInitials}>
                  {getUserInitials()}
                </span>
              ) : (
                <FiUser />
              )}
            </button>

            <div
              className={`${styles.accountDropdown} ${accountOpen ? styles.open : ""}`}
            >
              {isAuthenticated && user ? (
                <>
                  <div className={styles.accountUserInfo}>
                    <div className={styles.accountAvatar}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={user.fullName}
                          className={styles.accountAvatarImage}
                        />
                      ) : (
                        <span className={styles.accountAvatarText}>
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                    <div className={styles.accountUserName}>
                      <strong>{user.fullName || "User"}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className={styles.accountDivider} />

                  {accountMenuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={styles.accountMenuItem}
                      onClick={() => setAccountOpen(false)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className={styles.accountDivider} />

                  <button
                    onClick={handleLogout}
                    className={`${styles.accountMenuItem} ${styles.logoutItem}`}
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={styles.accountMenuItem}
                    onClick={() => setAccountOpen(false)}
                  >
                    <FaUserCheck />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className={styles.accountMenuItem}
                    onClick={() => setAccountOpen(false)}
                  >
                    <FaUserPlus />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.searchOverlay} ${searchOpen ? styles.show : ""}`}
        onClick={() => setSearchOpen(false)}
      />

      <div
        className={`${styles.overlay} ${mobileOpen ? styles.show : ""}`}
        onClick={handleOverlayClick}
      />
      <aside
        className={`${styles.drawer} ${mobileOpen ? styles.show : ""}`}
        ref={drawerRef}
        onClick={handleDrawerClick}
      >
        <div className={styles.drawerHeader}>
          <Link to={logoHref} className={styles.logo} onClick={closeMobileMenu}>
            <img src={logo} alt="Aurevian" className={styles.drawerLogoImage} />
          </Link>
          <button
            className={styles.drawerClose}
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            <FiX />
          </button>
        </div>

        {isAuthenticated && user && (
          <div className={styles.drawerUserInfo}>
            <div className={styles.drawerUserAvatar}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.fullName}
                  className={styles.drawerUserAvatarImage}
                />
              ) : (
                <span className={styles.drawerUserAvatarText}>
                  {getUserInitials()}
                </span>
              )}
            </div>
            <div className={styles.drawerUserName}>
              <strong>{user.fullName || "User"}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        )}

        <ul className={styles.drawerNav}>
          {mainNav.map((item) => {
            const hasSub = item.hasDropdown || item.hasMegaMenu;
            const expanded = openAccordion === item.id;
            return (
              <li className={styles.drawerNavItem} key={item.id}>
                {hasSub ? (
                  <button
                    className={styles.drawerNavLink}
                    aria-expanded={expanded}
                    onClick={() => toggleAccordion(item.id)}
                  >
                    {item.label}
                    <FiChevronRight
                      className={`${styles.drawerChevron} ${expanded ? styles.rotated : ""}`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={styles.drawerNavLink}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                )}

                {item.id === "shop" && (
                  <div
                    className={`${styles.drawerSubPanel} ${expanded ? styles.expanded : ""}`}
                  >
                    {mobileShopColumns.map((col) => (
                      <div key={col.id} className={styles.drawerSubGroup}>
                        <button
                          className={styles.drawerSubHeading}
                          onClick={() => toggleMobileShopSub(col.id)}
                        >
                          <span className={styles.drawerSubHeadingContent}>
                            <span className={styles.headingText}>
                              {col.label}
                            </span>
                            <FiChevronRight
                              className={`${styles.drawerChevron} ${mobileShopSubOpen === col.id ? styles.rotated : ""}`}
                            />
                          </span>
                        </button>
                        {mobileShopSubOpen === col.id && (
                          <div className={styles.drawerSubItems}>
                            {col.items.map((it) => (
                              <Link
                                key={it.id}
                                to={it.path}
                                onClick={closeMobileMenu}
                              >
                                {it.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {item.id === "collections" && (
                  <div
                    className={`${styles.drawerSubPanel} ${expanded ? styles.expanded : ""}`}
                  >
                    <div className={styles.drawerSubGroup}>
                      {collectionsDropdown.map((c) => (
                        <Link key={c.id} to={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {item.id === "gift-guide" && (
                  <div
                    className={`${styles.drawerSubPanel} ${expanded ? styles.expanded : ""}`}
                  >
                    {mobileGiftColumns.map((col) => (
                      <div key={col.id} className={styles.drawerSubGroup}>
                        <button
                          className={styles.drawerSubHeading}
                          onClick={() => toggleMobileGiftSub(col.id)}
                        >
                          <span className={styles.drawerSubHeadingContent}>
                            <span className={styles.headingText}>
                              {col.label}
                            </span>
                            <FiChevronRight
                              className={`${styles.drawerChevron} ${mobileGiftSubOpen === col.id ? styles.rotated : ""}`}
                            />
                          </span>
                        </button>
                        {mobileGiftSubOpen === col.id && (
                          <div className={styles.drawerSubItems}>
                            {col.items.map((it) => (
                              <Link
                                key={it.id}
                                to={it.path}
                                onClick={closeMobileMenu}
                              >
                                {it.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {item.id === "offers" && (
                  <div
                    className={`${styles.drawerSubPanel} ${expanded ? styles.expanded : ""}`}
                  >
                    <div className={styles.drawerSubGroup}>
                      {offersDropdown.map((o) => (
                        <Link key={o.id} to={o.path} onClick={closeMobileMenu}>
                          {o.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {item.id === "about" && (
                  <div
                    className={`${styles.drawerSubPanel} ${expanded ? styles.expanded : ""}`}
                  >
                    <div className={styles.drawerSubGroup}>
                      {aboutDropdown.map((a) => (
                        <Link key={a.id} to={a.path} onClick={closeMobileMenu}>
                          {a.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}

          <li className={styles.drawerNavItem}>
            <button
              className={styles.drawerNavLink}
              aria-expanded={openAccordion === "account"}
              onClick={() => toggleAccordion("account")}
            >
              Account
              <FiChevronRight
                className={`${styles.drawerChevron} ${openAccordion === "account" ? styles.rotated : ""}`}
              />
            </button>
            <div
              className={`${styles.drawerSubPanel} ${openAccordion === "account" ? styles.expanded : ""}`}
            >
              <div className={styles.drawerSubGroup}>
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={closeMobileMenu}>
                      <FiUserIcon /> Profile
                    </Link>
                    <Link to="/orders" onClick={closeMobileMenu}>
                      <FiOrders /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={closeMobileMenu}>
                      <FiHeart /> Wishlist
                    </Link>
                    <Link to="/settings" onClick={closeMobileMenu}>
                      <FiSettings /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={styles.drawerLogoutBtn}
                    >
                      <FiLogOut /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu}>
                      Login
                    </Link>
                    <Link to="/register" onClick={closeMobileMenu}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </li>
        </ul>

        <div className={styles.drawerFooterIcons}>
          <Link to="/wishlist" className={styles.iconBtn}>
            <FiHeart />
            <span>Wishlist</span>
          </Link>
          <Link to="/cart" className={styles.iconBtn}>
            <FiShoppingBag />
            <span>Cart</span>
          </Link>
          <Link to="/profile" className={styles.iconBtn}>
            <FiUser />
            <span>Account</span>
          </Link>
        </div>
      </aside>

      {/* ==========================================================
           MOBILE BOTTOM NAVIGATION
           ========================================================== */}
      <nav className={styles.mobileBottomNav} aria-label="Mobile bottom navigation">
        <Link to="/" className={styles.bottomNavItem}>
          <FiHome className={styles.bottomNavIcon} />
          <span className={styles.bottomNavLabel}>Home</span>
        </Link>
        <Link to="/shop" className={styles.bottomNavItem}>
          <FiBox className={styles.bottomNavIcon} />
          <span className={styles.bottomNavLabel}>Shop</span>
        </Link>
        <Link to="/collections" className={styles.bottomNavItem}>
          <FiGrid className={styles.bottomNavIcon} />
          <span className={styles.bottomNavLabel}>Collections</span>
        </Link>
        <Link to="/gifts" className={styles.bottomNavItem}>
          <FiGift className={styles.bottomNavIcon} />
          <span className={styles.bottomNavLabel}>Gifts</span>
        </Link>
        <Link to="/offers" className={styles.bottomNavItem}>
          <FiTag className={styles.bottomNavIcon} />
          <span className={styles.bottomNavLabel}>Offers</span>
        </Link>
      </nav>

    </header>
  );
};

export default Header;