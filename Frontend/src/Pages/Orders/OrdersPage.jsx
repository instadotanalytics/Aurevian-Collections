
// src/Pages/Orders/OrdersPage.jsx
import React, { useEffect, useState, useMemo, useRef, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FaRupeeSign,
  FaGem,
  FaCheckCircle,
  FaTruck,
  FaClock,
  FaTimesCircle,
  FaBoxOpen,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import styles from "./OrdersPage.module.css";
import { fetchMyOrders } from "../../redux/slices/orderSlice";

// ✅ SOCKET.IO — real-time order updates
import useOrderSocketEvents from "../../hooks/useOrderSocketEvents.js";

// ------------------------------------------------------------------
// Config
// ------------------------------------------------------------------
const PAGE_SIZE = 8; // orders revealed per "page" for pagination / infinite scroll
const FETCH_THROTTLE_MS = 4000; // don't re-hit the API more than once per window
const SEARCH_DEBOUNCE_MS = 350;
const FALLBACK_IMAGE = "/images/placeholder-product.png";

const STATUS_META = {
  placed: { label: "Placed", className: "badgePlaced", icon: <FaClock /> },
  processing: {
    label: "Processing",
    className: "badgeProcessing",
    icon: <FaClock />,
  },
  shipped: {
    label: "Shipped",
    className: "badgeShipped",
    icon: <FaTruck />,
  },
  delivered: {
    label: "Delivered",
    className: "badgeDelivered",
    icon: <FaCheckCircle />,
  },
  cancelled: {
    label: "Cancelled",
    className: "badgeCancelled",
    icon: <FaTimesCircle />,
  },
  return_requested: {
    label: "Return Requested",
    className: "badgeCancelled",
    icon: <FaClock />,
  },
};

const FILTERS = [
  { id: "all", label: "All Orders" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
  { id: "return", label: "Return" },
];

const getOrderTotal = (order) => {
  if (typeof order.totalAmount === "number") return order.totalAmount;
  return order.items.reduce((sum, it) => sum + (it.subtotal || 0), 0);
};

// ------------------------------------------------------------------
// Validation — guard the UI against malformed/incomplete order records
// (partial API responses, an order with no items, a missing id) instead
// of letting them throw mid-render.
// ------------------------------------------------------------------
const isValidOrder = (order) => {
  if (!order || typeof order !== "object") return false;
  if (!order._id) return false;
  if (!Array.isArray(order.items) || order.items.length === 0) return false;
  const mainItem = order.items[0];
  if (!mainItem || typeof mainItem.name !== "string") return false;
  return true;
};

// ------------------------------------------------------------------
// Small reusable hooks
// ------------------------------------------------------------------
function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Throttle a callback so it can only fire once per `limit` ms, no matter
// how many times it's invoked — guards the initial fetch and every
// socket-triggered refetch from hammering the API if several events land
// close together.
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
// Skeleton row — mirrors the real row's shape so the layout doesn't
// jump once real data arrives.
// ------------------------------------------------------------------
const OrderRowSkeleton = memo(function OrderRowSkeleton() {
  return (
    <div className={styles.orderRow} aria-hidden="true">
      <div className={styles.colProduct}>
        <div className={`${styles.orderImage} ${styles.skeletonBlock}`} />
        <div className={styles.productMeta}>
          <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonLine} ${styles.skeletonSub}`} />
        </div>
      </div>
      <div className={styles.colPrice}>
        <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
      </div>
      <div className={styles.colQty}>
        <div className={`${styles.skeletonLine} ${styles.skeletonQty}`} />
      </div>
      <div className={styles.colDate}>
        <div className={`${styles.skeletonLine} ${styles.skeletonDate}`} />
      </div>
      <div className={styles.colStatus}>
        <div className={`${styles.skeletonLine} ${styles.skeletonBadge}`} />
      </div>
      <div className={styles.colAction}>
        <div className={`${styles.skeletonLine} ${styles.skeletonAction}`} />
      </div>
    </div>
  );
});

// ------------------------------------------------------------------
// A single order row. Memoized so a socket-driven status change on one
// order never re-renders every other row in the list.
// ------------------------------------------------------------------
const OrderRow = memo(function OrderRow({ order }) {
  const [imgSrc, setImgSrc] = useState(order.items[0]?.image || FALLBACK_IMAGE);
  const handleImgError = useCallback(() => setImgSrc(FALLBACK_IMAGE), []);

  const status = STATUS_META[order.orderStatus] || STATUS_META.placed;
  const mainItem = order.items[0];
  const extraQty = order.items.length - 1;
  const priceValue = Number(mainItem.subtotal) || 0;

  return (
    <div className={styles.orderRow}>
      <div className={styles.colProduct}>
        <div className={styles.orderImage}>
          <img src={imgSrc} alt={mainItem.name} onError={handleImgError} loading="lazy" />
        </div>
        <div className={styles.productMeta}>
          {/* Desktop: shows name only. Mobile: name + price share this line */}
          <div className={styles.metaTopRow}>
            <p className={styles.orderProductName}>{mainItem.name}</p>
            <p className={styles.orderPriceMobile}>
              <FaRupeeSign size={10} />
              {priceValue.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Mobile only: more-items tag + view details link */}
          <div className={styles.metaBottomRow}>
            <span className={styles.moreItemsTag}>
              {extraQty > 0 ? `+${extraQty} more item${extraQty !== 1 ? "s" : ""}` : ""}
            </span>
            <Link to={`/orders/${order._id}`} className={styles.viewDetailsMobile}>
              View Details <FaChevronRight size={9} />
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.colPrice} data-label="Price">
        <p className={styles.orderPrice}>
          <FaRupeeSign size={11} />
          {priceValue.toLocaleString("en-IN")}
        </p>
      </div>

      <div className={styles.colQty} data-label="Qty">
        <p className={styles.orderQty}>{mainItem.quantity ?? 1}</p>
      </div>

      <div className={styles.colDate} data-label="Order Date">
        <p className={styles.orderDate}>
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </p>
      </div>

      <div className={styles.colStatus} data-label="Status">
        <span className={`${styles.statusBadge} ${styles[status.className]}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <div className={styles.colAction}>
        <Link to={`/orders/${order._id}`} className={styles.viewDetailsBtn}>
          View Details <FaChevronRight size={10} />
        </Link>
      </div>
    </div>
  );
});

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const OrdersPage = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const debouncedSearch = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  // Shared throttled refetch — used for the initial load AND every
  // socket-triggered refresh, so a burst of events (seller confirms +
  // shipping updates arriving together) can't spam the API.
  const throttledRefetch = useThrottledCallback(() => {
    dispatch(fetchMyOrders());
  }, FETCH_THROTTLE_MS);

  useEffect(() => {
    if (isAuthenticated) throttledRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ✅ SOCKET.IO — any status/shipping change on any of this customer's
  // orders re-pulls the authoritative list from REST. No full page reload,
  // no invented client-side merge logic — MongoDB stays the source of truth.
  useOrderSocketEvents({
    onSellerConfirmed: throttledRefetch,
    onSellerRejected: throttledRefetch,
    onAdminConfirmed: throttledRefetch,
    onAdminRejected: throttledRefetch,
    onShippingUpdated: throttledRefetch,
  });

  // Never trust stored data blindly — drop anything malformed before it
  // reaches the render tree or gets used to compute totals.
  const validOrders = useMemo(
    () => (Array.isArray(myOrders) ? myOrders.filter(isValidOrder) : []),
    [myOrders],
  );

  const statusFilteredOrders = useMemo(() => {
    if (activeFilter === "all") return validOrders;
    if (activeFilter === "return")
      return validOrders.filter((o) => o.orderStatus === "return_requested");
    return validOrders.filter((o) => o.orderStatus === activeFilter);
  }, [validOrders, activeFilter]);

  // Client-side search, driven by the debounced term so typing doesn't
  // trigger a re-filter (and re-render) on every keystroke. Matches on
  // product name or order id.
  const filteredOrders = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return statusFilteredOrders;
    return statusFilteredOrders.filter((order) => {
      const nameMatch = order.items.some((it) =>
        (it.name || "").toLowerCase().includes(query),
      );
      const idMatch = order._id.toLowerCase().includes(query);
      return nameMatch || idMatch;
    });
  }, [statusFilteredOrders, debouncedSearch]);

  // Reset pagination whenever the effective list changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter, debouncedSearch, validOrders.length]);

  const visibleOrders = useMemo(
    () => filteredOrders.slice(0, visibleCount),
    [filteredOrders, visibleCount],
  );

  const hasMore = visibleCount < filteredOrders.length;

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredOrders.length));
  }, [filteredOrders.length]);

  const throttledLoadMore = useThrottledCallback(loadMore, 600);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) throttledLoadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, throttledLoadMore]);

  const summary = useMemo(() => {
    const totalOrders = validOrders.length;
    const delivered = validOrders.filter((o) => o.orderStatus === "delivered").length;
    const inProgress = validOrders.filter((o) =>
      ["placed", "processing", "shipped"].includes(o.orderStatus),
    ).length;
    const totalSpent = validOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    return { totalOrders, delivered, inProgress, totalSpent };
  }, [validOrders]);

  const handleSearchChange = useCallback((e) => {
    // Basic input hygiene: cap length so a pasted wall of text can't blow
    // up the filter pass.
    setSearchTerm(e.target.value.slice(0, 100));
  }, []);

  const handleFilterClick = useCallback((id) => {
    setActiveFilter(id);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.ordersPage}>
        <div className={styles.container}>
          <div className={styles.pageTop}>
            <h1 className={styles.pageTitle}>Your Orders</h1>
            <p className={styles.pageSubtitle}>
              Track, view and manage all your orders in one place.
            </p>
          </div>

          <div className={styles.layoutGrid}>
            <main className={styles.mainPanel}>
              <div className={styles.controlsRow}>
                <div className={styles.filterTabs}>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`${styles.filterTab} ${
                        activeFilter === f.id ? styles.filterTabActive : ""
                      }`}
                      onClick={() => handleFilterClick(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {validOrders.length > 0 && (
                  <div className={styles.searchWrapper}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search by product or order ID"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      aria-label="Search your orders"
                      maxLength={100}
                    />
                  </div>
                )}
              </div>

              {isLoading && (
                <div className={styles.ordersTable}>
                  <div className={styles.tableHead}>
                    <span className={styles.colProduct}>Product</span>
                    <span className={styles.colPrice}>Price</span>
                    <span className={styles.colQty}>Qty</span>
                    <span className={styles.colDate}>Order Date</span>
                    <span className={styles.colStatus}>Status</span>
                    <span className={styles.colAction}>Action</span>
                  </div>
                  <div className={styles.ordersList}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <OrderRowSkeleton key={`order-skeleton-${i}`} />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && validOrders.length === 0 && (
                <div className={styles.emptyState}>
                  <FaBoxOpen size={34} />
                  <h3>No orders yet</h3>
                  <p>Your future favorites are waiting to be found.</p>
                  <Link to="/shop" className={styles.shopBtn}>
                    Start Shopping
                  </Link>
                </div>
              )}

              {!isLoading && validOrders.length > 0 && (
                <div className={styles.ordersTable}>
                  <div className={styles.tableHead}>
                    <span className={styles.colProduct}>Product</span>
                    <span className={styles.colPrice}>Price</span>
                    <span className={styles.colQty}>Qty</span>
                    <span className={styles.colDate}>Order Date</span>
                    <span className={styles.colStatus}>Status</span>
                    <span className={styles.colAction}>Action</span>
                  </div>

                  <div className={styles.ordersList}>
                    {filteredOrders.length === 0 ? (
                      <div className={styles.emptyState}>
                        <FaBoxOpen size={30} />
                        <h3>Nothing here</h3>
                        <p>No orders match this filter or search yet.</p>
                      </div>
                    ) : (
                      <>
                        {visibleOrders.map((order) => (
                          <OrderRow key={order._id} order={order} />
                        ))}

                        {hasMore ? (
                          <div className={styles.loadMoreRow} ref={sentinelRef}>
                            <button
                              type="button"
                              className={styles.loadMoreBtn}
                              onClick={loadMore}
                            >
                              Load more
                            </button>
                          </div>
                        ) : (
                          <div className={styles.noMoreOrders}>
                            <FaGem size={13} />
                            You have no more orders to show.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </main>

            {!isLoading && validOrders.length > 0 && (
              <aside className={styles.sidebar}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <FaGem className={styles.summaryIcon} />
                    <h2>Order Summary</h2>
                  </div>
                  <div className={styles.summaryDivider} />

                  <div className={styles.summaryRow}>
                    <span>Total Orders</span>
                    <span className={styles.summaryValue}>{summary.totalOrders}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>In Progress</span>
                    <span className={styles.summaryValue}>{summary.inProgress}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Delivered</span>
                    <span className={styles.summaryValue}>{summary.delivered}</span>
                  </div>

                  <div className={styles.summaryDivider} />

                  <div className={styles.summaryRowTotal}>
                    <span>Total Spent</span>
                    <span className={styles.summaryTotalValue}>
                      <FaRupeeSign size={13} />
                      {summary.totalSpent.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className={styles.summaryNote}>
                    Across all orders placed on your account.
                  </p>

                  <Link to="/shop" className={styles.summaryCta}>
                    CONTINUE SHOPPING
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrdersPage;