// src/Pages/Gifts/Gifts.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
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
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const jewelHighlights = [
  ["Brilliant Cut Quality", "Natural Color Grade"],
  ["High Clarity Rating", "Precise Carat Weight"],
  ["Elegant Setting Style", "Durable Metal Choice"],
];

const OCCASION_OPTIONS = [
  "All",
  "Wedding",
  "Engagement",
  "Anniversary",
  "Birthday",
  "Casual",
  "Party",
  "Festive",
  "Professional",
  "Gift",
  "Daily Wear",
  "Valentine",
  "Mother's Day",
  "Graduation",
];

const FILTER_RECIPIENTS = ["All", "For Her", "For Him", "For Kids"];
const RECIPIENT_TO_GENDER = {
  "For Her": "Women",
  "For Him": "Men",
  "For Kids": "Kids",
};

const FILTER_BUDGETS = [
  "All",
  "Under ₹1,000",
  "₹1,000 – ₹3,000",
  "₹3,000 – ₹6,000",
  "Above ₹6,000",
];

const FILTER_AVAILABILITY = ["All", "In Stock", "Out of Stock"];

const SORT_OPTIONS = [
  { value: "latest", label: "Sort by latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
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

/* ─── Skeleton Card ─── */
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

export default function Gifts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filterSlug } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const initialOccasion = filterSlug
    ? OCCASION_OPTIONS.find(
        (o) => o.toLowerCase().replace(/[^a-z0-9]+/g, "-") === filterSlug,
      ) || "All"
    : "All";
  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [selectedRecipient, setSelectedRecipient] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 8000]);
  const [sortBy, setSortBy] = useState("latest");
  const [cartLoadingId, setCartLoadingId] = useState(null);

  // Infinite scroll state - like Shop
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

  // Keep occasion in sync with URL
  useEffect(() => {
    if (!filterSlug) return;
    const match = OCCASION_OPTIONS.find(
      (o) => o.toLowerCase().replace(/[^a-z0-9]+/g, "-") === filterSlug,
    );
    if (match) setSelectedOccasion(match);
  }, [filterSlug]);

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
            placement: "gifts",
            page,
            limit: 10,
            categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
            occasion: selectedOccasion !== "All" ? selectedOccasion : undefined,
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
  }, [page, refreshKey, dispatch, selectedCategory, selectedOccasion, sortBy]);

  // Reset on filter change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    setRefreshKey((k) => k + 1);
  }, [selectedCategory, selectedOccasion, sortBy]);

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
    if (isAuthenticated) dispatch(fetchWishlist());
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

  const requireAuth = () => {
    if (!isAuthenticated) {
      toast.error("Please login to continue");
      navigate("/login", { state: { from: "/gifts" } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const toggleWishlist = (id) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(id)).catch(() => {});
  };

  const addToCart = async (id) => {
    if (!requireAuth()) return;
    try {
      setCartLoadingId(id);
      await dispatch(addItemToCart({ productId: id, quantity: 1 })).unwrap();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setCartLoadingId(null);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedOccasion("All");
    setSelectedRecipient("All");
    setSelectedBudget("All");
    setSelectedAvailability("All");
    setPriceRange([0, 8000]);
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    setRefreshKey((k) => k + 1);
    if (filterSlug) navigate("/gifts");
  };

  const clientFilteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedRecipient !== "All") {
        const wantGender = RECIPIENT_TO_GENDER[selectedRecipient];
        if (wantGender && p.specifications?.gender !== wantGender) {
          return false;
        }
      }
      if (selectedBudget !== "All") {
        const price = p.pricing?.salePrice || p.pricing?.originalPrice || 0;
        if (selectedBudget === "Under ₹1,000" && price >= 1000) return false;
        if (
          selectedBudget === "₹1,000 – ₹3,000" &&
          (price < 1000 || price > 3000)
        )
          return false;
        if (
          selectedBudget === "₹3,000 – ₹6,000" &&
          (price < 3000 || price > 6000)
        )
          return false;
        if (selectedBudget === "Above ₹6,000" && price <= 6000) return false;
      }
      if (selectedAvailability !== "All") {
        const inStock = p.inventory?.availability === "In Stock";
        if (selectedAvailability === "In Stock" && !inStock) return false;
        if (selectedAvailability === "Out of Stock" && inStock) return false;
      }
      return true;
    });
  }, [allProducts, selectedRecipient, selectedBudget, selectedAvailability]);

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
    return option ? option.label : "Sort by latest";
  };

  const getCategoryName = () => {
    if (!selectedCategory || selectedCategory === "All") return "All Products";
    const category = categories.find((c) => c.id === selectedCategory);
    return category ? category.label : "Category";
  };

  const skeletonItems = Array.from({ length: 10 }, (_, i) => i);

  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.mainContent}>
          {/* ================= HERO ================= */}
          <section className={styles.hero}>
            <img
              src={giftHero}
              alt="Timeless gifts for every celebration"
              className={styles.heroImage}
            />
          </section>

          {/* ================= GIFT SHOP BODY ================= */}
          <div className={styles.shopWrap} id="shopSection">
            {/* Mobile Filter Toggle */}
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

            {/* Desktop Sidebar */}
            <aside className={styles.filters}>
              <h3 className={styles.filtersHeading}>Filter</h3>

              {/* Sort By - Desktop Sidebar */}
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

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Occasion</span>
                {OCCASION_OPTIONS.map((occ) => (
                  <label key={occ} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="occasion"
                      checked={selectedOccasion === occ}
                      onChange={() => setSelectedOccasion(occ)}
                    />
                    {occ}
                  </label>
                ))}
              </div>

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

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Recipient</span>
                {FILTER_RECIPIENTS.map((r) => (
                  <label key={r} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="recipient"
                      checked={selectedRecipient === r}
                      onChange={() => setSelectedRecipient(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Budget</span>
                {FILTER_BUDGETS.map((b) => (
                  <label key={b} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="budget"
                      checked={selectedBudget === b}
                      onChange={() => setSelectedBudget(b)}
                    />
                    {b}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Price Range</span>
                <input
                  type="range"
                  min="0"
                  max="8000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className={styles.filterPriceInput}
                  style={{ "--_progress": `${(priceRange[1] / 8000) * 100}%` }}
                />
                <div className={styles.filterPriceRange}>
                  <span>₹0</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <span className={styles.filterGroupLabel}>Availability</span>
                {FILTER_AVAILABILITY.map((a) => (
                  <label key={a} className={styles.filterOption}>
                    <input
                      type="radio"
                      name="availability"
                      checked={selectedAvailability === a}
                      onChange={() => setSelectedAvailability(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>

              <button
                className={styles.filterClearBtn}
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </aside>

            {/* Product Listing */}
            <main className={styles.productsWrapper}>
              <div className={styles.productsHeader}>
                <span className={styles.productsCount}>
                  {isInitialLoading
                    ? "Loading..."
                    : `Showing ${clientFilteredProducts.length} results for ${getCategoryName()}`}
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
                  {clientFilteredProducts.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>🎁</div>
                      <h3>No gifts match these filters</h3>
                      <p>Try a different occasion, recipient, or budget.</p>
                      <button
                        type="button"
                        className={styles.emptyStateButton}
                        onClick={clearAllFilters}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}

                  {clientFilteredProducts.length > 0 && (
                    <div className={styles.productGrid}>
                      {clientFilteredProducts.map((p) => {
                        const discount =
                          p.pricing?.salePrice && p.pricing?.originalPrice
                            ? Math.round(
                                ((p.pricing.originalPrice -
                                  p.pricing.salePrice) /
                                  p.pricing.originalPrice) *
                                  100,
                              )
                            : 0;
                        const inCart = isInCart(p._id);
                        const inWishlist = isInWishlist(p._id);
                        const addingToCart = cartLoadingId === p._id;

                        return (
                          <div className={styles.productCard} key={p._id}>
                            <Link
                              to={`/product/${p.productSlug}`}
                              className={styles.productMedia}
                            >
                              {discount > 0 && (
                                <span className={styles.badge}>
                                  {discount}% off
                                </span>
                              )}
                              <span className={styles.productCatOverlay}>
                                {p.category?.categoryData?.label || "Gift"}
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
                                  {inWishlist ? <FaHeart /> : <FiHeart />}
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
                              <Link
                                to={`/product/${p.productSlug}`}
                                className={styles.productName}
                                title={p.productName}
                              >
                                {p.productName}
                              </Link>
                              <div className={styles.productPrice}>
                                <span className={styles.priceNow}>
                                  ₹
                                  {(
                                    p.pricing?.salePrice ||
                                    p.pricing?.originalPrice
                                  )?.toLocaleString() || "0"}
                                </span>
                                {p.pricing?.salePrice &&
                                  p.pricing?.originalPrice && (
                                    <span className={styles.priceOld}>
                                      ₹
                                      {p.pricing.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                              </div>
                              <button
                                type="button"
                                className={`${styles.addToCartBtn} ${
                                  inCart ? styles.addToCartBtnActive : ""
                                }`}
                                onClick={() => addToCart(p._id)}
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

              {!isInitialLoading && !hasMore && clientFilteredProducts.length > 0 && (
                <div className={styles.endMessage}>No more products</div>
              )}
            </main>
          </div>

          {/* ================= TESTIMONIALS ================= */}
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

            <div className={styles.testimonialsCarousel}>
              <div className={styles.testimonialsTrack}>
                {duplicatedTestimonials.map((t, idx) => (
                  <div
                    className={styles.testimonialCardMobile}
                    key={`${t.name}-${idx}`}
                  >
                    <span className={styles.avatar}>{t.initials}</span>
                    <div className={styles.testimonialBody}>
                      <div className={styles.stars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar
                            key={i}
                            className={
                              i < t.rating
                                ? styles.starFilled
                                : styles.starEmpty
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
            </div>
          </section>

          {/* ================= COMMITMENT ================= */}
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
                  honest quality, so what you gift carries meaning that lasts
                  well beyond the moment it's opened.
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

        {/* ── Mobile Bottom Sheet Overlay ── */}
        {isMobileFilterOpen && (
          <div className={styles.filterOverlay} onClick={closeMobileFilter} />
        )}

        {/* ── Mobile Bottom Sheet ── */}
        <div
          ref={sheetRef}
          className={`${styles.mobileFilterSheet} ${
            isMobileFilterOpen ? styles.mobileFilterSheetActive : ""
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

          <div className={styles.mobileFilterHeader}>
            <h3 className={styles.mobileFilterTitle}>Filter</h3>
            <button
              className={styles.mobileFilterClose}
              onClick={closeMobileFilter}
            >
              ✕
            </button>
          </div>

          <div className={styles.mobileFilterContent}>
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
                        onClick={() => {
                          handleSortSelect(option.value);
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

            {/* Occasion */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Occasion</span>
              <div className={styles.mobileFilterGrid}>
                {OCCASION_OPTIONS.map((occ) => (
                  <label key={occ} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_occasion"
                      checked={selectedOccasion === occ}
                      onChange={() => setSelectedOccasion(occ)}
                    />
                    {occ}
                  </label>
                ))}
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

            {/* Recipient */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Recipient</span>
              <div className={styles.mobileFilterGrid}>
                {FILTER_RECIPIENTS.map((r) => (
                  <label key={r} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_recipient"
                      checked={selectedRecipient === r}
                      onChange={() => setSelectedRecipient(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Budget</span>
              <div className={styles.mobileFilterGrid}>
                {FILTER_BUDGETS.map((b) => (
                  <label key={b} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_budget"
                      checked={selectedBudget === b}
                      onChange={() => setSelectedBudget(b)}
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>
                Availability
              </span>
              <div className={styles.mobileFilterGrid}>
                {FILTER_AVAILABILITY.map((a) => (
                  <label key={a} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_availability"
                      checked={selectedAvailability === a}
                      onChange={() => setSelectedAvailability(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Price Range</span>
              <input
                type="range"
                min="0"
                max="8000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                className={styles.filterPriceInput}
                style={{ "--_progress": `${(priceRange[1] / 8000) * 100}%` }}
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

        <Footer />
      </div>
    </>
  );
}