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
import { FaHeart } from "react-icons/fa";
import { LuSlidersHorizontal } from "react-icons/lu";
import styles from "./Offers.module.css";
import craftImage1 from "../../assets/offersbanner.png";
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

const SORT_OPTIONS = [
  { value: "newest", label: "Default Sorting" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "discount-desc", label: "Discount: High to Low" },
];

const ITEMS_PER_BATCH = 10;

// Helper function to generate slug from label
const generateSlugFromLabel = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* ----------------------------------------------------------------
   Skeleton Card - Matching Shop component
------------------------------------------------------------------- */
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
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
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [sortBy, setSortBy] = useState("newest");
  const [cartLoadingId, setCartLoadingId] = useState(null);

  // Infinite scroll state - like Shop component
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoryError, setCategoryError] = useState(null);
  const loaderRef = useRef(null);

  // Mobile filter sheet
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const sheetRef = useRef(null);
  const dragState = useRef({ startY: 0, currentY: 0 });
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);

  // Mobile sort dropdown
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Desktop sidebar sort dropdown
  const [isSidebarSortOpen, setIsSidebarSortOpen] = useState(false);
  const sidebarSortRef = useRef(null);

  const offerLabelFromSlug = filterSlug
    ? filterSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  // Fetch categories
  useEffect(() => {
    axios
      .get(`${API_BASE}/seller/products/categories`)
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      });
  }, []);

  // Fetch products with infinite scroll - like Shop
  useEffect(() => {
    const load = async () => {
      const isFirst = page === 1;
      if (isFirst) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const start = Date.now();
      try {
        setCategoryError(null);
        const result = await dispatch(
          fetchProductsByPlacement({
            placement: "offers",
            page,
            limit: 10,
            categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
            sort: sortBy || undefined,
          }),
        ).unwrap();

        const fetched = result.products || [];
        setAllProducts((prev) => (isFirst ? fetched : [...prev, ...fetched]));
        setHasMore(page < (result.pagination?.totalPages || 1));
      } catch (err) {
        console.error(err);
        setCategoryError("Failed to load products. Please try again.");
        toast.error("Failed to load products");
      } finally {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          if (isFirst) setIsInitialLoading(false);
          else setIsLoadingMore(false);
        }, remaining);
      }
    };

    load();
  }, [page, refreshKey, dispatch, selectedCategory, sortBy]);

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    setRefreshKey((k) => k + 1);
  }, [selectedCategory, sortBy]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current || !hasMore || isLoadingMore || isInitialLoading)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isInitialLoading
        ) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isInitialLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Close mobile sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close desktop sidebar sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarSortRef.current &&
        !sidebarSortRef.current.contains(event.target)
      ) {
        setIsSidebarSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drag to close sheet
  useEffect(() => {
    if (!isDraggingSheet) return;

    const onMove = (e) => {
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      const delta = clientY - dragState.current.startY;
      if (delta < 0) return;
      dragState.current.currentY = delta;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${delta}px)`;
      }
    };

    const onUp = () => {
      setIsDraggingSheet(false);
      const delta = dragState.current.currentY;
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 0.35s ease";
        if (delta > 100) {
          sheetRef.current.style.transform = "translateY(100%)";
          setTimeout(() => {
            closeMobileFilter();
            if (sheetRef.current) {
              sheetRef.current.style.transform = "";
              sheetRef.current.style.transition = "";
            }
          }, 350);
        } else {
          sheetRef.current.style.transform = "translateY(0)";
          setTimeout(() => {
            if (sheetRef.current) {
              sheetRef.current.style.transform = "";
              sheetRef.current.style.transition = "";
            }
          }, 350);
        }
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [isDraggingSheet]);

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
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    setRefreshKey((k) => k + 1);
  };

  const openMobileFilter = () => {
    setIsMobileFilterOpen(true);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${window.scrollY}px`;
  };

  const closeMobileFilter = () => {
    const scrollY = document.body.style.top;
    setIsMobileFilterOpen(false);
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    }
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sortBy);
    return option ? option.label : "Default Sorting";
  };

  const skeletonItems = Array.from({ length: 10 }, (_, i) => i);

  // Get the category name for display
  const getCategoryName = () => {
    if (!selectedCategory || selectedCategory === "All") return "All Products";
    const category = categories.find((c) => c.id === selectedCategory);
    return category ? category.label : "Category";
  };

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

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              className={styles.filterToggle}
              onClick={openMobileFilter}
              aria-expanded={isMobileFilterOpen}
            >
              <span className={styles.filterToggleText}>Filter Options</span>
              <span className={styles.filterToggleIcon}>
                <LuSlidersHorizontal />
              </span>
            </button>

            <div className={styles.shopLayout}>
              {/* Desktop Filter Sidebar */}
              <aside className={styles.filterSidebar}>
                <h3 className={styles.filterTitle}>Filter</h3>

                {/* Sort By — Desktop Sidebar */}
                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Sort By</span>
                  <div className={styles.sidebarSortWrapper} ref={sidebarSortRef}>
                    <button
                      className={styles.sidebarSortButton}
                      onClick={() => setIsSidebarSortOpen(!isSidebarSortOpen)}
                      aria-expanded={isSidebarSortOpen}
                    >
                      <span>{getSortLabel()}</span>
                      <FiChevronDown
                        className={`${styles.sidebarSortChevron} ${
                          isSidebarSortOpen ? styles.sidebarSortChevronOpen : ""
                        }`}
                      />
                    </button>
                    {isSidebarSortOpen && (
                      <div className={styles.sidebarSortDropdown}>
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            className={`${styles.sidebarSortOption} ${
                              sortBy === option.value
                                ? styles.sidebarSortOptionActive
                                : ""
                            }`}
                            onClick={() => {
                              setSortBy(option.value);
                              setIsSidebarSortOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className={styles.filterGroup}>
                  <span className={styles.filterGroupLabel}>Category</span>
                  <label className={styles.filterOption}>
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === "All"}
                      onChange={() => setSelectedCategory("All")}
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
                          onChange={() => setSelectedCategory(c.id)}
                        />
                        {c.label}
                      </label>
                    ))
                  )}
                </div>

                {/* Price Range */}
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
                  <span className={styles.productsCount}>
                    {isInitialLoading
                      ? "Loading..."
                      : `Showing ${allProducts.length} results for ${getCategoryName()}`}
                  </span>
                </div>

                {/* Skeleton Loading */}
                {isInitialLoading && (
                  <div className={styles.skeletonGrid}>
                    {skeletonItems.map((i) => (
                      <div className={styles.skeletonCard} key={i}>
                        <div className={styles.skeletonImage} />
                        <div className={styles.skeletonText} />
                        <div
                          className={`${styles.skeletonText} ${styles.skeletonTextShort}`}
                        />
                        <div className={styles.skeletonBtn} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error State */}
                {categoryError && !isInitialLoading && (
                  <div className={styles.errorState}>
                    <div className={styles.errorStateIcon}>⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>{categoryError}</p>
                    <button
                      className={styles.errorStateButton}
                      onClick={() => setRefreshKey((k) => k + 1)}
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Products */}
                {!isInitialLoading && !categoryError && (
                  <>
                    {allProducts.length === 0 && (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>🛍️</div>
                        <h3>No Products Available</h3>
                        <p>
                          We're currently updating our offers. Please check back
                          later!
                        </p>
                      </div>
                    )}

                    {allProducts.length > 0 && (
                      <div className={styles.productsGrid}>
                        {allProducts.map((p) => {
                          const inCart = isInCart(p._id);
                          const inWishlist = isInWishlist(p._id);
                          const addingToCart = cartLoadingId === p._id;
                          const discount =
                            p.pricing?.salePrice &&
                            p.pricing?.originalPrice
                              ? Math.round(
                                  ((p.pricing.originalPrice -
                                    p.pricing.salePrice) /
                                    p.pricing.originalPrice) *
                                    100,
                                )
                              : 0;

                          return (
                            <div className={styles.productCard} key={p._id}>
                              <Link
                                to={`/product/${p.productSlug}`}
                                className={styles.productImageWrap}
                              >
                                <img
                                  className={styles.productImage}
                                  src={p.thumbnail?.url}
                                  alt={p.productName}
                                  loading="lazy"
                                />
                                {discount > 0 && (
                                  <span className={styles.productDiscount}>
                                    {discount}% off
                                  </span>
                                )}
                                <span className={styles.productCategoryOverlay}>
                                  {p.category?.categoryData?.label ||
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
                                      toggleWishlist(p._id);
                                    }}
                                    aria-label={
                                      inWishlist
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                    }
                                  >
                                    {inWishlist ? (
                                      <FaHeart />
                                    ) : (
                                      <FiHeart />
                                    )}
                                  </button>
                                </div>
                              </Link>
                              <div className={styles.productBody}>
                                <Link
                                  to={`/product/${p.productSlug}`}
                                  className={styles.productName}
                                  title={p.productName}
                                >
                                  {p.productName}
                                </Link>
                                <div className={styles.productPriceRow}>
                                  <span className={styles.productCurrentPrice}>
                                    ₹
                                    {(
                                      p.pricing?.salePrice ||
                                      p.pricing?.originalPrice
                                    )?.toLocaleString() || "0"}
                                  </span>
                                  {p.pricing?.salePrice &&
                                    p.pricing?.originalPrice && (
                                      <span
                                        className={styles.productOriginalPrice}
                                      >
                                        ₹
                                        {p.pricing.originalPrice.toLocaleString()}
                                      </span>
                                    )}
                                </div>
                                <button
                                  type="button"
                                  className={`${styles.productAddBtn} ${
                                    inCart ? styles.productAddBtnActive : ""
                                  }`}
                                  onClick={() => handleAddToCart(p._id)}
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
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Infinite scroll loader */}
                {!isInitialLoading && !categoryError && hasMore && (
                  <div ref={loaderRef} className={styles.infiniteLoader}>
                    {isLoadingMore && (
                      <div className={styles.skeletonGrid}>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div className={styles.skeletonCard} key={`more-${i}`}>
                            <div className={styles.skeletonImage} />
                            <div className={styles.skeletonText} />
                            <div
                              className={`${styles.skeletonText} ${styles.skeletonTextShort}`}
                            />
                            <div className={styles.skeletonBtn} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isInitialLoading && !hasMore && allProducts.length > 0 && (
                  <div className={styles.endMessage}>No more products</div>
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
        {isMobileFilterOpen && (
          <div className={styles.filterOverlay} onClick={closeMobileFilter} />
        )}

        {/* Mobile Filter Sheet */}
        <div
          ref={sheetRef}
          className={`${styles.mobileFilterSheet} ${
            isMobileFilterOpen ? styles.mobileFilterSheetOpen : ""
          }`}
        >
          <div
            className={styles.mobileFilterHandle}
            onMouseDown={(e) => {
              dragState.current.startY = e.clientY;
              dragState.current.currentY = 0;
              setIsDraggingSheet(true);
            }}
            onTouchStart={(e) => {
              dragState.current.startY = e.touches[0].clientY;
              dragState.current.currentY = 0;
              setIsDraggingSheet(true);
            }}
          />

          <div className={styles.mobileFilterSheetHeader}>
            <h3 className={styles.mobileFilterTitle}>Filter</h3>
            <button
              type="button"
              className={styles.mobileFilterClose}
              onClick={closeMobileFilter}
            >
              ✕
            </button>
          </div>

          <div className={styles.mobileFilterInner}>
            {/* Sort By */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Sort By</span>
              <div className={styles.mobileSortWrapper} ref={sortDropdownRef}>
                <button
                  className={styles.mobileSortButton}
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  aria-expanded={isSortDropdownOpen}
                >
                  <span>{getSortLabel()}</span>
                  <FiChevronDown
                    className={`${styles.mobileSortChevron} ${
                      isSortDropdownOpen ? styles.mobileSortChevronOpen : ""
                    }`}
                  />
                </button>
                {isSortDropdownOpen && (
                  <div className={styles.mobileSortDropdown}>
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.mobileSortOption} ${
                          sortBy === option.value
                            ? styles.mobileSortOptionActive
                            : ""
                        }`}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Category</span>
              <div className={styles.mobileFilterGrid}>
                <label className={styles.mobileFilterOption}>
                  <input
                    type="radio"
                    name="mobile_category"
                    checked={selectedCategory === "All"}
                    onChange={() => setSelectedCategory("All")}
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
                        onChange={() => setSelectedCategory(c.id)}
                      />
                      {c.label}
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Price Range</span>
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

            <button className={styles.filterClearBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>
            <button
              className={styles.mobileFilterApply}
              onClick={closeMobileFilter}
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