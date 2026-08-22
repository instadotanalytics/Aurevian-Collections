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

// ✅ REMOVED — "Anniversary/Birthday/Wedding/..." here were duplicating
// giftGuideMegaMenu.byOccasion (which already exists in HeaderConfig and
// maps to the real `specifications.occasion` product field). Keeping two
// separate, disconnected "occasion-ish" lists is exactly the kind of
// duplicated/hardcoded logic you asked to avoid. This page now reads its
// occasion filter from the URL (giftGuideMegaMenu link -> /gifts/:slug)
// and from an in-page occasion selector built from the SAME product
// field, see OCCASION_OPTIONS below.

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
]; // mirrors specifications.occasion enum on JewelleryProduct — keep in
// sync if that enum changes.

// FILTER_RECIPIENTS maps to the real `specifications.gender` field
// (Men/Women/Unisex/Kids) — closest existing product attribute to
// "recipient". "For Couples" has no product-level equivalent; it's
// excluded from actual filtering (falls through to "All") rather than
// silently matching nothing.
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
// ✅ FILTER_PROMOTIONS removed — no backing product field.
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

const ITEMS_PER_BATCH = 10;

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonMedia} />
      <div className={styles.skeletonInfo}>
        <div className={styles.skeletonLine} style={{ width: "70%" }} />
        <div className={styles.skeletonLine} style={{ width: "45%" }} />
        <div className={styles.skeletonBtn} />
      </div>
    </div>
  );
}

export default function Gifts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filterSlug } = useParams(); // giftGuideMegaMenu.byOccasion link, e.g. "/gifts/birthday"
  const { byPlacement, isLoading } = useSelector(
    (state) => state.storefrontProduct,
  );
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const giftsData = byPlacement.gifts || {
    products: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
  };

  // ✅ NEW: real shop categories (seller-panel controlled)
  const [categories, setCategories] = useState([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  // ✅ Occasion now seeded from the URL when a giftGuide link is clicked,
  // and stays selectable in-page too.
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [cartLoadingId, setCartLoadingId] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

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

  const allProducts = giftsData.products || [];
  const visibleProducts = allProducts.slice(0, visibleCount);
  const { total, totalPages } = giftsData.pagination || {
    total: 0,
    totalPages: 1,
  };

  // Keep occasion in sync if the URL param changes without remount
  useEffect(() => {
    if (!filterSlug) return;
    const match = OCCASION_OPTIONS.find(
      (o) => o.toLowerCase().replace(/[^a-z0-9]+/g, "-") === filterSlug,
    );
    if (match) setSelectedOccasion(match);
  }, [filterSlug]);

  // ✅ NEW: fetch real categories, same endpoint as Shop.jsx
  useEffect(() => {
    axios
      .get(`${API_BASE}/seller/products/categories`)
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      });
  }, []);

  // ── Fetch products ──
  useEffect(() => {
    dispatch(
      fetchProductsByPlacement({
        placement: "gifts",
        page: currentPage,
        limit: itemsPerPage,
        categoryId: selectedCategory !== "All" ? selectedCategory : undefined,
        occasion: selectedOccasion !== "All" ? selectedOccasion : undefined,
        sort: sortBy || undefined,
      }),
    );
  }, [dispatch, currentPage, selectedCategory, selectedOccasion, sortBy]);

  // Reset visible count when products change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_BATCH);
  }, [selectedCategory, selectedOccasion, sortBy, currentPage]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  // ── Close sort dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Infinite Scroll via IntersectionObserver ──
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingMore &&
          visibleCount < allProducts.length
        ) {
          setIsLoadingMore(true);
          // Simulate throttled load (300ms delay)
          setTimeout(() => {
            setVisibleCount((prev) =>
              Math.min(prev + ITEMS_PER_BATCH, allProducts.length),
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, allProducts.length, isLoadingMore]);

  // ── Drag-to-close sheet handlers ──
  const getDragY = (e) => {
    if (e.touches) return e.touches[0].clientY;
    return e.clientY;
  };

  const onDragStart = useCallback(
    (e) => {
      // Only drag from the handle or header area
      const target = e.target;
      const isHandle =
        target.classList.contains(styles.mobileFilterHandle) ||
        target.closest(`.${styles.mobileFilterHeader}`);

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
    },
    [styles.mobileFilterHandle, styles.mobileFilterHeader],
  );

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

    // Prevent scroll while dragging
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
      closeMobileFilter();
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

  // ── Auth guard ──
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
    setCurrentPage(1);
    if (filterSlug) navigate("/gifts");
  };

  // ✅ NEW: recipient/budget now actually filter the visible list,
  // client-side, same approach Shop.jsx already uses for its own
  // budget/promotion filters. Previously these two setState calls had
  // no reader anywhere in the file.
  const clientFilteredProducts = useMemo(() => {
    return visibleProducts.filter((p) => {
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
  }, [
    visibleProducts,
    selectedRecipient,
    selectedBudget,
    selectedAvailability,
  ]);

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

    // Reset sheet position
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.transform = "";
      sheet.style.transition = "";
    }

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
              <div className={styles.toolbar}>
                <span className={styles.resultsCount}>
                  {isLoading
                    ? "Loading..."
                    : `Showing ${Math.min(visibleCount, allProducts.length)} of ${total} products`}
                </span>

                <div className={styles.sortWrapper} ref={sortDropdownRef}>
                  <button
                    className={styles.sortButton}
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    aria-expanded={isSortDropdownOpen}
                  >
                    <span>{getSortLabel()}</span>
                    <FiChevronDown
                      className={`${styles.sortChevron} ${isSortDropdownOpen ? styles.sortChevronOpen : ""}`}
                    />
                  </button>

                  {isSortDropdownOpen && (
                    <div className={styles.sortDropdown}>
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className={`${styles.sortOption} ${sortBy === option.value ? styles.sortOptionActive : ""}`}
                          onClick={() => handleSortSelect(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Product Grid ── */}
              <div className={styles.productGrid}>
                {isLoading
                  ? Array.from({ length: ITEMS_PER_BATCH }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : clientFilteredProducts.length === 0
                    ? null /* empty state rendered below the grid */
                    : clientFilteredProducts.map((p) => {
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
                                  className={`${styles.wishlistBtn} ${inWishlist ? styles.wishlistBtnActive : ""}`}
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
                                className={`${styles.addToCartBtn} ${inCart ? styles.addToCartBtnActive : ""}`}
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

              {/* Empty state */}
              {!isLoading && clientFilteredProducts.length === 0 && (
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

              {/* ── Infinite Scroll Sentinel ── */}
              {!isLoading && clientFilteredProducts.length > 0 && (
                <div ref={sentinelRef} className={styles.sentinel}>
                  {isLoadingMore && (
                    <div className={styles.skeletonLoadMoreGrid}>
                      {Array.from({ length: 2 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pagination (still kept for edge cases) */}
              {!isLoading &&
                totalPages > 1 &&
                visibleCount >= allProducts.length &&
                clientFilteredProducts.length > 0 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.paginationBtn}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          className={`${styles.pageBtn} ${n === currentPage ? styles.activePage : ""}`}
                          onClick={() => setCurrentPage(n)}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      className={styles.paginationBtn}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                  </div>
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
          className={`${styles.mobileFilterSheet} ${isMobileFilterOpen ? styles.mobileFilterSheetActive : ""}`}
        >
          {/* Drag handle */}
          <div className={styles.mobileFilterHandle} />

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
