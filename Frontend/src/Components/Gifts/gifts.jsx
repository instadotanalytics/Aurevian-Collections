// src/Pages/Gifts/Gifts.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styles from "./gifts.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";
import giftHero from "../../assets/heroimageg.png";
import giftMiddle from "../../assets/giftmiddle.png";

import {
  FiGift,
  FiCheck,
  FiHeart,
  FiStar,
  FiShoppingBag,
  FiChevronDown,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { LuSlidersHorizontal } from "react-icons/lu";

import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";

const jewelHighlights = [
  ["Brilliant Cut Quality", "Natural Color Grade"],
  ["High Clarity Rating", "Precise Carat Weight"],
  ["Elegant Setting Style", "Durable Metal Choice"],
];

/* ---------- Filter data ---------- */
const occasions = [
  { name: "Anniversary", count: 14 },
  { name: "Birthday", count: 22 },
  { name: "Wedding", count: 12 },
  { name: "Valentine's Day", count: 9 },
  { name: "Mother's Day", count: 11 },
  { name: "Just Because", count: 18 },
];

const recipients = [
  { name: "For Her", count: 46 },
  { name: "For Him", count: 15 },
  { name: "For Couples", count: 10 },
  { name: "For Kids", count: 7 },
];

const budgets = [
  { name: "Under ₹1,000", count: 20 },
  { name: "₹1,000 – ₹3,000", count: 34 },
  { name: "₹3,000 – ₹6,000", count: 18 },
  { name: "Above ₹6,000", count: 6 },
];

const promotions = ["Gift Wrapped", "Best Seller", "Trending", "Premium Gift"];

const availability = [
  { name: "In Stock", count: 72 },
  { name: "Out of Stock", count: 4 },
];

const testimonials = [
  {
    name: "Ananya R.",
    initials: "AR",
    rating: 5,
    quote: "This necklace exceeded every expectation!",
  },
  {
    name: "Kabir M.",
    initials: "KM",
    rating: 5,
    quote: "Finally found gifts that feel truly personal.",
  },
  {
    name: "Simran K.",
    initials: "SK",
    rating: 4,
    quote: "Elegant packaging, exactly as pictured.",
  },
];

const perks = [
  {
    icon: "🎁",
    title: "Free Gift Wrapping",
    text: "Every gift order wrapped at no extra cost",
  },
  {
    icon: "💌",
    title: "Personalised Note",
    text: "Add a free handwritten message card",
  },
  {
    icon: "🔄",
    title: "Easy Exchange",
    text: "Hassle-free exchange within 15 days",
  },
];

export default function Gifts() {
  const dispatch = useDispatch();
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const giftsData = byPlacement.gifts || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [wishlist, setWishlist] = useState(new Set());
  const [cart, setCart] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const products = giftsData.products || [];
  const { total, totalPages } = giftsData.pagination || {
    total: 0,
    totalPages: 1,
  };

  // Fetch products when page changes
  useEffect(() => {
    dispatch(
      fetchProductsByPlacement({
        placement: "gifts",
        page: currentPage,
        limit: itemsPerPage,
      }),
    );
  }, [dispatch, currentPage]);

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
    <>
      <Header />
      <div className={styles.page}>

        <div className={styles.mainContent}>
          {/* ================= HERO (UNCHANGED) ================= */}
          <section className={styles.hero}>
            <img
              src={giftHero}
              alt="Timeless gifts for every celebration"
              className={styles.heroImage}
            />
          </section>

          {/* ================= GIFT SHOP BODY (FILTERS + GRID) ================= */}
          <div className={styles.shopWrap} id="shopSection">
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

            {/* ---------- Mobile backdrop ---------- */}
            {filtersOpen && (
              <div
                className={styles.filterOverlay}
                onClick={() => setFiltersOpen(false)}
              />
            )}

            {/* ---------- Sidebar / Bottom-sheet Filters ---------- */}
            <aside
              className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""
                }`}
            >
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
                  <h3 className={styles.groupHeading}>By Occasion</h3>
                  <ul>
                    {occasions.map((o) => (
                      <li
                        key={o.name}
                        className={
                          isSelected("occasion", o.name) ? styles.selected : ""
                        }
                      >
                        <label className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={isSelected("occasion", o.name)}
                            onChange={() => toggleFilter("occasion", o.name)}
                          />
                          <span className={styles.checkLabel}>{o.name}</span>
                        </label>
                        <span className={styles.count}>{o.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.filterGroup}>
                  <h3 className={styles.groupHeading}>By Recipient</h3>
                  <ul>
                    {recipients.map((r) => (
                      <li
                        key={r.name}
                        className={
                          isSelected("recipient", r.name) ? styles.selected : ""
                        }
                      >
                        <label className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={isSelected("recipient", r.name)}
                            onChange={() => toggleFilter("recipient", r.name)}
                          />
                          <span className={styles.checkLabel}>{r.name}</span>
                        </label>
                        <span className={styles.count}>{r.count}</span>
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
                  <h3 className={styles.groupHeading}>By Budget</h3>
                  <ul>
                    {budgets.map((b) => (
                      <li
                        key={b.name}
                        className={
                          isSelected("budget", b.name) ? styles.selected : ""
                        }
                      >
                        <label className={styles.checkRow}>
                          <input
                            type="checkbox"
                            checked={isSelected("budget", b.name)}
                            onChange={() => toggleFilter("budget", b.name)}
                          />
                          <span className={styles.checkLabel}>{b.name}</span>
                        </label>
                        <span className={styles.count}>{b.count}</span>
                      </li>
                    ))}
                  </ul>
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
                            onChange={() => toggleFilter("availability", a.name)}
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
                  {isLoading
                    ? "Loading..."
                    : `Showing ${products.length} of ${total} results`}
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
                {products.map((p) => {
                  const discount =
                    p.pricing?.salePrice && p.pricing?.originalPrice
                      ? Math.round(
                        ((p.pricing.originalPrice - p.pricing.salePrice) /
                          p.pricing.originalPrice) *
                        100,
                      )
                      : 0;
                  return (
                    <div className={styles.productCard} key={p._id}>
                      {/* ✅ NEW: navigate to product detail page */}
                      <Link
                        to={`/product/${p.productSlug}`}
                        className={styles.productMedia}
                      >
                        {discount > 0 && (
                          <span className={styles.badge}>{discount}% off</span>
                        )}
                        <span className={styles.productCatOverlay}>
                          {p.category?.categoryData?.label || "Gift"}
                        </span>
                        <div className={styles.wishlistActions}>
                          <button
                            type="button"
                            className={`${styles.wishlistBtn} ${wishlist.has(p._id) ? styles.wishlistBtnActive : ""
                              }`}
                            onClick={(e) => {
                              e.preventDefault(); // ✅ NEW: don't trigger Link navigation
                              e.stopPropagation();
                              toggleWishlist(p._id);
                            }}
                            aria-label={
                              wishlist.has(p._id)
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                          >
                            {wishlist.has(p._id) ? <FaHeart /> : <FiHeart />}
                          </button>
                        </div>
                        {p.thumbnail?.url ? (
                          <img
                            src={p.thumbnail.url}
                            alt={p.productName}
                            className={styles.productImage}
                          />
                        ) : (
                          <span className={styles.placeholderLabel}>
                            Product Image
                          </span>
                        )}
                      </Link>
                      <div className={styles.productInfo}>
                        {/* ✅ NEW: product name also links */}
                        <Link
                          to={`/product/${p.productSlug}`}
                          className={styles.productName}
                        >
                          {p.productName}
                        </Link>
                        <div className={styles.productPrice}>
                          <span className={styles.priceNow}>
                            ₹
                            {(
                              p.pricing?.salePrice || p.pricing?.originalPrice
                            )?.toLocaleString() || "0"}
                          </span>
                          {p.pricing?.salePrice && p.pricing?.originalPrice && (
                            <span className={styles.priceOld}>
                              ₹{p.pricing.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`${styles.addToCartBtn} ${cart.has(p._id) ? styles.addToCartBtnActive : ""
                            }`}
                          onClick={() => addToCart(p._id)}
                          disabled={cart.has(p._id)}
                        >
                          {cart.has(p._id) ? (
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
                  );
                })}
              </div>

              {/* ---------- Pagination ---------- */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                  >
                    ‹
                  </a>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <a
                        key={n}
                        href="#"
                        className={n === currentPage ? styles.active : ""}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(n);
                        }}
                      >
                        {n}
                      </a>
                    ),
                  )}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                  >
                    ›
                  </a>
                </div>
              )}
            </main>
          </div>

          {/* ================= TESTIMONIALS (UNCHANGED) ================= */}
          <section className={styles.testimonials}>
            <div className={styles.testimonialsHeading}>
              <span className={styles.testimonialsKicker}>
                Love From Our Customers
              </span>
            </div>

            <div className={styles.testimonialsGrid}>
              {testimonials.map((t) => (
                <div className={styles.testimonialCard} key={t.name}>
                  <span className={styles.avatar}>{t.initials}</span>
                  <div className={styles.testimonialBody}>
                    <div className={styles.stars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className={
                            i < t.rating ? styles.starFilled : styles.starEmpty
                          }
                        />
                      ))}
                    </div>
                    <p className={styles.testimonialQuote}>"{t.quote}"</p>
                    <div className={styles.authorName}>– {t.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ================= COMMITMENT / BRAND STORY (UNCHANGED) ================= */}
          <section className={styles.commitment}>
            <div className={styles.commitmentGrid}>
              <div className={styles.commitmentText}>
                <span className={styles.commitmentKicker}>
                  Jewels As Unique As You
                </span>
                <h2 className={styles.commitmentTitle}>
                  Commitment, Forever, In Every Sparkling Jewel
                </h2>
                <p className={styles.commitmentDesc}>
                  Every piece we craft is built on precision and care, from the
                  first cut to the final polish. We pair timeless design with
                  honest quality, so what you gift carries meaning that lasts well
                  beyond the moment it's opened.
                </p>

                <div className={styles.featureList}>
                  {jewelHighlights.map((pair, idx) => (
                    <React.Fragment key={idx}>
                      <div className={styles.featureItem}>
                        <span className={styles.featureIcon}>
                          <FiCheck />
                        </span>
                        {pair[0]}
                      </div>
                      <div className={styles.featureItem}>
                        <span className={styles.featureIcon}>
                          <FiCheck />
                        </span>
                        {pair[1]}
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <a href="#shopSection" className={styles.knowMoreBtn}>
                  Shop
                </a>
              </div>

              <div className={styles.commitmentMedia}>
                <img
                  src={giftMiddle}
                  alt="Model wearing layered gold jewellery"
                  className={styles.commitmentImage}
                />
              </div>
            </div>
          </section>

          {/* ================= PERKS STRIP (UNCHANGED) ================= */}
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

        <Footer />
      </div>
      </>
      );
}