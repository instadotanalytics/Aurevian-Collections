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
  const [query, setQuery] = useState("");
  const accountRef = useRef(null);
  const searchRef = useRef(null);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else {
      // Fallback for demo purposes — replace with real search routing
      console.log("Search submitted:", query);
    }
    setSearchOpen(false);
  };

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setOpenAccordion(null);
  };

  return (
    <header className={styles.navbar}>
      <AnnouncementBar items={announcementItems || announcements} />

      {/* ================= SINGLE ROW: logo | nav | icons ================= */}
      <div className={styles.topRow}>
        <button
          className={styles.hamburgerBtn}
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <FiMenu />
        </button>

        <a href={logoHref} className={styles.logo}>
          <img src={logo} alt="Aurevian" className={styles.logoImage} />
        </a>

        {/* ---- Desktop nav (center) ---- */}
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
                      <div className={styles.megaCol}>
                        <h4>Shop by Category</h4>
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
                      <div className={styles.megaBanner}>
                        <span>New Season</span>
                        <strong>
                          Bridal &amp; Festive Edit — Up to 40% Off
                        </strong>
                        <a href="/collections/bridal">Shop the edit →</a>
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

            <div
              className={`${styles.searchPanel} ${searchOpen ? styles.open : ""}`}
            >
              <form className={styles.searchForm} onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Search for earrings, necklaces, rings..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search products"
                  autoFocus={searchOpen}
                />
                <button
                  type="submit"
                  className={styles.searchIconBtn}
                  aria-label="Submit search"
                >
                  <FiSearch />
                </button>
              </form>
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

        <div className={styles.drawerSearch}>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", width: "100%" }}
          >
            <input
              type="text"
              placeholder="Search jewellery..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className={styles.searchIconBtn}
              aria-label="Search"
            >
              <FiSearch />
            </button>
          </form>
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
                      <h5>Shop by Category</h5>
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