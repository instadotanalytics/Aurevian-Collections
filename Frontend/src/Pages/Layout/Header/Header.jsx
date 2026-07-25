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
import {
  FaUserPlus, FaUserCheck
} from "react-icons/fa6";

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
// shopCategories / shopQuickLinks / shopByStfayle are imported.
const fashionItems = [
  { id: "fi-1", label: "Perfumes", path: "/fashion/perfumes" },
  { id: "fi-2", label: "Watches", path: "/fashion/watches" },
  { id: "fi-3", label: "Sarees", path: "/fashion/sarees" },
  { id: "fi-4", label: "Sunglasses", path: "/fashion/sunglasses" },
  { id: "fi-5", label: "Handbags", path: "/fashion/handbags" },
  { id: "fi-6", label: "Wallets", path: "/fashion/wallets" },
  { id: "fi-7", label: "Belts", path: "/fashion/belts" },
];

// Shop Categories with children - FOR MOBILE ONLY
const shopCategoriesWithChildren = [
  {
    id: "earrings",
    label: "Earrings",
    path: "/shop/earrings",
    children: [
      { id: "stud-earrings", label: "Stud Earrings", path: "/shop/earrings/stud" },
      { id: "drop-earrings", label: "Drop Earrings", path: "/shop/earrings/drop" },
      { id: "hoop-earrings", label: "Hoop Earrings", path: "/shop/earrings/hoop" },
      { id: "jhumkas", label: "Jhumkas", path: "/shop/earrings/jhumkas" },
      { id: "chandbalis", label: "Chandbalis", path: "/shop/earrings/chandbali" },
      { id: "danglers", label: "Danglers", path: "/shop/earrings/danglers" },
    ],
  },
  {
    id: "necklace-sets",
    label: "Necklace Sets",
    path: "/shop/necklace-sets",
    children: [
      { id: "bridal-sets", label: "Bridal Sets", path: "/shop/necklace-sets/bridal" },
      { id: "daily-wear", label: "Daily Wear", path: "/shop/necklace-sets/daily" },
      { id: "party-wear", label: "Party Wear", path: "/shop/necklace-sets/party" },
      { id: "chokers", label: "Chokers", path: "/shop/necklace-sets/chokers" },
      { id: "long-sets", label: "Long Necklaces", path: "/shop/necklace-sets/long" },
    ],
  },
  {
    id: "rings",
    label: "Rings",
    path: "/shop/rings",
    children: [
      { id: "solitaire", label: "Solitaire Rings", path: "/shop/rings/solitaire" },
      { id: "couple-rings", label: "Couple Rings", path: "/shop/rings/couple" },
      { id: "cocktail-rings", label: "Cocktail Rings", path: "/shop/rings/cocktail" },
      { id: "band-rings", label: "Band Rings", path: "/shop/rings/band" },
      { id: "statement-rings", label: "Statement Rings", path: "/shop/rings/statement" },
    ],
  },
  {
    id: "bangles",
    label: "Bangles",
    path: "/shop/bangles",
    children: [
      { id: "gold-bangles", label: "Gold Bangles", path: "/shop/bangles/gold" },
      { id: "kada", label: "Kada", path: "/shop/bangles/kada" },
      { id: "designer-bangles", label: "Designer Bangles", path: "/shop/bangles/designer" },
      { id: "traditional-bangles", label: "Traditional Bangles", path: "/shop/bangles/traditional" },
    ],
  },
  {
    id: "bracelets",
    label: "Bracelets",
    path: "/shop/bracelets",
    children: [
      { id: "chain-bracelets", label: "Chain Bracelets", path: "/shop/bracelets/chain" },
      { id: "cuff-bracelets", label: "Cuff Bracelets", path: "/shop/bracelets/cuff" },
      { id: "tennis-bracelets", label: "Tennis Bracelets", path: "/shop/bracelets/tennis" },
      { id: "anklets", label: "Anklets", path: "/shop/bracelets/anklets" },
    ],
  },
  {
    id: "pendants",
    label: "Pendants",
    path: "/shop/pendants",
    children: [
      { id: "diamond-pendants", label: "Diamond Pendants", path: "/shop/pendants/diamond" },
      { id: "gold-pendants", label: "Gold Pendants", path: "/shop/pendants/gold" },
      { id: "gemstone-pendants", label: "Gemstone Pendants", path: "/shop/pendants/gemstone" },
      { id: "locket-pendants", label: "Locket Pendants", path: "/shop/pendants/locket" },
    ],
  },
  {
    id: "chains",
    label: "Chains",
    path: "/shop/chains",
    children: [
      { id: "gold-chains", label: "Gold Chains", path: "/shop/chains/gold" },
      { id: "silver-chains", label: "Silver Chains", path: "/shop/chains/silver" },
      { id: "adjustable-chains", label: "Adjustable Chains", path: "/shop/chains/adjustable" },
    ],
  },
  {
    id: "maang-tikka",
    label: "Maang Tikka",
    path: "/shop/maang-tikka",
    children: [
      { id: "bridal-tikka", label: "Bridal Tikka", path: "/shop/maang-tikka/bridal" },
      { id: "daily-tikka", label: "Daily Wear Tikka", path: "/shop/maang-tikka/daily" },
    ],
  },
  {
    id: "nose-pins",
    label: "Nose Pins",
    path: "/shop/nose-pins",
    children: [
      { id: "stud-pins", label: "Stud Nose Pins", path: "/shop/nose-pins/stud" },
      { id: "hoop-pins", label: "Hoop Nose Pins", path: "/shop/nose-pins/hoop" },
    ],
  },
];

