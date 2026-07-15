/**
 * Header Component with Authentication Integration
 * Integrated with Redux for auth state management
 */

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
} from "react-icons/fi";
import styles from "./Header.module.css";

import AnnouncementBar from "./AnnouncementBar";
import SearchPanel from "./Searchpanel";
import {
  announcements,
  mainNav,
  shopCategories,
  shopQuickLinks,
  shopByStyle,
  collectionsDropdown,
  giftGuide,
  offersDropdown,
  aboutDropdown,
} from "./NavData";

import logo from "../../../assets/Aurevianlogo.png";
import { logoutUser } from "../../../redux/slices/authSlice.js";
import toast from "react-hot-toast";

// NOTE: "Fashion Items" is a mega-menu column requested for the Shop menu.
// It isn't part of NavData.js yet, so it's defined locally here. Feel free
// to move this into NavData.js and import it instead, the same way
// shopCategories / shopQuickLinks / shopByStyle are imported.
const fashionItems = [
  { id: "fi-1", label: "Perfumes", path: "/fashion/perfumes" },
  { id: "fi-2", label: "Watches", path: "/fashion/watches" },
  { id: "fi-3", label: "Sarees", path: "/fashion/sarees" },
  { id: "fi-4", label: "Sunglasses", path: "/fashion/sunglasses" },
  { id: "fi-5", label: "Handbags", path: "/fashion/handbags" },
  { id: "fi-6", label: "Wallets", path: "/fashion/wallets" },
  { id: "fi-7", label: "Belts", path: "/fashion/belts" },
];

