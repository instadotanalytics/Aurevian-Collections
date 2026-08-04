
import React, { useState } from "react";
import styles from "./shop.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";

import shopHero from "../../assets/shophero.png";

import solitaireBand from "../../assets/solitaire-band.jpg";
import layeredChain from "../../assets/layered-chain.jpg";
import dropStuds from "../../assets/drop-studs.jpg";
import charmBracelet from "../../assets/charm-bracelet.jpg";
import stackRingSet from "../../assets/stack-ring-set.jpg";
import beadedAnklet from "../../assets/beaded-anklet.jpg";
import bridalJewelSet from "../../assets/bridal-jewel-set.jpg";
import hoopEarrings from "../../assets/hoop-earrings.jpg";
import pendantChain from "../../assets/pendant-chain.jpg";
import twistBand from "../../assets/twist-band.jpg";
import multipleChainBracelets from "../../assets/multiple-chain-braclets.jpg";
import pearlStuds from "../../assets/pearl-studs.jpg";

import { LuSlidersHorizontal } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { FiShoppingBag, FiCheck, FiChevronDown } from "react-icons/fi";

const categories = [
  { name: "Rings", count: 32 },
  { name: "Necklaces", count: 28 },
  { name: "Earrings", count: 40 },
  { name: "Bracelets", count: 19 },
  { name: "Anklets", count: 11 },
  { name: "Bridal Sets", count: 8 },
];

const metals = [
  { name: "Gold Plated", count: 36 },
  { name: "Rose Gold", count: 24 },
  { name: "Silver", count: 21 },
  { name: "Oxidised", count: 14 },
];

const promotions = ["New Arrivals", "Best Sellers", "On Sale"];

const availability = [
  { name: "In Stock", count: 98 },
  { name: "Out of Stock", count: 6 },
];

const products = [
  {
    id: 1,
    badge: "30% off",
    category: "Rings",
    name: "Aurevian Solitaire Band",
    priceNow: "₹2,100",
    priceOld: "₹3,000",
    image: solitaireBand,
  },
  {
    id: 2,
    badge: "20% off",
    category: "Necklaces",
    name: "Layla Layered Chain",
    priceNow: "₹3,400",
    priceOld: "₹4,250",
    image: layeredChain,
  },
  {
    id: 3,
    badge: "25% off",
    category: "Earrings",
    name: "Amara Drop Studs",
    priceNow: "₹1,650",
    priceOld: "₹2,200",
    image: dropStuds,
  },
  {
    id: 4,
    badge: "40% off",
    category: "Bracelets",
    name: "Celeste Charm Bracelet",
    priceNow: "₹1,800",
    priceOld: "₹3,000",
    image: charmBracelet,
  },
  {
    id: 5,
    badge: "15% off",
    category: "Rings",
    name: "Noor Stack Ring Set",
    priceNow: "₹1,275",
    priceOld: "₹1,500",
    image: stackRingSet,
  },
  {
    id: 6,
    badge: "50% off",
    category: "Anklets",
    name: "Meera Beaded Anklet",
    priceNow: "₹950",
    priceOld: "₹1,900",
    image: beadedAnklet,
  },
  {
    id: 7,
    badge: "10% off",
    category: "Bridal Sets",
    name: "Anaya Bridal Jewel Set",
    priceNow: "₹6,300",
    priceOld: "₹7,000",
    image: bridalJewelSet,
  },
  {
    id: 8,
    badge: "35% off",
    category: "Earrings",
    name: "Zoya Hoop Earrings",
    priceNow: "₹1,300",
    priceOld: "₹2,000",
    image: hoopEarrings,
  },
  {
    id: 9,
    badge: "45% off",
    category: "Necklaces",
    name: "Ishani Pendant Chain",
    priceNow: "₹2,750",
    priceOld: "₹5,000",
    image: pendantChain,
  },
  {
    id: 10,
    badge: "20% off",
    category: "Rings",
    name: "Kavya Twist Band",
    priceNow: "₹2,400",
    priceOld: "₹3,000",
    image: twistBand,
  },
  {
    id: 11,
    badge: "30% off",
    category: "Bracelets",
    name: "Riya Chain Bracelet",
    priceNow: "₹1,950",
    priceOld: "₹2,800",
    image: multipleChainBracelets,
  },
  {
    id: 12,
    badge: "25% off",
    category: "Earrings",
    name: "Sana Pearl Studs",
    priceNow: "₹1,450",
    priceOld: "₹1,950",
    image: pearlStuds,
  },
];