// Gift Guide Categories with children - FOR MOBILE ONLY
const giftGuideWithChildren = {
  byRecipient: [
    {
      id: "for-her",
      label: "For Her",
      path: "/gift-guide/for-her",
      children: [
        { id: "wife", label: "For Wife", path: "/gift-guide/for-her/wife" },
        { id: "girlfriend", label: "For Girlfriend", path: "/gift-guide/for-her/girlfriend" },
        { id: "mother", label: "For Mother", path: "/gift-guide/for-her/mother" },
        { id: "daughter", label: "For Daughter", path: "/gift-guide/for-her/daughter" },
        { id: "sister", label: "For Sister", path: "/gift-guide/for-her/sister" },
        { id: "friend", label: "For Friend", path: "/gift-guide/for-her/friend" },
      ],
    },
    {
      id: "for-him",
      label: "For Him",
      path: "/gift-guide/for-him",
      children: [
        { id: "husband", label: "For Husband", path: "/gift-guide/for-him/husband" },
        { id: "boyfriend", label: "For Boyfriend", path: "/gift-guide/for-him/boyfriend" },
        { id: "father", label: "For Father", path: "/gift-guide/for-him/father" },
        { id: "brother", label: "For Brother", path: "/gift-guide/for-him/brother" },
        { id: "son", label: "For Son", path: "/gift-guide/for-him/son" },
      ],
    },
    {
      id: "for-kids",
      label: "For Kids",
      path: "/gift-guide/for-kids",
      children: [
        { id: "baby-girl", label: "For Baby Girl", path: "/gift-guide/for-kids/baby-girl" },
        { id: "baby-boy", label: "For Baby Boy", path: "/gift-guide/for-kids/baby-boy" },
        { id: "teen-girl", label: "For Teen Girl", path: "/gift-guide/for-kids/teen-girl" },
        { id: "teen-boy", label: "For Teen Boy", path: "/gift-guide/for-kids/teen-boy" },
      ],
    },
    {
      id: "for-couples",
      label: "For Couples",
      path: "/gift-guide/for-couples",
      children: [
        { id: "anniversary", label: "Anniversary Gifts", path: "/gift-guide/for-couples/anniversary" },
        { id: "wedding", label: "Wedding Gifts", path: "/gift-guide/for-couples/wedding" },
        { id: "engagement", label: "Engagement Gifts", path: "/gift-guide/for-couples/engagement" },
      ],
    },
  ],
  byOccasion: [
    {
      id: "wedding",
      label: "Wedding",
      path: "/gift-guide/wedding",
      children: [
        { id: "wedding-gifts", label: "Wedding Gifts", path: "/gift-guide/wedding/gifts" },
        { id: "bridal-trousseau", label: "Bridal Trousseau", path: "/gift-guide/wedding/trousseau" },
        { id: "return-gifts", label: "Return Gifts", path: "/gift-guide/wedding/return" },
      ],
    },
    {
      id: "anniversary",
      label: "Anniversary",
      path: "/gift-guide/anniversary",
      children: [
        { id: "1st-anniversary", label: "1st Anniversary", path: "/gift-guide/anniversary/1st" },
        { id: "25th-anniversary", label: "25th Anniversary", path: "/gift-guide/anniversary/25th" },
        { id: "50th-anniversary", label: "50th Anniversary", path: "/gift-guide/anniversary/50th" },
      ],
    },
    {
      id: "birthday",
      label: "Birthday",
      path: "/gift-guide/birthday",
      children: [
        { id: "birthday-gifts", label: "Birthday Gifts", path: "/gift-guide/birthday/gifts" },
        { id: "surprise-gifts", label: "Surprise Gifts", path: "/gift-guide/birthday/surprise" },
      ],
    },
    {
      id: "festival",
      label: "Festival",
      path: "/gift-guide/festival",
      children: [
        { id: "diwali", label: "Diwali Gifts", path: "/gift-guide/festival/diwali" },
        { id: "rakhi", label: "Rakhi Gifts", path: "/gift-guide/festival/rakhi" },
        { id: "christmas", label: "Christmas Gifts", path: "/gift-guide/festival/christmas" },
        { id: "eid", label: "Eid Gifts", path: "/gift-guide/festival/eid" },
      ],
    },
  ],
  byBudget: [
    {
      id: "under-1000",
      label: "Under ₹1,000",
      path: "/gift-guide/under-1000",
      children: [
        { id: "budget-earrings", label: "Earrings", path: "/gift-guide/under-1000/earrings" },
        { id: "budget-bracelets", label: "Bracelets", path: "/gift-guide/under-1000/bracelets" },
      ],
    },
    {
      id: "1000-5000",
      label: "₹1,000 - ₹5,000",
      path: "/gift-guide/1000-5000",
      children: [
        { id: "budget-rings", label: "Rings", path: "/gift-guide/1000-5000/rings" },
        { id: "budget-pendants", label: "Pendants", path: "/gift-guide/1000-5000/pendants" },
      ],
    },
    {
      id: "5000-15000",
      label: "₹5,000 - ₹15,000",
      path: "/gift-guide/5000-15000",
      children: [
        { id: "budget-sets", label: "Necklace Sets", path: "/gift-guide/5000-15000/sets" },
        { id: "budget-bangles", label: "Bangles", path: "/gift-guide/5000-15000/bangles" },
      ],
    },
    {
      id: "above-15000",
      label: "Above ₹15,000",
      path: "/gift-guide/above-15000",
      children: [
        { id: "premium-gems", label: "Gemstone Jewellery", path: "/gift-guide/above-15000/gemstone" },
        { id: "premium-diamond", label: "Diamond Jewellery", path: "/gift-guide/above-15000/diamond" },
      ],
    },
  ],
};

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

