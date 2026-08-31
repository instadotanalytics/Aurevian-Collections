import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useNavigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import styles from "./shop.module.css";
import Header from "../../Pages/Layout/Header/Header";
import Footer from "../../Pages/Layout/Footer/Footer";
import shopHero from "../../assets/shophero.png";
import { LuSlidersHorizontal } from "react-icons/lu";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { FiPackage, FiCreditCard, FiPhoneCall } from "react-icons/fi";
import {
  FiShoppingBag,
  FiCheck,
  FiChevronDown,
  FiX,
  FiSearch,
} from "react-icons/fi";
import {
  fetchProductsByPlacement,
  searchProducts,
  fetchRelevantProducts,
} from "../../redux/slices/storefrontProductSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";
import {
  toggleWishlistItem,
  fetchWishlist,
} from "../../redux/slices/wishlistSlice";
// ✅ Reused (not duplicated) — same Header.module.css classes the
// header's own search bar uses, so the plain search input on the
// results page matches Aurevian styling exactly. NOTE: SearchPanel
// itself is intentionally NOT rendered here anymore — that component
// always shows its autocomplete/suggestions list, which was pushing
// the actual product grid below the fold on the /search page. The
// results page now uses a plain form (below) that only submits a
// query; autocomplete suggestions remain exactly as before everywhere
// else (header dropdown + mobile drawer).
import headerStyles from "../../Pages/Layout/Header/Header.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aurevian-collections.onrender.com/api";

const SORT_OPTIONS = [
  { value: "", label: "Default Sorting" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const BUDGET_OPTIONS = [
  { value: "all", label: "All" },
  { value: "under-1000", label: "Under ₹1,000" },
  { value: "1000-3000", label: "₹1,000 – ₹3,000" },
  { value: "3000-6000", label: "₹3,000 – ₹6,000" },
  { value: "above-6000", label: "Above ₹6,000" },
];

const PROMOTION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "gift-wrapped", label: "Gift Wrapped" },
  { value: "best-seller", label: "Best Seller" },
  { value: "trending", label: "Trending" },
  { value: "premium-gift", label: "Premium Gift" },
];

const perks = [
  {
    icon: FiPackage,
    title: "Free Shipping",
    text: "Free delivery for orders above ₹2,000",
  },
  {
    icon: FiCreditCard,
    title: "Flexible Payment",
    text: "Multiple secure payment options",
  },
  {
    icon: FiPhoneCall,
    title: "24×7 Support",
    text: "We support online all day",
  },
];

const truncateName = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length > 3) {
    return words.slice(0, 3).join(" ") + "...";
  }
  return name;
};