const perks = [
  {
    icon: "📦",
    title: "Free Shipping",
    text: "Free delivery for orders above ₹2,000",
  },
  {
    icon: "💳",
    title: "Flexible Payment",
    text: "Multiple secure payment options",
  },
  { icon: "☎", title: "24×7 Support", text: "We support online all day" },
];

export default function Shop() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(new Set());

  const [wishlist, setWishlist] = useState(new Set());

  // ---------- Cart state: tracks which product ids have been added ----------
  const [cart, setCart] = useState(new Set());

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  // ---------- Add to Cart handler ----------
  const addToCart = (id) => {
    setCart((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const toggleFilter = (type, value) => {
    const key = `${type}:${value}`;
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isSelected = (type, value) => selectedFilters.has(`${type}:${value}`);

  return (
    <div className={styles.page}>
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= MAIN CONTENT ================= */}
      <div className={styles.mainContent}>
        {/* ================= PAGE TITLE / HERO ================= */}
        <section className={styles.pageTitle}>
          <img
            src={shopHero}
            alt="Shop Collection"
            className={styles.heroImage}
          />
        </section>

        {/* ================= SHOP BODY ================= */}
        <div className={styles.shopWrap}>
          {/* ---------- Mobile Filter Toggle Button ---------- */}
          <button
            type="button"
            className={styles.filterToggle}
            onClick={() => setFiltersOpen((prev) => !prev)}
            aria-expanded={filtersOpen}
          >
            <span className={styles.filterToggleText}>Filter Options</span>
            <span className={styles.filterToggleIcon}>
              <LuSlidersHorizontal />
            </span>
          </button>

          {/* ---------- Mobile backdrop (only shows when filters are open) ---------- */}
          {filtersOpen && (
            <div
              className={styles.filterOverlay}
              onClick={() => setFiltersOpen(false)}
            />
          )}

          {/* ---------- Sidebar / Bottom-sheet Filters ---------- */}
          <aside
            className={`${styles.filters} ${
              filtersOpen ? styles.filtersOpen : ""
            }`}
          >
            {/* Fixed header: stays visible while the list below scrolls */}
            <div className={styles.filtersSheetHeader}>
              <h3 className={styles.filtersHeading}>Filter Options</h3>
              <button
                type="button"
                className={styles.filtersClose}
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            <div className={styles.filtersInner}>
              <div className={styles.filterGroup}>
                <h3 className={styles.groupHeading}>By Category</h3>
                <ul>
                  {categories.map((c) => (
                    <li
                      key={c.name}
                      className={
                        isSelected("category", c.name) ? styles.selected : ""
                      }
                    >
                      <label className={styles.checkRow}>
                        <input
                          type="checkbox"
                          checked={isSelected("category", c.name)}
                          onChange={() => toggleFilter("category", c.name)}
                        />
                        <span className={styles.checkLabel}>{c.name}</span>
                      </label>
                      <span className={styles.count}>{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.groupHeading}>By Metal</h3>
                <ul>
                  {metals.map((m) => (
                    <li
                      key={m.name}
                      className={
                        isSelected("metal", m.name) ? styles.selected : ""
                      }
                    >
                      <label className={styles.checkRow}>
                        <input
                          type="checkbox"
                          checked={isSelected("metal", m.name)}
                          onChange={() => toggleFilter("metal", m.name)}
                        />
                        <span className={styles.checkLabel}>{m.name}</span>
                      </label>
                      <span className={styles.count}>{m.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.groupHeading}>Price</h3>
                <div className={styles.priceSlider}>
                  <div className={styles.fill}></div>
                  <div
                    className={`${styles.handle} ${styles.handleLeft}`}
                  ></div>
                  <div
                    className={`${styles.handle} ${styles.handleRight}`}
                  ></div>
                </div>
                <div className={styles.priceValues}>
                  <span>₹500</span>
                  <span>₹8,000</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.groupHeading}>By Promotions</h3>
                <ul>
                  {promotions.map((p) => (
                    <li
                      key={p}
                      className={
                        isSelected("promotion", p) ? styles.selected : ""
                      }
                    >
                      <label className={styles.checkRow}>
                        <input
                          type="checkbox"
                          checked={isSelected("promotion", p)}
                          onChange={() => toggleFilter("promotion", p)}
                        />
                        <span className={styles.checkLabel}>{p}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.groupHeading}>Availability</h3>
                <ul>
                  {availability.map((a) => (
                    <li
                      key={a.name}
                      className={
                        isSelected("availability", a.name)
                          ? styles.selected
                          : ""
                      }
                    >
                      <label className={styles.checkRow}>
                        <input
                          type="checkbox"
                          checked={isSelected("availability", a.name)}
                          onChange={() =>
                            toggleFilter("availability", a.name)
                          }
                        />
                        <span className={styles.checkLabel}>{a.name}</span>
                      </label>
                      <span className={styles.count}>{a.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.promoTags}>
                <span>Price: ₹500–₹8,000 ✕</span>
                <span>Best Seller ✕</span>
                <span>In Stock ✕</span>
                <span className={styles.clear}>Clear all</span>
              </div>

              {/* Apply button, mobile only */}
              <button
                type="button"
                className={styles.applyFilters}
                onClick={() => setFiltersOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* ---------- Product Listing ---------- */}
          <main>
            <div className={styles.toolbar}>
              <span className={styles.resultsCount}>
                Showing 1–{products.length} of 138 results
              </span>
              <div className={styles.sortWrapper}>
                <select className={styles.sortSelect}>
                  <option>Default Sorting</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                  <option>Top Rated</option>
                </select>
                <FiChevronDown className={styles.sortChevron} />
              </div>
            </div>

            <div className={styles.productGrid}>
              {products.map((p) => (
                <div className={styles.productCard} key={p.id}>
                  <div className={styles.productMedia}>
                    <span className={styles.badge}>{p.badge}</span>
                    <span className={styles.productCatOverlay}>
                      {p.category}
                    </span>
                    <div className={styles.wishlistActions}>
                      <button
                        type="button"
                        className={`${styles.wishlistBtn} ${
                          wishlist.has(p.id) ? styles.wishlistBtnActive : ""
                        }`}
                        onClick={() => toggleWishlist(p.id)}
                        aria-label={
                          wishlist.has(p.id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {wishlist.has(p.id) ? <FaHeart /> : <FiHeart />}
                      </button>
                    </div>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className={styles.productImage}
                      />
                    ) : (
                      <span className={styles.placeholderLabel}>
                        Product Image
                      </span>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.productPrice}>
                      <span className={styles.priceNow}>{p.priceNow}</span>
                      <span className={styles.priceOld}>{p.priceOld}</span>
                    </div>

                    {/* ---------- Add to Cart button ---------- */}
                    <button
                      type="button"
                      className={`${styles.addToCartBtn} ${
                        cart.has(p.id) ? styles.addToCartBtnActive : ""
                      }`}
                      onClick={() => addToCart(p.id)}
                      disabled={cart.has(p.id)}
                    >
                      {cart.has(p.id) ? (
                        <>
                          <FiCheck /> Added to Cart
                        </>
                      ) : (
                        <>
                          <FiShoppingBag /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ---------- Pagination ---------- */}
            <div className={styles.pagination}>
              <a href="#">‹</a>
              <a href="#" className={styles.active}>
                1
              </a>
              <a href="#">2</a>
              <a href="#">3</a>
              <a href="#">…</a>
              <a href="#">12</a>
              <a href="#">›</a>
            </div>
          </main>
        </div>

        {/* ================= PERKS STRIP ================= */}
        <section className={styles.perks}>
          {perks.map((perk) => (
            <div className={styles.perk} key={perk.title}>
              <div className={styles.icon}>{perk.icon}</div>
              <div>
                <h4>{perk.title}</h4>
                <p>{perk.text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}