// Mobile Shop Columns - All have arrows (sub-items)
const mobileShopColumns = [
  {
    id: "category",
    label: "Shop by Category",
    items: shopCategoriesWithChildren,
  },
  {
    id: "quicklinks",
    label: "Quick Links",
    items: shopQuickLinks,
  },
  {
    id: "style",
    label: "Shop by Style",
    items: shopByStyle,
  },
  {
    id: "fashion",
    label: "Fashion Items",
    items: fashionItems,
  },
];

// Mobile Gift Columns - All have arrows (sub-items)
const mobileGiftColumns = [
  {
    id: "recipient",
    label: "By Recipient",
    items: giftGuideWithChildren.byRecipient,
  },
  {
    id: "occasion",
    label: "By Occasion",
    items: giftGuideWithChildren.byOccasion,
  },
  {
    id: "budget",
    label: "By Budget",
    items: giftGuideWithChildren.byBudget,
  },
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
        setMobileShopSubOpen(null);
        setMobileGiftSubOpen(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // Close mobile drawer on window resize (when screen becomes desktop)
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

  // Close mobile drawer when switching tabs/dev tools
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
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mobileOpen]);

  // Close drawer on click outside
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
      <AnnouncementBar items={announcementItems || announcements} />

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
        {/* 
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
        </div> */}

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
                            <span className={styles.headingText}>{col.label}</span>
                            <FiChevronRight
                              className={`${styles.drawerChevron} ${mobileShopSubOpen === col.id ? styles.rotated : ""}`}
                            />
                          </span>
                        </button>
                        {mobileShopSubOpen === col.id && (
                          <div className={styles.drawerSubItems}>
                            {col.items.map((item) => (
                              <Link
                                key={item.id}
                                to={item.path}
                                onClick={closeMobileMenu}
                              >
                                {item.label}
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
                            <span className={styles.headingText}>{col.label}</span>
                            <FiChevronRight
                              className={`${styles.drawerChevron} ${mobileGiftSubOpen === col.id ? styles.rotated : ""}`}
                            />
                          </span>
                        </button>
                        {mobileGiftSubOpen === col.id && (
                          <div className={styles.drawerSubItems}>
                            {col.items.map((item) => (
                              <Link
                                key={item.id}
                                to={item.path}
                                onClick={closeMobileMenu}
                              >
                                {item.label}
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
    </header>
  );
};

export default Header;