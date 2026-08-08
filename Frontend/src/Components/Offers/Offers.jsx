// src/Components/Offers/Offers.jsx

import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiTrendingUp,
  FiGift,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiCheck,
  FiFilter,
} from "react-icons/fi";
import { LuSlidersHorizontal } from "react-icons/lu";
import styles from "./Offers.module.css";
import craftImage1 from "../../assets/offersimg.png";
import Footer from "../../Pages/Layout/Footer/Footer.jsx";
import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";

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
const FILTER_MATERIALS = ["All", "Gold", "Silver", "Rose Gold", "Platinum"];
const FILTER_SIZES = ["All", "Small", "Medium", "Large"];

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
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const offersData = byPlacement.offers || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const itemsPerPage = 9;

  const products = offersData.products || [];
  const { total, totalPages } = offersData.pagination || {
    total: 0,
    totalPages: 1,
  };

  // Fetch products when filters change
  useEffect(() => {
    dispatch(
      fetchProductsByPlacement({
        placement: "offers",
        page: currentPage + 1,
        limit: itemsPerPage,
        categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
      }),
    );
  }, [dispatch, currentPage, selectedCategory]);

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

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleAddToCart = (productId) => {
    setCartItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setPriceRange([0, 7000]);
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
      <section className={styles.offers} aria-label="Aurevian Exclusive Offers">
        {/* ---------------- Hero Banner with Background Image ---------------- */}
        <div
          className={styles.heroBanner}
          style={{ backgroundImage: `url(${craftImage1})` }}
        >
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <span className={styles.heroTag}>EXCLUSIVE OFFERS</span>
              <h1 className={styles.heroTitle}>
                Premium Choices,
                <br />
                <span>Just For You</span>
              </h1>
              <p className={styles.heroDescription}>
                Explore handpicked luxury pieces at special prices for a limited
                time.
              </p>
              <button className={styles.heroBtn} onClick={scrollToOffers}>
                SHOP OFFERS →
              </button>
            </div>
          </div>
        </div>

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
                      {isLoading
                        ? "Loading..."
                        : `Showing ${products.length} of ${total} products`}
                    </span>
                  </div>
                </div>

                <div className={styles.productsGrid}>
                  {products.map((product, i) => {
                    const isInCart = cartItems.includes(product._id);
                    const isInWishlist = wishlist.includes(product._id);
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
                              className={`${styles.wishlistBtn} ${isInWishlist ? styles.wishlistBtnActive : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product._id);
                              }}
                              aria-label={
                                isInWishlist
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {isInWishlist ? (
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
                                <span className={styles.productOriginalPrice}>
                                  ₹
                                  {product.pricing.originalPrice.toLocaleString()}
                                </span>
                              )}
                          </div>
                          <button
                            type="button"
                            className={`${styles.productAddBtn} ${isInCart ? styles.productAddBtnActive : ""}`}
                            onClick={() => handleAddToCart(product._id)}
                            disabled={isInCart}
                          >
                            {isInCart ? (
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
                EXPLORE OFFERS →
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
            <h3 className={styles.mobileFilterTitle}>Filter Options</h3>
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
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Category</span>
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