// Placeholder "recent searches" seed shown until the user has real history
// of their own. Passed through to <SearchPanel /> — if SearchPanel.jsx
// doesn't yet accept a `recentSearches` prop, add support for it there
// (fall back to this list when no local/localStorage history exists).
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
  announcementItems,
  logoHref = "/",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef(null);
  const searchRef = useRef(null);

  // NOTE: the raw text-input state and submit handler used to live here
  // (`query` / `handleSearch`). That entire search experience (history,
  // live suggestions, keyboard nav) now lives inside SearchPanel.jsx.
  // Header just renders <SearchPanel /> inside the left-side panel below
  // and forwards the same `onSearchSubmit` prop it always accepted — so
  // consumers of <Header onSearchSubmit={...} /> don't need to change
  // anything.

  // ---- Header height tracking ----
  // The Shop / Gift Guide mega menus are positioned with `position: fixed`
  // so they are anchored to the viewport instead of to whichever nav item
  // triggered them. That's what stops them from being clipped on the left
  // or right edge of the screen. To sit them flush under the header
  // (announcement bar + top row combined), we measure the header's real
  // rendered height and publish it as a CSS custom property (--header-h)
  // on the <header> element itself. Header.module.css reads that variable
  // for both the mega menu's `top` AND its `max-height`, so they can never
  // disagree with the real header height.
  //
  // We use a ResizeObserver (not just a window `resize` listener) because
  // the header's height can change for reasons that never fire a window
  // resize event: the logo image finishing loading, web fonts swapping in,
  // or the announcement bar wrapping onto a second line on a narrower
  // tablet. A ResizeObserver catches all of these automatically, which is
  // what keeps the mega menu correctly aligned to the header on every
  // device instead of relying on a stale measurement.
  const navbarRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

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
      // Fallback for orientation changes on some older mobile browsers
      window.addEventListener("orientationchange", updateHeaderHeight);
      return () => {
        observer.disconnect();
        window.removeEventListener("orientationchange", updateHeaderHeight);
      };
    }

    // Fallback for browsers without ResizeObserver support
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Close account dropdown / search panel on outside click
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

  // Close dropdowns on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setAccountOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when the mobile drawer OR the left search panel is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenAccordion(null);
  };

  // Handle logout with Redux
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

  // Get user initials for avatar
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

  // Account dropdown items with icons
  const accountMenuItems = isAuthenticated
    ? [
        { icon: FiUserIcon, label: "Profile", path: "/profile" },
        { icon: FiOrders, label: "My Orders", path: "/orders" },
        { icon: FiHeart, label: "Wishlist", path: "/wishlist" },
        { icon: FiSettings, label: "Settings", path: "/settings" },
      ]
    : [];

  return (
    <header
      className={styles.navbar}
      ref={navbarRef}
      style={{ "--header-h": headerHeight ? `${headerHeight}px` : undefined }}
    >
      <AnnouncementBar items={announcementItems || announcements} />

      {/* ================= SINGLE ROW: logo | nav | icons =================
          Layout note: .topRow is a single flex row. .desktopNav and
          .mainNav are `display: contents` in the CSS, which "flattens"
          them so the logo and every nav link become direct flex children
          of .topRow, spaced by `justify-content: space-between`.
          .iconGroup stays a real flex box with its own `gap: 12px` so the
          4 icons (search, wishlist, cart, account) stay evenly spaced from
          each other regardless of what happens to the rest of the row.
          See Header.module.css for details.

          The Shop / Gift Guide mega menus below read their vertical
          position from the `--header-h` CSS variable set on the <header>
          tag (see the style prop above), instead of an inline `top` style
          computed per-render. That variable is kept in sync with the
          header's real rendered height via a ResizeObserver, so the menus
          stay correctly aligned under the header on every device, even as
          the header's height changes (announcement bar wrapping, logo
          loading, font swaps, orientation changes). */}
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
                setHeaderHeight(navbarRef.current.getBoundingClientRect().height);
              }
            }}
          />
        </Link>

        {/* ---- Desktop nav ---- */}
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

                  {/* Shop mega menu */}
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
                          <span>New Season</span>
                          <strong>Bridal &amp; Festive Edit</strong>
                          <p className={styles.megaBannerOffer}>
                            Up to 40% Off
                          </p>
                          <Link to="/collections/bridal">Shop the edit →</Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collections simple dropdown */}
                  {item.id === "collections" && (
                    <div className={styles.dropdown}>
                      {collectionsDropdown.map((c) => (
                        <Link key={c.id} to={c.path}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Gift Guide mega menu */}
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

                  {/* Offers simple dropdown */}
                  {item.id === "offers" && (
                    <div className={styles.dropdown}>
                      {offersDropdown.map((o) => (
                        <Link key={o.id} to={o.path}>
                          {o.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* About Us simple dropdown */}
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

        {/* ---- Icons (search, wishlist, cart, account) ---- */}
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

            {/* Search panel now slides in from the LEFT edge of the
                screen and covers up to half the viewport width (see
                .searchPanel in Header.module.css). The trigger button
                above is unchanged — only the panel's position/size and
                open animation changed, from a small dropdown under the
                icon to a full-height left-side panel. */}
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
              {isAuthenticated && user?.profileImage ? (
                <img
                  src={user.profileImage}
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
                  {/* User Info */}
                  <div className={styles.accountUserInfo}>
                    <div className={styles.accountAvatar}>
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
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

                  {/* Account Menu Items */}
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

                  {/* Logout Button */}
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
                    <FiUserIcon />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className={styles.accountMenuItem}
                    onClick={() => setAccountOpen(false)}
                  >
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for the left-side search panel — dims the rest of the
          page and closes the panel on click, same pattern as the mobile
          drawer's overlay below. */}
      <div
        className={`${styles.searchOverlay} ${searchOpen ? styles.show : ""}`}
        onClick={() => setSearchOpen(false)}
      />

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.show : ""}`}
        onClick={closeMobileMenu}
      />
      <aside className={`${styles.drawer} ${mobileOpen ? styles.show : ""}`}>
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

        {/* Same reusable SearchPanel, in "inline" mode: no absolute
            positioning, suggestions/history render directly beneath the
            input in the drawer's normal scroll flow (see section 9 —
            mobile support — in Header.module.css). */}
        <div className={styles.drawerSearch}>
          <SearchPanel
            styles={styles}
            isOpen={mobileOpen}
            onClose={() => {}}
            onSearchSubmit={onSearchSubmit}
            variant="inline"
            autoFocus={false}
            inputId="aurevian-search-input-mobile"
            recentSearches={defaultRecentSearches}
          />
        </div>

        {/* User info in mobile drawer */}
        {isAuthenticated && user && (
          <div className={styles.drawerUserInfo}>
            <div className={styles.drawerUserAvatar}>
              {user.profileImage ? (
                <img
                  src={user.profileImage}
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
                    <div className={styles.drawerSubGroup}>
                      <h5>Category</h5>
                      {shopCategories.map((c) => (
                        <Link key={c.id} to={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>Quick Links</h5>
                      {shopQuickLinks.map((c) => (
                        <Link key={c.id} to={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>Shop by Style</h5>
                      {shopByStyle.map((c) => (
                        <Link key={c.id} to={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>Fashion Items</h5>
                      {fashionItems.map((f) => (
                        <Link key={f.id} to={f.path} onClick={closeMobileMenu}>
                          {f.label}
                        </Link>
                      ))}
                    </div>
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
                    <div className={styles.drawerSubGroup}>
                      <h5>By Recipient</h5>
                      {giftGuide.byRecipient.map((g) => (
                        <Link key={g.id} to={g.path} onClick={closeMobileMenu}>
                          {g.label}
                        </Link>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>By Occasion</h5>
                      {giftGuide.byOccasion.map((g) => (
                        <Link key={g.id} to={g.path} onClick={closeMobileMenu}>
                          {g.label}
                        </Link>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>By Budget</h5>
                      {giftGuide.byBudget.map((g) => (
                        <Link key={g.id} to={g.path} onClick={closeMobileMenu}>
                          {g.label}
                        </Link>
                      ))}
                    </div>
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

          {/* Account section inside drawer */}
          <li className={styles.drawerNavItem}>
            <button
              className={styles.drawerNavLink}
              aria-expanded={openAccordion === "account"}
              onClick={() => toggleAccordion("account")}
            >
              Account
              <FiChevronRight
                className={`${styles.drawerChevron} ${
                  openAccordion === "account" ? styles.rotated : ""
                }`}
              />
            </button>
            <div
              className={`${styles.drawerSubPanel} ${
                openAccordion === "account" ? styles.expanded : ""
              }`}
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
    </header>
  );
};

export default Header;