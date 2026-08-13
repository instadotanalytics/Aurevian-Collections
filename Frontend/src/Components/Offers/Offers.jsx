// src/Components/Offers/Offers.jsx

import React, { useRef, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiHeart,
  FiTrendingUp,
  FiGift,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiCheck,
} from "react-icons/fi";
import { LuSlidersHorizontal } from "react-icons/lu";
import styles from "./Offers.module.css";
import craftImage1 from "../../assets/offersimg.png";
import Footer from "../../Pages/Layout/Footer/Footer.jsx";
import Header from "../../Pages/Layout/Header/Header.jsx";
import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";

/* ----------------------------------------------------------------
   Data — All offers, deals, and promotional content
------------------------------------------------------------------- */

const BOTTOM_FEATURES = [
  {
    icon: <FiHeart />,
    title: "Curated with Love",
    description: "Every piece is carefully selected for you",
  },
  {
    icon: <FiTrendingUp />,
    title: "Timeless Elegance",
    description: "Designed to add beauty to every moment",
  },
  {
    icon: <FiGift />,
    title: "Premium Packaging",
    description: "Luxury unboxing experience",
  },
  {
    icon: <FiSun />,
    title: "Trusted by Thousands",
    description: "Join our community of happy customers",
  },
];

// Filter categories matching Collections page
const FILTER_CATEGORIES = [
  "All",
  "Rings",
  "Earrings",
  "Necklaces",
  "Bracelets",
  "Anklets",
  "Bridal Sets",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Default Sorting" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "discount-desc", label: "Discount: High to Low" },
];

/* ----------------------------------------------------------------
   Skeleton Card
------------------------------------------------------------------- */
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonText} style={{ width: "80%" }} />
        <div className={styles.skeletonText} style={{ width: "40%" }} />
        <div className={styles.skeletonBtn} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Persistent Reveal-on-scroll with Blur Effect
------------------------------------------------------------------- */
function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px", ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options]);

  return [ref, visible];
}

