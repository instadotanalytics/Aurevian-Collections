
// src/Pages/Wishlist/Wishlist.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaHeart, FaRupeeSign, FaSearch } from "react-icons/fa";
import { FiX, FiShoppingBag } from "react-icons/fi";
import styles from "./Wishlist.module.css";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";

import {
  fetchWishlist,
  removeWishlistItem,
} from "../../redux/slices/wishlistSlice";
import { addItemToCart } from "../../redux/slices/cartSlice";

// ------------------------------------------------------------------
// Config
// ------------------------------------------------------------------
const PAGE_SIZE = 6; // items revealed per "page" for pagination / infinite scroll
const FETCH_THROTTLE_MS = 4000; // don't re-hit the API more than once per window
const SEARCH_DEBOUNCE_MS = 350;
const FALLBACK_IMAGE = "/images/placeholder-product.png";

// Same fallback rule as Cart: items added before the shortDescription/slug
// snapshot existed fall back to the productId, which ProductDetail already
// resolves gracefully ("Product not found") rather than breaking navigation.
const productUrl = (item) => `/product/${item.slug || item.product}`;

// ------------------------------------------------------------------
// Validation — guard the UI against malformed/incomplete records
// (e.g. legacy wishlist rows, tampered payloads, partial API responses)
// instead of letting them throw or render broken cards.
// ------------------------------------------------------------------
const isValidWishlistItem = (item) => {
  if (!item || typeof item !== "object") return false;
  if (!item.product || typeof item.product !== "string") return false;
  if (!item.name || typeof item.name !== "string") return false;
  const priceNum = Number(item.price);
  if (Number.isNaN(priceNum) || priceNum < 0) return false;
  return true;
};

// ------------------------------------------------------------------
// Small reusable hooks
// ------------------------------------------------------------------

// Debounce a fast-changing value (used for the search box so we don't
// re-filter on every keystroke).
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Throttle a callback so it can only fire once per `limit` ms, no matter
// how many times it's invoked (used to guard the initial data fetch and
// the infinite-scroll "load more" trigger from firing repeatedly).
function useThrottledCallback(callback, limit) {
  const lastRun = useRef(0);
  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRun.current >= limit) {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, limit],
  );
}

// ------------------------------------------------------------------
// Skeleton placeholder — mirrors the real card's desktop/mobile grid so
// the layout doesn't jump once real data arrives.
// ------------------------------------------------------------------
const WishlistCardSkeleton = memo(function WishlistCardSkeleton() {
  return (
    <div className={styles.wishlistCard} aria-hidden="true">
      <div className={styles.cardContent}>
        <div className={styles.desktopView}>
          <div className={styles.productCell}>
            <div className={`${styles.imageWrapper} ${styles.skeletonBlock}`} />
            <div className={styles.productInfo}>
              <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonDesc}`} />
            </div>
          </div>
          <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonBtn}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonRemove}`} />
        </div>

        <div className={styles.mobileView}>
          <div className={styles.mobileCard}>
            <div className={`${styles.mobileImageWrap} ${styles.skeletonBlock}`} />
            <div className={styles.mobileInfo}>
              <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonDesc}`} />
              <div className={`${styles.skeletonLine} ${styles.skeletonBtn}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ------------------------------------------------------------------
