// src/Components/Shop/Earrings.jsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
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
  FiChevronDown,
  FiStar,
  FiShield,
  FiTruck,
  FiAward,
  FiClock,
} from "react-icons/fi";
import { LuSlidersHorizontal } from "react-icons/lu";
// Use icons that actually exist
import { BsGem } from "react-icons/bs";
import { IoSparkles, IoDiamond } from "react-icons/io5";
import styles from "./Earrings.module.css";
import craftImage1 from "../../assets/Earringsbanner.png";
import Footer from "../../Pages/Layout/Footer/Footer.jsx";
import Header from "../../Pages/Layout/Header/Header.jsx";
import { fetchProductsByPlacement } from "../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";

/* ----------------------------------------------------------------
   Data
------------------------------------------------------------------- */

const COLLECTION_TYPES = [
  { 
    icon: <BsGem />, 
    label: "Gold Earring",
    description: "Timeless elegance",
    link: "/shop?category=earrings"
  },
  { 
    icon: <IoDiamond />, 
    label: "Diamond Ring",
    description: "Forever brilliance",
    link: "/shop?category=rings"
  },
  { 
    icon: <IoSparkles />, 
    label: "Necklace",
    description: "Graceful statements",
    link: "/shop?category=necklaces"
  },
];

const FILTER_CATEGORIES = [
  "All",
  "Studs",
  "Hoops",
  "Danglers",
  "Chandelier",
  "Ear Cuffs",
];

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
export default function Earrings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { byPlacement } = useSelector((state) => state.storefrontProduct);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const earringsData = byPlacement.earrings || {
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

  const products = earringsData.products || [];
  const { total, totalPages } = earringsData.pagination || {
    total: 0,
    totalPages: 1,
  };

  const visibleProducts = products.slice(0, visibleCount);

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
    return option ? option.label : "Default Sorting";
  };

  // Throttled fetch — minimum 1000 ms skeleton
  useEffect(() => {
    setLocalLoading(true);
    const start = Date.now();
    let timeoutId;

    dispatch(
      fetchProductsByPlacement({
        placement: "earrings",
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
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < products.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + ITEMS_PER_BATCH, products.length));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, products.length, isLoadingMore]);

  const scrollToEarrings = () => {
    const el = document.getElementById("earrings-section");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/earrings" } });
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

    if (dragState.current.isDragging && deltaY > 80) {
      closeFilters();
    } else {
      if (sheet) {
        sheet.style.transform = "";
      }
    }

    dragState.current = { active: false, startY: 0, currentY: 0, isDragging: false };
  }, []);

  // Attach drag listeners to the sheet
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    sheet.addEventListener("touchstart", onDragStart, { passive: true });
    sheet.addEventListener("touchmove", onDragMove, { passive: false });
    sheet.addEventListener("touchend", onDragEnd, { passive: true });

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
      <section className={styles.earrings} aria-label="Aurevian Earrings Collection">
        <div
          className={styles.heroBanner}
          style={{ backgroundImage: `url(${craftImage1})` }}
        />

        <div className={styles.container}>
          <Reveal as="div" className={styles.earringsSection} delay={100}>
            <div id="earrings-section" className={styles.sectionHeader}>
              <span className={styles.sectionTag}>EARRINGS COLLECTION</span>
              <h2 className={styles.sectionTitle}>Our Premium Earrings</h2>
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
              {/* Desktop Sidebar - Sticky */}
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
                          setTimeout(scrollToEarrings, 100);
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
                    onChange={(e) =>
                      setPriceRange([0, Number(e.target.value)])
                    }
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

                        const rating = product.rating || 4.5;
                        const fullStars = Math.floor(rating);
                        const hasHalfStar = rating - fullStars >= 0.5;

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
                                  "Earrings"}
                              </span>
                              <div className={styles.wishlistActions}>
                                <button
                                  type="button"
                                  className={`${styles.wishlistBtn} ${
                                    inWishlist
                                      ? styles.wishlistBtnActive
                                      : ""
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

                              <div className={styles.productRating}>
                                <div className={styles.stars}>
                                  {[...Array(5)].map((_, i) => {
                                    if (i < fullStars) {
                                      return <FiStar key={i} className={styles.starFilled} />;
                                    } else if (i === fullStars && hasHalfStar) {
                                      return <FiStar key={i} className={styles.starHalf} />;
                                    } else {
                                      return <FiStar key={i} className={styles.starEmpty} />;
                                    }
                                  })}
                                </div>
                                <span className={styles.ratingValue}>{rating}</span>
                                <span className={styles.reviewCount}>
                                  ({product.reviews || 0})
                                </span>
                              </div>

                              <div className={styles.productPriceRow}>
                                <span
                                  className={styles.productCurrentPrice}
                                >
                                  ₹
                                  {(
                                    product.pricing?.salePrice ||
                                    product.pricing?.originalPrice
                                  )?.toLocaleString() || "0"}
                                </span>
                                {product.pricing?.salePrice &&
                                  product.pricing?.originalPrice && (
                                    <span
                                      className={
                                        styles.productOriginalPrice
                                      }
                                    >
                                      ₹
                                      {product.pricing.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                              <button
                                type="button"
                                className={`${styles.productAddBtn} ${
                                  inCart
                                    ? styles.productAddBtnActive
                                    : ""
                                }`}
                                onClick={() =>
                                  handleAddToCart(product._id)
                                }
                                disabled={inCart || addingToCart}
                              >
                                {inCart ? (
                                  <>
                                    <FiCheck /> Added to Cart
                                  </>
                                ) : (
                                  <>
                                    <FiShoppingBag />{" "}
                                    {addingToCart
                                      ? "Adding..."
                                      : "Add to Cart"}
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
                    {!localLoading && totalPages > 1 && visibleCount >= products.length && (
                      <div className={styles.pagination}>
                        <button
                          className={`${styles.paginationBtn} ${
                            currentPage === 0
                              ? styles.paginationDisabled
                              : ""
                          }`}
                          onClick={() => {
                            if (currentPage > 0) {
                              setCurrentPage((p) => p - 1);
                              setTimeout(scrollToEarrings, 100);
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
                              setTimeout(scrollToEarrings, 100);
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

          {/* Our Luxury Collections - Full width shimmer section */}
          <div className={styles.luxuryCollectionSection}>
            <div className={styles.luxuryCollectionContent}>
              <div className={styles.luxuryCollectionHeader}>
                <span className={styles.luxuryTag}>Shimmer</span>
                <h2 className={styles.luxuryTitle}>
                  Our Luxury 
                  <span className={styles.luxuryHighlight}> Collections</span>
                </h2>
                <p className={styles.luxurySubtitle}>
                  The Art of Radiant Refinement
                </p>
              </div>

              <div className={styles.luxuryStats}>
                <div className={styles.luxuryStat}>
                  <span className={styles.luxuryStatNumber}>230K</span>
                  <span className={styles.luxuryStatLabel}>Free Shipping</span>
                </div>
                <div className={styles.luxuryStat}>
                  <span className={styles.luxuryStatNumber}>7</span>
                  <span className={styles.luxuryStatLabel}>Years of Excellence</span>
                </div>
              </div>

              <div className={styles.luxuryTypes}>
                <span className={styles.luxuryTypesLabel}>Choose The Type!</span>
                <div className={styles.luxuryTypeGrid}>
                  {COLLECTION_TYPES.map((type, index) => (
                    <Link to={type.link} key={index} className={styles.luxuryTypeCard}>
                      <span className={styles.luxuryTypeIcon}>{type.icon}</span>
                      <span className={styles.luxuryTypeLabel}>{type.label}</span>
                      <span className={styles.luxuryTypeDesc}>{type.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
                  <FiChevronDown className={`${styles.mobileSortChevron} ${isSortDropdownOpen ? styles.mobileSortChevronOpen : ""}`} />
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
                onChange={(e) =>
                  setPriceRange([0, Number(e.target.value)])
                }
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
                setTimeout(scrollToEarrings, 100);
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