// Helper function to generate slug from label
const generateSlugFromLabel = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function Shop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Get URL parameters
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams();

  // ✅ search mode — driven entirely by the ?q= query param (this is
  // the canonical param for the dedicated /search?q=<query> route;
  // ?search= is still read as a fallback so any previously-shared
  // /shop?search= links keep working) so typing in the header,
  // hitting Enter/the search icon, refreshing the page, and browser
  // back/forward all resolve to the same state.
  const rawSearchQuery =
    searchParams.get("q") || searchParams.get("search") || "";
  const searchQuery = rawSearchQuery.trim().replace(/\s+/g, " ");
  const isSearchMode = searchQuery.length > 0;

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isResolvingSlug, setIsResolvingSlug] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 7000]);
  const [sort, setSort] = useState("");
  const [cartLoadingId, setCartLoadingId] = useState(null);

  // Filters
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [promotionFilter, setPromotionFilter] = useState("all");

  // Infinite scroll
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categoryError, setCategoryError] = useState(null);
  const loaderRef = useRef(null);

  // ✅ race-condition guard — every load() call stamps a fresh id
  // here; if a newer load() has started by the time an older one's
  // request resolves, the older one's result is discarded instead of
  // clobbering state. Covers rapid search-query changes as well as
  // rapid category/sort/filter changes.
  const requestIdRef = useRef(0);

  // ✅ "You Might Also Like" recommendations for the search results
  // page. Reuses the existing public getRelevantProducts endpoint/thunk
  // (the same one that powers the product-detail-page "You May Also
  // Like" section) — seeded from the first search result, so the
  // recommendation stays contextually related to what the user
  // searched for, with zero new backend surface area.
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const recommendationRequestIdRef = useRef(0);

  // ✅ NEW: plain (non-suggestion) search input for the persistent bar
  // at the top of the /search results page — kept in sync with the
  // URL's query so it always reflects what's actually being searched,
  // including when navigating from one search term straight to another.
  const [resultsSearchInput, setResultsSearchInput] = useState(searchQuery);
  useEffect(() => {
    setResultsSearchInput(searchQuery);
  }, [searchQuery]);

  // Mobile filter sheet
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const sheetRef = useRef(null);
  const dragState = useRef({ startY: 0, currentY: 0 });
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);

  // Mobile sort dropdown state
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Desktop sidebar sort dropdown state
  const [isSidebarSortOpen, setIsSidebarSortOpen] = useState(false);
  const sidebarSortRef = useRef(null);

  // Fetch categories first
  useEffect(() => {
    axios
      .get(`${API_URL}/seller/products/categories`)
      .then((res) => {
        const data = res.data.data || [];
        setCategories(data);
        setIsResolvingSlug(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
        setIsResolvingSlug(false);
      });
  }, []);

  // Resolve category from slug or query param after categories load
  useEffect(() => {
    if (isResolvingSlug || categories.length === 0) return;

    // First check if we have a query parameter
    const queryCategoryId = searchParams.get("category");

    if (queryCategoryId) {
      setSelectedCategoryId(queryCategoryId);
      return;
    }

    // If we have a slug in the URL (e.g., /shop/earrings)
    if (categorySlug) {
      // Find the category by matching slug with the label
      const matchingCategory = categories.find((c) => {
        const categorySlugFromLabel = generateSlugFromLabel(c.label);
        return categorySlugFromLabel === categorySlug;
      });

      if (matchingCategory) {
        setSelectedCategoryId(matchingCategory.id);
      } else {
        // If no matching category found, try to find by ID (for backward compatibility)
        const idMatch = categories.find((c) => c.id === categorySlug);
        if (idMatch) {
          setSelectedCategoryId(idMatch.id);
        }
      }
    }
  }, [categories, categorySlug, searchParams, isResolvingSlug]);

  // Fetch products (infinite scroll) — branches between the normal
  // placement-based browse flow and the search flow depending
  // on whether ?q= (or legacy ?search=) is present in the URL.
  useEffect(() => {
    const load = async () => {
      const requestId = ++requestIdRef.current;
      const isFirst = page === 1;
      if (isFirst) {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const start = Date.now();
      try {
        setCategoryError(null);
        let result;

        if (isSearchMode) {
          result = await dispatch(
            searchProducts({
              q: searchQuery,
              page,
              limit: 10,
              categoryId: selectedCategoryId || undefined,
              sort: sort || undefined,
            }),
          ).unwrap();
        } else {
          result = await dispatch(
            fetchProductsByPlacement({
              placement: "shop",
              page,
              limit: 10,
              categoryId: selectedCategoryId || undefined,
              sort: sort || undefined,
            }),
          ).unwrap();
        }

        // A newer request has already started — ignore this stale result.
        if (requestId !== requestIdRef.current) return;

        const fetched = result.products || [];
        setAllProducts((prev) => (isFirst ? fetched : [...prev, ...fetched]));
        setHasMore(page < (result.pagination?.totalPages || 1));
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error(err);
        setCategoryError(
          isSearchMode
            ? "Failed to search products. Please try again."
            : "Failed to load products. Please try again.",
        );
        toast.error(isSearchMode ? "Search failed" : "Failed to load products");
      } finally {
        if (requestId !== requestIdRef.current) return;
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          if (requestId !== requestIdRef.current) return;
          if (isFirst) setIsInitialLoading(false);
          else setIsLoadingMore(false);
        }, remaining);
      }
    };

    if (!isResolvingSlug) {
      load();
    }
  }, [
    page,
    refreshKey,
    dispatch,
    selectedCategoryId,
    sort,
    isResolvingSlug,
    isSearchMode,
    searchQuery,
  ]);

  // Reset on filter change (also resets when the search query changes,
  // including when it's cleared — e.g. navigating back to /shop)
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    setRefreshKey((k) => k + 1);
  }, [selectedCategoryId, sort, budgetFilter, promotionFilter, searchQuery]);

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

  /* Close mobile sort dropdown on outside click */
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

  /* Close desktop sidebar sort dropdown on outside click */
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
      navigate("/login", { state: { from: "/shop" } });
      return false;
    }
    return true;
  };

  const isInCart = (id) => cartItems.some((i) => i.product === id);
  const isInWishlist = (id) =>
    wishlistItems.some((i) => (i.product?._id || i.product) === id);

  const handleToggleWishlist = (id) => {
    if (!requireAuth()) return;
    dispatch(toggleWishlistItem(id)).catch(() => {});
  };

  const handleAddToCart = async (id) => {
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
    setSelectedCategoryId("");
    setPriceRange([0, 7000]);
    setSort("");
    setBudgetFilter("all");
    setPromotionFilter("all");
    // Navigate to base shop page when clearing filters (also clears the search)
    navigate("/shop");
  };

  // ✅ dedicated "clear search" action — restores normal shop
  // browsing without resetting the other filters the user may have set.
  const clearSearch = () => {
    navigate("/shop");
  };

  // ✅ NEW: submit handler for the plain top-of-results search bar —
  // navigates to a (possibly new) /search?q= query. No suggestions,
  // no product-detail navigation — always the search results page.
  const handleResultsSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = resultsSearchInput.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
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
    setSort(value);
    setIsSortDropdownOpen(false);
  };

  const getSortLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === sort);
    return option ? option.label : "Default Sorting";
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const price = p.pricing?.salePrice || p.pricing?.originalPrice || 0;
      if (budgetFilter === "under-1000" && price >= 1000) return false;
      if (budgetFilter === "1000-3000" && (price < 1000 || price > 3000))
        return false;
      if (budgetFilter === "3000-6000" && (price < 3000 || price > 6000))
        return false;
      if (budgetFilter === "above-6000" && price <= 6000) return false;
      if (promotionFilter !== "all") {
        const discount =
          p.pricing?.originalPrice && p.pricing?.salePrice
            ? Math.round(
                ((p.pricing.originalPrice - p.pricing.salePrice) /
                  p.pricing.originalPrice) *
                  100,
              )
            : 0;
        if (promotionFilter === "best-seller" && discount < 20) return false;
        if (promotionFilter === "trending" && price < 500) return false;
        if (
          promotionFilter === "gift-wrapped" &&
          !p.productName?.toLowerCase().includes("gift")
        )
          return false;
        if (promotionFilter === "premium-gift" && price < 2000) return false;
      }
      return true;
    });
  }, [allProducts, budgetFilter, promotionFilter]);

  // ✅ Seed product for the recommendation section — the first result
  // of the current search. Stable across additional infinite-scroll
  // pages since new results are appended after it, never prepended,
  // so this only changes when the search itself (or its first
  // result) changes — not on every scroll-load.
  const searchSeedProductId = useMemo(() => {
    if (!isSearchMode || filteredProducts.length === 0) return null;
    return filteredProducts[0]._id;
  }, [isSearchMode, filteredProducts]);

  // ✅ Fetch "You Might Also Like" recommendations whenever the search
  // seed product changes. Skipped entirely outside search mode or
  // when there's no seed (no search results) — no data, no attempted
  // recommendation, matching the requirement to only recommend
  // "whenever the available data allows it".
  useEffect(() => {
    if (!searchSeedProductId) {
      setRecommendedProducts([]);
      setIsLoadingRecommendations(false);
      return;
    }

    const requestId = ++recommendationRequestIdRef.current;
    setIsLoadingRecommendations(true);

    dispatch(
      fetchRelevantProducts({ productId: searchSeedProductId, limit: 4 }),
    )
      .unwrap()
      .then((result) => {
        if (requestId !== recommendationRequestIdRef.current) return;
        setRecommendedProducts(result.products || []);
      })
      .catch(() => {
        if (requestId !== recommendationRequestIdRef.current) return;
        setRecommendedProducts([]);
      })
      .finally(() => {
        if (requestId !== recommendationRequestIdRef.current) return;
        setIsLoadingRecommendations(false);
      });
  }, [searchSeedProductId, dispatch]);

  const skeletonItems = Array.from({ length: 10 }, (_, i) => i);

  // Get the category name for display
  const getCategoryName = () => {
    if (!selectedCategoryId) return "All Products";
    const category = categories.find((c) => c.id === selectedCategoryId);
    return category ? category.label : "Category";
  };

  // ✅ Shared product card renderer — used by both the main results
  // grid and the "You Might Also Like" recommendations section below,
  // so the card markup, wishlist/cart behaviour, and styling exist in
  // exactly one place instead of being duplicated.
  const renderProductCard = (p) => {
    const inCart = isInCart(p._id);
    const inWishlist = isInWishlist(p._id);
    const addingToCart = cartLoadingId === p._id;
    const displayName = truncateName(p.productName);

    return (
      <div className={styles.productCard} key={p._id}>
        <Link to={`/product/${p.productSlug}`} className={styles.productMedia}>
          {p.pricing?.salePrice && p.pricing?.originalPrice && (
            <span className={styles.badge}>
              {Math.round(
                ((p.pricing.originalPrice - p.pricing.salePrice) /
                  p.pricing.originalPrice) *
                  100,
              )}
              % off
            </span>
          )}
          <span className={styles.productCatOverlay}>
            {p.category?.categoryData?.label || "Uncategorized"}
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
                handleToggleWishlist(p._id);
              }}
              aria-label={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              {inWishlist ? <FaHeart /> : <FiHeart />}
            </button>
          </div>
          <img
            src={p.thumbnail?.url || "/placeholder-image.jpg"}
            alt={p.productName}
            className={styles.productImage}
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
        </Link>
        <div className={styles.productInfo}>
          <Link
            to={`/product/${p.productSlug}`}
            className={styles.productName}
            title={p.productName}
          >
            {displayName}
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
            className={`${styles.addToCartBtn} ${
              inCart ? styles.addToCartBtnActive : ""
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
                <FiShoppingBag /> {addingToCart ? "Adding..." : "Add to Cart"}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.mainContent}>
        {/* ✅ FIXED: Top-of-page area for search mode. This now renders
            ONLY a plain, non-suggestion search input (no dropdown/
            autocomplete list, no "Search results for..." heading) so
            the actual product grid appears immediately below it —
            nothing pushes the results down or requires scrolling.
            Autocomplete/suggestions behavior is completely unchanged
            everywhere else (header search icon + mobile drawer still
            use SearchPanel exactly as before). */}
        {isSearchMode ? (
          <section
            className={styles.pageTitle}
            style={{ padding: "24px 24px 16px" }}
          >
            <form
              className={headerStyles.searchForm}
              role="search"
              onSubmit={handleResultsSearchSubmit}
              style={{ maxWidth: 480 }}
            >
              <FiSearch
                className={headerStyles.searchFormLeadIcon}
                aria-hidden="true"
              />
              <input
                type="text"
                value={resultsSearchInput}
                onChange={(e) => setResultsSearchInput(e.target.value)}
                placeholder="Search for earrings, necklaces, rings..."
                aria-label="Search products"
                autoComplete="off"
              />
              <button
                type="submit"
                className={headerStyles.searchIconBtn}
                aria-label="Submit search"
              >
                <FiSearch />
              </button>
            </form>
          </section>
        ) : (
          <section className={styles.pageTitle}>
            <img
              src={shopHero}
              alt="Shop Collection"
              className={styles.heroImage}
            />
          </section>
        )}

        {/* Shop Content */}
        <div className={styles.shopWrap}>
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
                          sort === option.value
                            ? styles.sidebarSortOptionActive
                            : ""
                        }`}
                        onClick={() => {
                          setSort(option.value);
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
              <span className={styles.filterGroupLabel}>Category</span>
              <label className={styles.filterOption}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategoryId === ""}
                  onChange={() => {
                    setSelectedCategoryId("");
                    if (!isSearchMode) navigate("/shop");
                  }}
                />
                All
              </label>
              {categories.map((c) => (
                <label key={c.id} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategoryId === c.id}
                    onChange={() => {
                      setSelectedCategoryId(c.id);
                      // Only rewrite the URL to a category slug when not
                      // searching — while searching we keep ?q= and
                      // just apply categoryId as an in-place filter.
                      if (!isSearchMode) {
                        const slug = generateSlugFromLabel(c.label);
                        navigate(`/shop/${slug}`);
                      }
                    }}
                  />
                  {c.label}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Budget</span>
              {BUDGET_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="budget"
                    checked={budgetFilter === opt.value}
                    onChange={() => setBudgetFilter(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterGroupLabel}>Promotions</span>
              {PROMOTION_OPTIONS.map((opt) => (
                <label key={opt.value} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="promotion"
                    checked={promotionFilter === opt.value}
                    onChange={() => setPromotionFilter(opt.value)}
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
                style={{ "--_progress": `${(priceRange[1] / 7000) * 100}%` }}
              />
              <div className={styles.filterPriceRange}>
                <span>₹0</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <button className={styles.filterClearBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </aside>

          {/* Product Grid */}
          <main>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <span className={styles.resultsCount}>
                {isInitialLoading
                  ? "Loading..."
                  : isSearchMode
                    ? `Showing ${filteredProducts.length} result${
                        filteredProducts.length === 1 ? "" : "s"
                      } for "${searchQuery}"`
                    : `Showing ${filteredProducts.length} results for ${getCategoryName()}`}
              </span>
              {isSearchMode && !isInitialLoading && (
                <button
                  type="button"
                  onClick={clearSearch}
                  style={{
                    marginLeft: 12,
                    background: "none",
                    border: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                    color: "inherit",
                    textDecoration: "underline",
                    fontSize: "0.9em",
                    opacity: 0.8,
                  }}
                >
                  <FiX size={14} />
                  Clear search
                </button>
              )}
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
                {/* No-results state specific to an active search */}
                {filteredProducts.length === 0 && isSearchMode && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🔍</div>
                    <h3>No products found</h3>
                    <p>
                      We couldn't find any products matching "{searchQuery}".
                      Try a different keyword or browse our collections instead!
                    </p>
                    <Link to="/shop" className={styles.emptyStateButton}>
                      Browse All Products
                    </Link>
                  </div>
                )}

                {filteredProducts.length === 0 &&
                  !isSearchMode &&
                  selectedCategoryId && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>🔍</div>
                      <h3>No Products Found</h3>
                      <p>
                        We couldn't find any products in "{getCategoryName()}".
                        Try browsing our other collections!
                      </p>
                      <Link to="/shop" className={styles.emptyStateButton}>
                        Browse All Products
                      </Link>
                    </div>
                  )}

                

                {filteredProducts.length > 0 && (
                  <div className={styles.productGrid}>
                    {filteredProducts.map((p) => renderProductCard(p))}
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

            {!isInitialLoading && !hasMore && filteredProducts.length > 0 && (
              <div className={styles.endMessage}>No more products</div>
            )}
          </main>
        </div>

        {/* ✅ "You Might Also Like" — contextual recommendation shown at
            the bottom of the search results page. Only rendered in
            search mode, once the main results have finished loading,
            and only when there's a seed result to base it on. Reuses
            the same product card markup/styles and product grid
            layout as the main results above; the underlying data
            comes from the existing public getRelevantProducts
            endpoint. */}
        {isSearchMode &&
          !isInitialLoading &&
          !categoryError &&
          (isLoadingRecommendations || recommendedProducts.length > 0) && (
            <section style={{ padding: "0 24px 40px" }}>
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  margin: "8px 0 20px",
                }}
              >
                You Might Also Like
              </h2>
              {isLoadingRecommendations ? (
                <div className={styles.skeletonGrid}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      className={styles.skeletonCard}
                      key={`rec-skeleton-${i}`}
                    >
                      <div className={styles.skeletonImage} />
                      <div className={styles.skeletonText} />
                      <div
                        className={`${styles.skeletonText} ${styles.skeletonTextShort}`}
                      />
                      <div className={styles.skeletonBtn} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {recommendedProducts.map((p) => renderProductCard(p))}
                </div>
              )}
            </section>
          )}

        {/* Perks Section */}
        <section className={styles.perks}>
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div className={styles.perk} key={perk.title}>
                <div className={styles.icon}>
                  <Icon />
                </div>
                <div>
                  <h4>{perk.title}</h4>
                  <p>{perk.text}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Mobile Bottom Sheet Filter */}
        {isMobileFilterOpen && (
          <div className={styles.filterOverlay} onClick={closeMobileFilter} />
        )}
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
                          sort === option.value
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
                    checked={selectedCategoryId === ""}
                    onChange={() => {
                      setSelectedCategoryId("");
                      if (!isSearchMode) navigate("/shop");
                    }}
                  />
                  All
                </label>
                {categories.map((c) => (
                  <label key={c.id} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_category"
                      checked={selectedCategoryId === c.id}
                      onChange={() => {
                        setSelectedCategoryId(c.id);
                        if (!isSearchMode) {
                          const slug = generateSlugFromLabel(c.label);
                          navigate(`/shop/${slug}`);
                        }
                      }}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Budget</span>
              <div className={styles.mobileFilterGrid}>
                {BUDGET_OPTIONS.map((opt) => (
                  <label key={opt.value} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_budget"
                      checked={budgetFilter === opt.value}
                      onChange={() => setBudgetFilter(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Promotions */}
            <div className={styles.mobileFilterGroup}>
              <span className={styles.mobileFilterGroupLabel}>Promotions</span>
              <div className={styles.mobileFilterGrid}>
                {PROMOTION_OPTIONS.map((opt) => (
                  <label key={opt.value} className={styles.mobileFilterOption}>
                    <input
                      type="radio"
                      name="mobile_promotion"
                      checked={promotionFilter === opt.value}
                      onChange={() => setPromotionFilter(opt.value)}
                    />
                    {opt.label}
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
      </div>
      <Footer />
    </div>
  );
}