// A single wishlist card. Memoized so removing/moving one card never
// re-renders every other card in the list.
// ------------------------------------------------------------------
const WishlistCard = memo(function WishlistCard({ item, onRemove, onMoveToCart }) {
  const [imgSrc, setImgSrc] = useState(item.image || FALLBACK_IMAGE);
  const [isMoving, setIsMoving] = useState(false);

  const handleImgError = useCallback(() => {
    setImgSrc(FALLBACK_IMAGE);
  }, []);

  const handleRemove = useCallback(() => {
    onRemove(item.product);
  }, [onRemove, item.product]);

  const handleMoveToCart = useCallback(async () => {
    setIsMoving(true);
    try {
      await onMoveToCart(item);
    } finally {
      setIsMoving(false);
    }
  }, [onMoveToCart, item]);

  return (
    <div className={styles.wishlistCard}>
      <div className={styles.cardContent}>
        {/* ---------- DESKTOP VIEW ---------- */}
        <div className={styles.desktopView}>
          <Link to={productUrl(item)} className={styles.productCell}>
            <div className={styles.imageWrapper}>
              <img
                src={imgSrc}
                alt={item.name}
                className={styles.productImage}
                loading="lazy"
                onError={handleImgError}
              />
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{item.name}</h3>
              {item.shortDescription && (
                <p className={styles.productDescription}>
                  {item.shortDescription}
                </p>
              )}
              <div className={styles.availability}>
                <span className={styles.inStock}>✓ In Stock</span>
              </div>
            </div>
          </Link>

          <div className={styles.priceCell}>
            <span className={styles.currentPrice}>
              <FaRupeeSign className={styles.rupeeIconSmall} />
              {Number(item.price).toLocaleString("en-IN")}
            </span>
          </div>

          <div className={styles.actionCell}>
            <button
              type="button"
              className={styles.moveToCartButton}
              onClick={handleMoveToCart}
              disabled={isMoving}
              aria-busy={isMoving}
            >
              <FiShoppingBag />
              {isMoving ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          <div className={styles.removeCell}>
            <button
              type="button"
              className={styles.removeButton}
              onClick={handleRemove}
              aria-label={`Remove ${item.name} from wishlist`}
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* ---------- MOBILE VIEW ---------- */}
        <div className={styles.mobileView}>
          <div className={styles.mobileCard}>
            <Link to={productUrl(item)} className={styles.mobileImageWrap}>
              <img
                src={imgSrc}
                alt={item.name}
                className={styles.productImage}
                loading="lazy"
                onError={handleImgError}
              />
            </Link>

            <div className={styles.mobileInfo}>
              <div className={styles.mobileInfoHead}>
                <Link to={productUrl(item)} className={styles.productName}>
                  {item.name}
                </Link>
                <button
                  type="button"
                  className={styles.removeButtonMobile}
                  onClick={handleRemove}
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <FiX />
                </button>
              </div>

              {item.shortDescription && (
                <Link
                  to={productUrl(item)}
                  className={styles.productDescriptionMobile}
                >
                  {item.shortDescription}
                </Link>
              )}

              <div className={styles.mobileStockRow}>
                <span className={styles.inStock}>✓ In Stock</span>
                <span className={styles.currentPrice}>
                  <FaRupeeSign className={styles.rupeeIconSmall} />
                  {Number(item.price).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                className={styles.moveToCartButtonMobile}
                onClick={handleMoveToCart}
                disabled={isMoving}
                aria-busy={isMoving}
              >
                <FiShoppingBag />
                {isMoving ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const Wishlist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: wishlist, isLoading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  // Throttled fetch — guards against duplicate/rapid dispatches (e.g. fast
  // route re-entries or auth state flapping) hammering the API.
  const throttledFetch = useThrottledCallback(() => {
    dispatch(fetchWishlist());
  }, FETCH_THROTTLE_MS);

  useEffect(() => {
    if (isAuthenticated) {
      throttledFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Never trust stored data blindly — drop anything malformed before it
  // reaches the render tree or gets keyed into React's reconciler.
  const validItems = useMemo(
    () => (Array.isArray(wishlist) ? wishlist.filter(isValidWishlistItem) : []),
    [wishlist],
  );

  // Client-side search filter, driven by the debounced term so typing
  // doesn't trigger a re-filter (and re-render) on every keystroke.
  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return validItems;
    return validItems.filter((item) => item.name.toLowerCase().includes(query));
  }, [validItems, debouncedSearch]);

  // Reset pagination whenever the effective list changes (new search, or
  // wishlist contents changed) so we don't show a stale "page".
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, validItems.length]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredItems.length));
  }, [filteredItems.length]);

  const throttledLoadMore = useThrottledCallback(loadMore, 600);

  // Infinite scroll: observe a sentinel node instead of a scroll listener,
  // which avoids running expensive work on every scroll tick.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          throttledLoadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, throttledLoadMore]);

  const removeItem = useCallback(
    (productId) => {
      dispatch(removeWishlistItem(productId));
      toast.success("Removed from wishlist");
    },
    [dispatch],
  );

  const moveToCart = useCallback(
    async (item) => {
      try {
        await dispatch(
          addItemToCart({ productId: item.product, quantity: 1 }),
        ).unwrap();
        dispatch(removeWishlistItem(item.product));
        toast.success("Added to cart");
      } catch (err) {
        toast.error(err || "Failed to add to cart");
      }
    },
    [dispatch],
  );

  const handleSearchChange = useCallback((e) => {
    // Basic input hygiene: cap length so a pasted wall of text can't blow
    // up the filter pass or the DOM.
    setSearchTerm(e.target.value.slice(0, 100));
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className={styles.wishlistPage}>
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrapper}>
              <FaHeart className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Please Login to View Your Wishlist</h2>
            <p className={styles.emptyDescription}>
              Sign in to see the pieces you've saved
            </p>
            <Link to="/login" className={styles.exploreButton}>
              Login
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isLoading && validItems.length === 0) {
    return (
      <>
        <Header />
        <div className={styles.wishlistPage}>
          <div className={styles.emptyContainer}>
            <div className={styles.emptyIconWrapper}>
              <FaHeart className={styles.emptyIcon} />
            </div>
            <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
            <p className={styles.emptyDescription}>
              Start adding your favourite jewellery pieces
            </p>
            <Link to="/" className={styles.exploreButton}>
              Explore Collection
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.wishlistPage}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>My Wishlist</h1>
            <p className={styles.heroDescription}>
              Your handpicked favourites, saved and ready whenever you are.
            </p>
          </div>
        </section>

        <div className={styles.controlsBar}>
          <span className={styles.itemCount}>
            {validItems.length} {validItems.length === 1 ? "item" : "items"} saved
          </span>

          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search your wishlist"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search your wishlist"
              maxLength={100}
            />
          </div>
        </div>

        <div className={styles.wishlistItemsSection}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <WishlistCardSkeleton key={`skeleton-${i}`} />
            ))
          ) : filteredItems.length === 0 ? (
            <div className={styles.noResults}>
              <FaSearch className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No matches for "{debouncedSearch}"</h2>
              <p className={styles.emptyDescription}>Try a different search term</p>
            </div>
          ) : (
            <>
              {visibleItems.map((item) => (
                <WishlistCard
                  key={item.product}
                  item={item}
                  onRemove={removeItem}
                  onMoveToCart={moveToCart}
                />
              ))}

              {hasMore && (
                <div className={styles.loadMoreRow} ref={sentinelRef}>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    onClick={loadMore}
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

       
       
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;