function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  stagger = false,
  ...rest
}) {
  const [ref, visible] = useReveal();
  const staggerClass = stagger ? styles.revealStagger : "";

  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${visible ? styles.revealVisible : ""} ${staggerClass} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default function Offers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { byPlacement } = useSelector((state) => state.storefrontProduct);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const offersData = byPlacement.offers || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cartLoadingId, setCartLoadingId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [localLoading, setLocalLoading] = useState(false);
  const itemsPerPage = 9;

  const products = offersData.products || [];
  const { total, totalPages } = offersData.pagination || {
    total: 0,
    totalPages: 1,
  };

  // Throttled fetch — minimum 1000 ms skeleton display
  useEffect(() => {
    setLocalLoading(true);
    const start = Date.now();
    let timeoutId;

    dispatch(
      fetchProductsByPlacement({
        placement: "offers",
        page: currentPage + 1,
        limit: itemsPerPage,
        categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
      }),
    )
      .unwrap()
      .catch(() => {})
      .finally(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        timeoutId = setTimeout(() => setLocalLoading(false), remaining);
      });

    return () => clearTimeout(timeoutId);
  }, [dispatch, currentPage, selectedCategory]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Client-side sort
  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case "price-asc":
        return list.sort(
          (a, b) =>
            (a.pricing?.salePrice || a.pricing?.originalPrice || 0) -
            (b.pricing?.salePrice || b.pricing?.originalPrice || 0),
        );
      case "price-desc":
        return list.sort(
          (a, b) =>
            (b.pricing?.salePrice || b.pricing?.originalPrice || 0) -
            (a.pricing?.salePrice || a.pricing?.originalPrice || 0),
        );
      case "name-asc":
        return list.sort((a, b) => a.productName.localeCompare(b.productName));
      case "name-desc":
        return list.sort((a, b) => b.productName.localeCompare(a.productName));
      case "discount-desc":
        return list.sort((a, b) => {
          const discA =
            a.pricing?.originalPrice && a.pricing?.salePrice
              ? a.pricing.originalPrice - a.pricing.salePrice
              : 0;
          const discB =
            b.pricing?.originalPrice && b.pricing?.salePrice
              ? b.pricing.originalPrice - b.pricing.salePrice
              : 0;
          return discB - discA;
        });
      default:
        return list;
    }
  }, [products, sortBy]);

  // Scroll to offers section function
  const scrollToOffers = () => {
    const offersSection = document.getElementById("offers-section");
    if (offersSection) {
      const rect = offersSection.getBoundingClientRect();
      const top = rect.top + window.pageYOffset;
      window.scrollTo({ top: top - 120, behavior: "smooth" });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      setTimeout(scrollToOffers, 100);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      setTimeout(scrollToOffers, 100);
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/offers" } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const toggleWishlist = (productId) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(productId)).catch(() => {});
  };

  const handleAddToCart = async (productId) => {
    if (!requireAuth()) return;
    try {
      setCartLoadingId(productId);
      await dispatch(addItemToCart({ productId, quantity: 1 })).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 7000]);
    setSortBy("newest");
    setCurrentPage(0);
  };

  const openFilters = () => {
    setFiltersOpen(true);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${window.scrollY}px`;
  };

  const closeFilters = () => {
    const scrollY = document.body.style.top;
    setFiltersOpen(false);
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
  };

  return (
    <>
      <Header />
      <section className={styles.offers} aria-label="Aurevian Exclusive Offers">
        {/* ---------------- Hero Banner with Background Image ---------------- */}
        <div
          className={styles.heroBanner}
          style={{ backgroundImage: `url(${craftImage1})` }}
        ></div>

        <div className={styles.container}>
          {/* ---------------- Limited Time Offers ---------------- */}
          <Reveal as="div" className={styles.offersSection} delay={100}>
            <div id="offers-section" className={styles.sectionHeader}>
              <span className={styles.sectionTag}>LIMITED TIME OFFERS</span>
              <h2 className={styles.sectionTitle}>Our Premium Picks</h2>
            </div>

            {/* ---------------- Mobile Filter Toggle Button ---------------- */}
            <button
              type="button"
              className={styles.filterToggle}
              onClick={openFilters}
              aria-expanded={filtersOpen}
            >
              <span className={styles.filterToggleText}>Filter Options</span>
              <span className={styles.filterToggleIcon}>
                <LuSlidersHorizontal />
              </span>
            </button>

            {/* ---------------- Shop Layout - Filter Sidebar + Products ---------------- */}
            <div className={styles.shopLayout}>
              {/* Desktop Filter Sidebar */}
              <aside className={styles.filterSidebar}>
                <h3 className={styles.filterTitle}>Filter</h3>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Category</span>
                  {FILTER_CATEGORIES.map((cat) => (
                    <label key={cat} className={styles.filterOption}>
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(0);
                          setTimeout(scrollToOffers, 100);
                        }}
                      />
                      {cat}
                    </label>
                  ))}
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Sort By</span>
                  {SORT_OPTIONS.map((opt) => (
                    <label key={opt.value} className={styles.filterOption}>
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === opt.value}
                        onChange={() => setSortBy(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Price Range</span>
                  <input
                    type="range"
                    min="0"
                    max="7000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className={styles.filterPriceInput}
                    style={{
                      "--_progress": `${(priceRange[1] / 7000) * 100}%`,
                    }}
                  />
                  <div className={styles.filterPriceRange}>
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                <button
                  className={styles.filterClearBtn}
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </aside>

              {/* Products */}
              <div className={styles.productsWrapper}>
                <div className={styles.productsHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span className={styles.productsCount}>
                      {localLoading
                        ? "Loading..."
                        : `Showing ${sortedProducts.length} of ${total} products`}
                    </span>
                  </div>
                </div>

                {localLoading ? (
                  <div
                    className={styles.productsGrid}
                    aria-busy="true"
                    aria-label="Loading products"
                  >
                    {Array.from({ length: itemsPerPage }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className={styles.productsGrid}>
                      {sortedProducts.map((product, i) => {
                        const inCart = isInCart(product._id);
                        const inWishlist = isInWishlist(product._id);
                        const addingToCart = cartLoadingId === product._id;
                        const discount =
                          product.pricing?.salePrice &&
                          product.pricing?.originalPrice
                            ? Math.round(
                                ((product.pricing.originalPrice -
                                  product.pricing.salePrice) /
                                  product.pricing.originalPrice) *
                                  100,
                              )
                            : 0;
                        return (
                          <Reveal
                            as="div"
                            key={product._id}
                            delay={i * 50}
                            className={styles.productCard}
                          >
                            <Link
                              to={`/product/${product.productSlug}`}
                              className={styles.productImageWrap}
                            >
                              <img
                                className={styles.productImage}
                                src={product.thumbnail?.url}
                                alt={product.productName}
                                loading="lazy"
                              />
                              {discount > 0 && (
                                <span className={styles.productDiscount}>
                                  {discount}% OFF
                                </span>
                              )}
                              <span className={styles.productCategoryOverlay}>
                                {product.category?.categoryData?.label ||
                                  "Uncategorized"}
                              </span>
                              <div className={styles.wishlistActions}>
                                <button
                                  type="button"
                                  className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ""}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleWishlist(product._id);
                                  }}
                                  aria-label={
                                    inWishlist
                                      ? "Remove from wishlist"
                                      : "Add to wishlist"
                                  }
                                >
                                  {inWishlist ? (
                                    <FiHeart fill="currentColor" />
                                  ) : (
                                    <FiHeart />
                                  )}
                                </button>
                              </div>
                            </Link>
                            <div className={styles.productBody}>
                              <Link
                                to={`/product/${product.productSlug}`}
                                className={styles.productName}
                              >
                                {product.productName}
                              </Link>
                              <div className={styles.productPriceRow}>
                                <span className={styles.productCurrentPrice}>
                                  ₹
                                  {(
                                    product.pricing?.salePrice ||
                                    product.pricing?.originalPrice
                                  )?.toLocaleString() || "0"}
                                </span>
                                {product.pricing?.salePrice &&
                                  product.pricing?.originalPrice && (
                                    <span
                                      className={styles.productOriginalPrice}
                                    >
                                      ₹
                                      {product.pricing.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                              <button
                                type="button"
                                className={`${styles.productAddBtn} ${inCart ? styles.productAddBtnActive : ""}`}
                                onClick={() => handleAddToCart(product._id)}
                                disabled={inCart || addingToCart}
                              >
                                {inCart ? (
                                  <>
                                    <FiCheck /> Added to Cart
                                  </>
                                ) : (
                                  <>
                                    <FiShoppingBag />{" "}
                                    {addingToCart ? "Adding..." : "Add to Cart"}
                                  </>
                                )}
                              </button>
                            </div>
                          </Reveal>
                        );
                      })}
                    </div>

                    {/* Pagination - Next/Prev Buttons */}
                    {totalPages > 1 && (
                      <div className={styles.pagination}>
                        <button
                          className={`${styles.paginationBtn} ${currentPage === 0 ? styles.paginationDisabled : ""}`}
                          onClick={prevPage}
                          disabled={currentPage === 0}
                        >
                          <FiChevronLeft /> Prev
                        </button>
                        <span className={styles.paginationInfo}>
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                          className={`${styles.paginationBtn} ${currentPage === totalPages - 1 ? styles.paginationDisabled : ""}`}
                          onClick={nextPage}
                          disabled={currentPage === totalPages - 1}
                        >
                          Next <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Reveal>

          {/* ---------------- Exclusive Premium Offer Banner ---------------- */}
          <Reveal as="div" className={styles.premiumBanner} delay={100}>
            <div className={styles.premiumBannerContent}>
              <span className={styles.premiumTag}>
                EXCLUSIVE PREMIUM OFFER!
              </span>
              <h2>Get up to 30% OFF on selected premium products.</h2>
              <p>Limited time only. Don't miss out!</p>
              <button className={styles.premiumBtn} onClick={scrollToOffers}>
                EXPLORE OFFERS
              </button>
            </div>
            <div className={styles.premiumBadge}>
              <span className={styles.premiumBadgeText}>UP TO</span>
              <span className={styles.premiumBadgeNumber}>30%</span>
              <span className={styles.premiumBadgeText}>OFF</span>
              <button
                className={styles.premiumBadgeBtn}
                onClick={scrollToOffers}
              >
                EXPLORE OFFERS
              </button>
            </div>
          </Reveal>

          {/* ---------------- Bottom Features ---------------- */}
          <Reveal
            as="div"
            className={styles.bottomFeatures}
            delay={100}
            stagger
          >
            {BOTTOM_FEATURES.map((feature, i) => (
              <div key={i} className={styles.bottomFeature}>
                <span className={styles.bottomFeatureIcon}>{feature.icon}</span>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* ---------------- Mobile Bottom Sheet Filter ---------------- */}
        {filtersOpen && (
          <div className={styles.filterOverlay} onClick={closeFilters} />
        )}

        <div
          className={`${styles.mobileFilterSheet} ${
            filtersOpen ? styles.mobileFilterSheetOpen : ""
          }`}
        >
          <div className={styles.mobileFilterSheetHeader}>
            <h3 className={styles.mobileFilterTitle}>Filter</h3>
            <button
              type="button"
              className={styles.mobileFilterClose}
              onClick={closeFilters}
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>

          <div className={styles.mobileFilterInner}>
            {/* Mobile Sort By — Dropdown style */}
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Sort By</span>
              <div className={styles.mobileSortWrapper}>
                <select
                  className={styles.mobileSortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className={styles.mobileSortChevron}>⌄</span>
              </div>
            </div>

            {/* Mobile Category — Two column grid */}
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Category</span>
              <div className={styles.mobileFilterGrid}>
                {FILTER_CATEGORIES.map((cat) => (
                  <label key={cat} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_category"
                      checked={selectedCategory === cat}
                      onChange={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(0);
                      }}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Price Range</span>
              <input
                type="range"
                min="0"
                max="7000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className={styles.filterPriceInput}
                style={{ "--_progress": `${(priceRange[1] / 7000) * 100}%` }}
              />
              <div className={styles.filterPriceRange}>
                <span>₹0</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <button
              className={styles.mobileFilterApply}
              onClick={() => {
                closeFilters();
                setTimeout(scrollToOffers, 100);
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}