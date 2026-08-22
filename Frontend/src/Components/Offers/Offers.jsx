// src/Components/Offers/Offers.jsx

import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
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
  FiChevronDown,
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

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

/* ----------------------------------------------------------------
   Data
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

// ✅ REMOVED hardcoded FILTER_CATEGORIES — same bug as Collections.jsx:
// it sent the LABEL as categoryId, which never matches a real category
// id, so every non-"All" filter silently returned zero products.
// Categories are now fetched live below, same endpoint Shop.jsx uses.

const SORT_OPTIONS = [
  { value: "newest", label: "Default Sorting" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "discount-desc", label: "Discount: High to Low" },
];

const ITEMS_PER_BATCH = 10;

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
   Reveal-on-scroll
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
        if (entry.isIntersecting) setVisible(true);
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

/* ----------------------------------------------------------------
   Main Component
------------------------------------------------------------------- */
export default function Offers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filterSlug } = useParams();
  const { byPlacement } = useSelector((state) => state.storefrontProduct);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const offersData = byPlacement.offers || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  // ✅ NEW: real, seller-panel-controlled categories (same source as Shop)
  const [categories, setCategories] = useState([]);

  // ✅ HONEST HANDLING of offersDropdown slugs (flash-sale, combo-edit,
  // refer-and-earn, loyalty-rewards, first-order-privilege, seasonal-edit,
  // corporate-gifting): unlike "collection" (specifications.collection)
  // or "occasion" (specifications.occasion), there is currently no
  // product-level field these correspond to — they're marketing
  // programs, not a product attribute. Faking a filter here would
  // silently show wrong/empty results and look "dynamic" without being
  // truthful, which is exactly what you asked me not to ship. Instead:
  // the route resolves (no more homepage redirect), the page renders
  // normally, and the slug is only used for a heading — not a filter —
  // until a real backend concept for offer programs exists.
  const offerLabelFromSlug = filterSlug
    ? filterSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cartLoadingId, setCartLoadingId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [localLoading, setLocalLoading] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const itemsPerPage = 9;

  // ── Infinite scroll state ──
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // ── Drag-to-close state ──
  const sheetRef = useRef(null);
  const dragState = useRef({
    active: false,
    startY: 0,
    currentY: 0,
    isDragging: false,
  });

  const products = offersData.products || [];
  const { total, totalPages } = offersData.pagination || {
    total: 0,
    totalPages: 1,
  };

  const visibleProducts = products.slice(0, visibleCount);

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
    return option ? option.label : "Default Sorting";
  };

  // ✅ NEW: fetch real categories
  useEffect(() => {
    axios
      .get(`${API_BASE}/seller/products/categories`)
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      });
  }, []);

  // Throttled fetch — minimum 1000 ms skeleton
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

  // Reset visible count when products change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  const sortedProducts = useMemo(() => {
    const list = [...visibleProducts];
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
  }, [visibleProducts, sortBy]);

  // ── Infinite Scroll via IntersectionObserver ──
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingMore &&
          visibleCount < products.length
        ) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) =>
              Math.min(prev + ITEMS_PER_BATCH, products.length),
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, products.length, isLoadingMore]);

  const scrollToOffers = () => {
    const el = document.getElementById("offers-section");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: "smooth" });
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

    // Reset sheet position
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = "";
      sheet.style.transition = "";
    }

    if (scrollY) window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
  };

  // ── Drag-to-close sheet handlers ──
  const getDragY = (e) => {
    if (e.touches) return e.touches[0].clientY;
    return e.clientY;
  };

  const onDragStart = useCallback((e) => {
    // Only drag from the handle or header area
    const target = e.target;
    const isHandle =
      target.classList.contains(styles.mobileFilterHandle) ||
      target.closest(`.${styles.mobileFilterSheetHeader}`);

    if (!isHandle) return;

    dragState.current = {
      active: true,
      startY: getDragY(e),
      currentY: getDragY(e),
      isDragging: false,
    };

    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transition = "none";
    }
  }, []);

  const onDragMove = useCallback((e) => {
    if (!dragState.current.active) return;

    const y = getDragY(e);
    const deltaY = y - dragState.current.startY;

    if (Math.abs(deltaY) > 5) {
      dragState.current.isDragging = true;
    }

    if (!dragState.current.isDragging) return;

    dragState.current.currentY = y;

    // Only allow dragging downward
    const translateY = Math.max(0, deltaY);
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = `translateY(${translateY}px)`;
    }

    if (e.cancelable) e.preventDefault();
  }, []);

  const onDragEnd = useCallback(() => {
    if (!dragState.current.active) return;

    const deltaY = dragState.current.currentY - dragState.current.startY;
    const sheet = sheetRef.current;

    if (sheet) {
      sheet.style.transition = "";
    }

    // Close if dragged down more than 80px
    if (dragState.current.isDragging && deltaY > 80) {
      closeFilters();
    } else {
      // Snap back
      if (sheet) {
        sheet.style.transform = "";
      }
    }

    dragState.current = {
      active: false,
      startY: 0,
      currentY: 0,
      isDragging: false,
    };
  }, []);

  // Attach drag listeners to the sheet
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    // Touch events
    sheet.addEventListener("touchstart", onDragStart, { passive: true });
    sheet.addEventListener("touchmove", onDragMove, { passive: false });
    sheet.addEventListener("touchend", onDragEnd, { passive: true });

    // Mouse events
    sheet.addEventListener("mousedown", onDragStart);
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);

    return () => {
      sheet.removeEventListener("touchstart", onDragStart);
      sheet.removeEventListener("touchmove", onDragMove);
      sheet.removeEventListener("touchend", onDragEnd);
      sheet.removeEventListener("mousedown", onDragStart);
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragEnd);
    };
  }, [onDragStart, onDragMove, onDragEnd]);

  return (
    <>
      <Header />
      <section className={styles.offers} aria-label="Aurevian Exclusive Offers">
        <div
          className={styles.heroBanner}
          style={{ backgroundImage: `url(${craftImage1})` }}
        />

        <div className={styles.container}>
          <Reveal as="div" className={styles.offersSection} delay={100}>
            <div id="offers-section" className={styles.sectionHeader}>
              <span className={styles.sectionTag}>LIMITED TIME OFFERS</span>
              <h2 className={styles.sectionTitle}>
                {offerLabelFromSlug || "Our Premium Picks"}
              </h2>
              {offerLabelFromSlug && (
                <p className={styles.sectionSubtitle}>
                  Browsing all current offers — dedicated filtering for "
                  {offerLabelFromSlug}" is coming soon.
                </p>
              )}
            </div>

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

            <div className={styles.shopLayout}>
              {/* Desktop Sidebar */}
              <aside className={styles.filterSidebar}>
                <h3 className={styles.filterTitle}>Filter</h3>

                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Category</span>
                  <label className={styles.filterOption}>
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === "All"}
                      onChange={() => {
                        setSelectedCategory("All");
                        setCurrentPage(0);
                        setTimeout(scrollToOffers, 100);
                      }}
                    />
                    All
                  </label>
                  {categories.length === 0 ? (
                    <span className={styles.filterEmptyNote}>
                      No categories configured yet
                    </span>
                  ) : (
                    categories.map((c) => (
                      <label key={c.id} className={styles.filterOption}>
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === c.id}
                          onChange={() => {
                            setSelectedCategory(c.id);
                            setCurrentPage(0);
                            setTimeout(scrollToOffers, 100);
                          }}
                        />
                        {c.label}
                      </label>
                    ))
                  )}
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
                        : `Showing ${Math.min(visibleCount, products.length)} of ${total} products`}
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
                                  className={`${styles.wishlistBtn} ${
                                    inWishlist ? styles.wishlistBtnActive : ""
                                  }`}
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
                                className={`${styles.productAddBtn} ${
                                  inCart ? styles.productAddBtnActive : ""
                                }`}
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

                    {/* ── Infinite Scroll Sentinel ── */}
                    {!localLoading && (
                      <div ref={sentinelRef} className={styles.sentinel}>
                        {isLoadingMore && (
                          <div className={styles.skeletonLoadMoreGrid}>
                            {Array.from({ length: 4 }).map((_, i) => (
                              <SkeletonCard key={i} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pagination (fallback) */}
                    {!localLoading &&
                      totalPages > 1 &&
                      visibleCount >= products.length && (
                        <div className={styles.pagination}>
                          <button
                            className={`${styles.paginationBtn} ${
                              currentPage === 0 ? styles.paginationDisabled : ""
                            }`}
                            onClick={() => {
                              if (currentPage > 0) {
                                setCurrentPage((p) => p - 1);
                                setTimeout(scrollToOffers, 100);
                              }
                            }}
                            disabled={currentPage === 0}
                          >
                            <FiChevronLeft /> Prev
                          </button>
                          <span className={styles.paginationInfo}>
                            Page {currentPage + 1} of {totalPages}
                          </span>
                          <button
                            className={`${styles.paginationBtn} ${
                              currentPage === totalPages - 1
                                ? styles.paginationDisabled
                                : ""
                            }`}
                            onClick={() => {
                              if (currentPage < totalPages - 1) {
                                setCurrentPage((p) => p + 1);
                                setTimeout(scrollToOffers, 100);
                              }
                            }}
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

          {/* Premium Banner */}
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

          {/* Bottom Features */}
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

        {/* Mobile Filter Overlay */}
        {filtersOpen && (
          <div className={styles.filterOverlay} onClick={closeFilters} />
        )}

        {/* Mobile Filter Sheet */}
        <div
          ref={sheetRef}
          className={`${styles.mobileFilterSheet} ${
            filtersOpen ? styles.mobileFilterSheetOpen : ""
          }`}
        >
          {/* Drag handle */}
          <div className={styles.mobileFilterHandle} />

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
            {/* Mobile Sort By — Custom Dropdown */}
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Sort By</span>
              <div className={styles.mobileSortWrapper}>
                <button
                  className={styles.mobileSortButton}
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  aria-expanded={isSortDropdownOpen}
                >
                  <span>{getSortLabel()}</span>
                  <FiChevronDown
                    className={`${styles.mobileSortChevron} ${isSortDropdownOpen ? styles.mobileSortChevronOpen : ""}`}
                  />
                </button>

                {isSortDropdownOpen && (
                  <div className={styles.mobileSortDropdown}>
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.mobileSortOption} ${sortBy === option.value ? styles.mobileSortOptionActive : ""}`}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Category — Two column grid with real categories */}
            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Category</span>
              <div className={styles.mobileFilterGrid}>
                <label className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_category"
                    checked={selectedCategory === "All"}
                    onChange={() => {
                      setSelectedCategory("All");
                      setCurrentPage(0);
                    }}
                  />
                  All
                </label>
                {categories.length === 0 ? (
                  <span className={styles.filterEmptyNote}>
                    No categories configured yet
                  </span>
                ) : (
                  categories.map((c) => (
                    <label key={c.id} className={styles.mobileFilterOption}>
                      <input
                        type="radio"
                        name="mobile_category"
                        checked={selectedCategory === c.id}
                        onChange={() => {
                          setSelectedCategory(c.id);
                          setCurrentPage(0);
                        }}
                      />
                      {c.label}
                    </label>
                  ))
                )}
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
