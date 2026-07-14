import React, { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
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
  accountDropdown,
  aboutDropdown,
} from "./NavData";

import logo from "../../../assets/Aurevianlogo.png";

import { Link } from "react-router-dom";

// NOTE: "Fashion Items" is a new mega-menu column requested for the Shop
// menu. It isn't part of NavData.js yet, so it's defined locally here.
// Feel free to move this into NavData.js and import it instead, the same
// way shopCategories / shopQuickLinks / shopByStyle are imported.
const fashionItems = [
  { id: "fi-1", label: "Perfumes", path: "/fashion/perfumes" },
  { id: "fi-2", label: "Watches", path: "/fashion/watches" },
  { id: "fi-3", label: "Sarees", path: "/fashion/sarees" },
  { id: "fi-4", label: "Sunglasses", path: "/fashion/sunglasses" },
  { id: "fi-5", label: "Handbags", path: "/fashion/handbags" },
  { id: "fi-6", label: "Wallets", path: "/fashion/wallets" },
  { id: "fi-7", label: "Belts", path: "/fashion/belts" },
];

const Header = ({
  cartCount = 0,
  wishlistCount = 0,
  user = null,
  onSearchSubmit,
  onLogout,
  announcementItems,
  logoHref = "/",
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null); // which mobile section is expanded
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  // NOTE: the raw text-input state and submit handler that used to live
  // here (`query` / `handleSearch`) have moved into SearchPanel.jsx,
  // which now owns the entire search experience (history, live
  // suggestions, keyboard nav). Header just renders <SearchPanel /> in
  // the same two spots the old inline <form> used to live, and forwards
  // the same `onSearchSubmit` prop it always accepted — so consumers of
  // <Header onSearchSubmit={...} /> don't need to change anything.

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

  // Close account/search dropdowns on outside click
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

  // Close dropdowns on Escape for keyboard users
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenAccordion(null);
  };

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

        <a href={logoHref} className={styles.logo}>
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
        </a>

        {/* ---- Desktop nav ---- */}
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          <ul className={styles.mainNav}>
            {mainNav.map((item) => {
              const hasSub = item.hasDropdown || item.hasMegaMenu;
              return (
                <li className={styles.navItem} key={item.id}>
                  <a
                    href={item.path}
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
                  </a>

                  {/* Shop mega menu */}
                  {item.id === "shop" && (
                    <div
                      className={`${styles.megaMenu} ${styles.megaMenuShop}`}
                    >
                      <div className={styles.megaMenuGrid}>
                        <div className={styles.megaCol}>
                          <h4>Category</h4>
                          <ul>
                            {shopCategories.map((c) => (
                              <li key={c.id}>
                                <a href={c.path}>{c.label}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>Quick Links</h4>
                          <ul>
                            {shopQuickLinks.map((c) => (
                              <li key={c.id}>
                                <a href={c.path}>{c.label}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>Shop by Style</h4>
                          <ul>
                            {shopByStyle.map((c) => (
                              <li key={c.id}>
                                <a href={c.path}>{c.label}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>Fashion Items</h4>
                          <ul>
                            {fashionItems.map((f) => (
                              <li key={f.id}>
                                <a href={f.path}>{f.label}</a>
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
                          <a href="/collections/bridal">Shop Now →</a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collections simple dropdown */}
                  {item.id === "collections" && (
                    <div className={styles.dropdown}>
                      {collectionsDropdown.map((c) => (
                        <a key={c.id} href={c.path}>
                          {c.label}
                        </a>
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
                                <a href={g.path}>{g.label}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>By Occasion</h4>
                          <ul>
                            {giftGuide.byOccasion.map((g) => (
                              <li key={g.id}>
                                <a href={g.path}>{g.label}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.megaCol}>
                          <h4>By Budget</h4>
                          <ul>
                            {giftGuide.byBudget.map((g) => (
                              <li key={g.id}>
                                <a href={g.path}>{g.label}</a>
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
                        <a key={o.id} href={o.path}>
                          {o.label}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* About Us simple dropdown */}
                  {item.id === "about" && (
                    <div className={styles.dropdown}>
                      {aboutDropdown.map((a) => (
                        <a key={a.id} href={a.path}>
                          {a.label}
                        </a>
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

            {/* Search icon and this trigger/panel container are unchanged —
                only the CONTENT inside .searchPanel is now the upgraded,
                premium SearchPanel component (history, live suggestions,
                keyboard nav, popular/trending sections, etc). */}
            <div
              className={`${styles.searchPanel} ${searchOpen ? styles.open : ""}`}
            >
              <SearchPanel
                styles={styles}
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onSearchSubmit={onSearchSubmit}
                variant="dropdown"
                autoFocus={searchOpen}
                inputId="aurevian-search-input-desktop"
              />
            </div>
          </div>

          <a href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <FiHeart />
            {wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </a>

          <a href="/cart" className={styles.iconBtn} aria-label="Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </a>

          <div className={styles.accountWrap} ref={accountRef}>
            <button
              className={styles.iconBtn}
              aria-label="Account"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen((p) => !p)}
            >
              <FiUser />
            </button>

            <div
              className={`${styles.accountDropdown} ${accountOpen ? styles.open : ""}`}
            >
              {user ? (
                <>
                  {accountDropdown.map((item) =>
                    item.isAction ? (
                      <button
                        key={item.id}
                        className={styles.logoutItem}
                        onClick={() => onLogout && onLogout()}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a key={item.id} href={item.path}>
                        {item.label}
                      </a>
                    ),
                  )}
                </>
              ) : (
                <>
                  <a href="/login">Login</a>
                  <a href="/register">Register</a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.show : ""}`}
        onClick={closeMobileMenu}
      />
      <aside className={`${styles.drawer} ${mobileOpen ? styles.show : ""}`}>
        <div className={styles.drawerHeader}>
          <a href={logoHref} className={styles.logo}>
            <img src={logo} alt="Aurevian" className={styles.drawerLogoImage} />
          </a>
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
          />
        </div>

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
                  <a
                    href={item.path}
                    className={styles.drawerNavLink}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                )}

                {item.id === "shop" && (
                  <div
                    className={`${styles.drawerSubPanel} ${expanded ? styles.expanded : ""}`}
                  >
                    <div className={styles.drawerSubGroup}>
                      <h5>Category</h5>
                      {shopCategories.map((c) => (
                        <a key={c.id} href={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </a>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>Quick Links</h5>
                      {shopQuickLinks.map((c) => (
                        <a key={c.id} href={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </a>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>Shop by Style</h5>
                      {shopByStyle.map((c) => (
                        <a key={c.id} href={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </a>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>Fashion Items</h5>
                      {fashionItems.map((f) => (
                        <a key={f.id} href={f.path} onClick={closeMobileMenu}>
                          {f.label}
                        </a>
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
                        <a key={c.id} href={c.path} onClick={closeMobileMenu}>
                          {c.label}
                        </a>
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
                        <a key={g.id} href={g.path} onClick={closeMobileMenu}>
                          {g.label}
                        </a>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>By Occasion</h5>
                      {giftGuide.byOccasion.map((g) => (
                        <a key={g.id} href={g.path} onClick={closeMobileMenu}>
                          {g.label}
                        </a>
                      ))}
                    </div>
                    <div className={styles.drawerSubGroup}>
                      <h5>By Budget</h5>
                      {giftGuide.byBudget.map((g) => (
                        <a key={g.id} href={g.path} onClick={closeMobileMenu}>
                          {g.label}
                        </a>
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
                        <a key={o.id} href={o.path} onClick={closeMobileMenu}>
                          {o.label}
                        </a>
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
                        <a key={a.id} href={a.path} onClick={closeMobileMenu}>
                          {a.label}
                        </a>
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
                {user ? (
                  accountDropdown.map((item) =>
                    item.isAction ? (
                      <a
                        key={item.id}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onLogout && onLogout();
                          closeMobileMenu();
                        }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <a
                        key={item.id}
                        href={item.path}
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </a>
                    ),
                  )
                ) : (
                  <>
                    <a href="/login" onClick={closeMobileMenu}>
                      Login
                    </a>
                    <a href="/register" onClick={closeMobileMenu}>
                      Register
                    </a>
                    <Link to="/login" className={styles.authBtn}>
                      Login
                    </Link>
                    <Link to="/register" className={styles.authBtn}>
                      Register
                    </Link>

                    <Link to="/why-aurevian">Why Aurevian</Link>
                  </>
                )}
              </div>
            </div>
          </li>
        </ul>

        <div className={styles.drawerFooterIcons}>
          <a href="/wishlist" className={styles.iconBtn}>
            <FiHeart />
            <span>Wishlist</span>
          </a>
          <a href="/cart" className={styles.iconBtn}>
            <FiShoppingBag />
            <span>Cart</span>
          </a>
          <a href="/account/profile" className={styles.iconBtn}>
            <FiUser />
            <span>Account</span>
          </a>
        </div>
      </aside>
    </header>
  );
};

export default Header;
