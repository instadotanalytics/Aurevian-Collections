// src/Pages/Orders/OrdersPage.jsx
import React, { useEffect, useState, useMemo } from "react";
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
} from "react-icons/fa";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import styles from "./OrdersPage.module.css";
import { fetchMyOrders } from "../../redux/slices/orderSlice";

// ✅ SOCKET.IO — real-time order updates
import useOrderSocketEvents from "../../hooks/useOrderSocketEvents.js";

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

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyOrders());
  }, [dispatch, isAuthenticated]);

  // ✅ SOCKET.IO — any status/shipping change on any of this customer's
  // orders re-pulls the authoritative list from REST. No full page reload,
  // no invented client-side merge logic — MongoDB stays the source of truth.
  useOrderSocketEvents({
    onSellerConfirmed: () => dispatch(fetchMyOrders()),
    onSellerRejected: () => dispatch(fetchMyOrders()),
    onAdminConfirmed: () => dispatch(fetchMyOrders()),
    onAdminRejected: () => dispatch(fetchMyOrders()),
    onShippingUpdated: () => dispatch(fetchMyOrders()),
  });

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return myOrders;
    if (activeFilter === "return")
      return myOrders.filter((o) => o.orderStatus === "return_requested");
    return myOrders.filter((o) => o.orderStatus === activeFilter);
  }, [myOrders, activeFilter]);

  const summary = useMemo(() => {
    const totalOrders = myOrders.length;
    const delivered = myOrders.filter(
      (o) => o.orderStatus === "delivered",
    ).length;
    const inProgress = myOrders.filter((o) =>
      ["placed", "processing", "shipped"].includes(o.orderStatus),
    ).length;
    const totalSpent = myOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    return { totalOrders, delivered, inProgress, totalSpent };
  }, [myOrders]);

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <div className={styles.ordersPage}>
        <div className={styles.container}>
          <div className={styles.pageTop}>
            <h1 className={styles.pageTitle}>My Orders</h1>
            <p className={styles.pageSubtitle}>
              Track, view and manage all your orders in one place.
            </p>
          </div>

          <div className={styles.layoutGrid}>
            <main className={styles.mainPanel}>
              <div className={styles.filterTabs}>
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    className={`${styles.filterTab} ${
                      activeFilter === f.id ? styles.filterTabActive : ""
                    }`}
                    onClick={() => setActiveFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {isLoading && (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading your orders...</p>
                </div>
              )}

              {!isLoading && myOrders.length === 0 && (
                <div className={styles.emptyState}>
                  <FaBoxOpen size={34} />
                  <h3>No orders yet</h3>
                  <p>Your future favorites are waiting to be found.</p>
                  <Link to="/shop" className={styles.shopBtn}>
                    Start Shopping
                  </Link>
                </div>
              )}

              {!isLoading && myOrders.length > 0 && (
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
                    {filteredOrders.map((order) => {
                      const status =
                        STATUS_META[order.orderStatus] || STATUS_META.placed;
                      const mainItem = order.items[0];
                      const extraQty = order.items.length - 1;

                      return (
                        <div className={styles.orderRow} key={order._id}>
                          <div className={styles.colProduct}>
                            <div className={styles.orderImage}>
                              <img src={mainItem.image} alt={mainItem.name} />
                            </div>
                            <div className={styles.productMeta}>
                              {/* Desktop: shows name only. Mobile: name + price share this line */}
                              <div className={styles.metaTopRow}>
                                <p className={styles.orderProductName}>
                                  {mainItem.name}
                                </p>
                                <p className={styles.orderPriceMobile}>
                                  <FaRupeeSign size={10} />
                                  {mainItem.subtotal.toLocaleString("en-IN")}
                                </p>
                              </div>

                              {/* Mobile only: more-items tag + view details link */}
                              <div className={styles.metaBottomRow}>
                                <span className={styles.moreItemsTag}>
                                  {extraQty > 0
                                    ? `+${extraQty} more item${
                                        extraQty !== 1 ? "s" : ""
                                      }`
                                    : ""}
                                </span>
                                <Link
                                  to={`/orders/${order._id}`}
                                  className={styles.viewDetailsMobile}
                                >
                                  View Details <FaChevronRight size={9} />
                                </Link>
                              </div>
                            </div>
                          </div>

                          <div className={styles.colPrice} data-label="Price">
                            <p className={styles.orderPrice}>
                              <FaRupeeSign size={11} />
                              {mainItem.subtotal.toLocaleString("en-IN")}
                            </p>
                          </div>

                          <div className={styles.colQty} data-label="Qty">
                            <p className={styles.orderQty}>
                              {mainItem.quantity}
                            </p>
                          </div>

                          <div
                            className={styles.colDate}
                            data-label="Order Date"
                          >
                            <p className={styles.orderDate}>
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>

                          <div className={styles.colStatus} data-label="Status">
                            <span
                              className={`${styles.statusBadge} ${
                                styles[status.className]
                              }`}
                            >
                              {status.icon} {status.label}
                            </span>
                          </div>

                          <div className={styles.colAction}>
                            <Link
                              to={`/orders/${order._id}`}
                              className={styles.viewDetailsBtn}
                            >
                              View Details <FaChevronRight size={10} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {filteredOrders.length > 0 && (
                      <div className={styles.noMoreOrders}>
                        <FaGem size={13} />
                        You have no more orders to show.
                      </div>
                    )}

                    {filteredOrders.length === 0 && (
                      <div className={styles.emptyState}>
                        <FaBoxOpen size={30} />
                        <h3>Nothing here</h3>
                        <p>No orders match this filter yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>

            {!isLoading && myOrders.length > 0 && (
              <aside className={styles.sidebar}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <FaGem className={styles.summaryIcon} />
                    <h2>Order Summary</h2>
                  </div>
                  <div className={styles.summaryDivider} />

                  <div className={styles.summaryRow}>
                    <span>Total Orders</span>
                    <span className={styles.summaryValue}>
                      {summary.totalOrders}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>In Progress</span>
                    <span className={styles.summaryValue}>
                      {summary.inProgress}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Delivered</span>
                    <span className={styles.summaryValue}>
                      {summary.delivered}
                    </span>
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
