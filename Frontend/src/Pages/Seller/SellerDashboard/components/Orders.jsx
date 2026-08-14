// src/Pages/Seller/SellerDashboard/components/Orders.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiTruck,
  FiCheck,
  FiX,
  FiPackage,
  FiUser,
  FiSearch,
  FiEye,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./Orders.module.css";
import {
  fetchSellerOrders,
  updateSellerOrder,
} from "../../../../redux/slices/orderSlice";
import * as orderApi from "../../../../api/orderApi.js";

// ✅ SOCKET.IO — real-time order updates for sellers
import useOrderSocketEvents from "../../../../hooks/useOrderSocketEvents.js";

const STATUS_OPTIONS = [
  "placed",
  "processing",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_COLORS = {
  placed: { bg: "#fef3c7", text: "#92400e" },
  processing: { bg: "#dbeafe", text: "#1e40af" },
  ready_to_ship: { bg: "#ede9fe", text: "#5b21b6" },
  shipped: { bg: "#cffafe", text: "#0e7490" },
  in_transit: { bg: "#e0e7ff", text: "#3730a3" },
  out_for_delivery: { bg: "#fef3c7", text: "#92400e" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const FULFILLMENT_LABEL = {
  PENDING_SELLER_CONFIRMATION: "Action Required",
  SELLER_CONFIRMED: "Awaiting Admin",
  SELLER_REJECTED: "Rejected",
  ADMIN_APPROVED: "Approved",
  ADMIN_REJECTED: "Rejected",
  SHIPMENT_CREATED: "Shipment Created",
  AWB_PENDING: "AWB Pending",
  AWB_ASSIGNED: "AWB Assigned",
  READY_TO_SHIP: "Ready to Ship",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  RTO: "Returned",
  RETURN_INITIATED: "Return Initiated",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
  SHIPROCKET_FAILED: "Shiprocket Failed",
};

const FULFILLMENT_COLORS = {
  PENDING_SELLER_CONFIRMATION: { bg: "#fef3c7", text: "#92400e" },
  SELLER_CONFIRMED: { bg: "#dbeafe", text: "#1e40af" },
  SELLER_REJECTED: { bg: "#fee2e2", text: "#991b1b" },
  ADMIN_APPROVED: { bg: "#dcfce7", text: "#16a34a" },
  ADMIN_REJECTED: { bg: "#fee2e2", text: "#991b1b" },
  SHIPMENT_CREATED: { bg: "#ede9fe", text: "#5b21b6" },
  AWB_PENDING: { bg: "#fef3c7", text: "#92400e" },
  AWB_ASSIGNED: { bg: "#cffafe", text: "#0e7490" },
  READY_TO_SHIP: { bg: "#ede9fe", text: "#5b21b6" },
  PICKED_UP: { bg: "#e0e7ff", text: "#3730a3" },
  IN_TRANSIT: { bg: "#e0e7ff", text: "#3730a3" },
  OUT_FOR_DELIVERY: { bg: "#fef3c7", text: "#92400e" },
  DELIVERED: { bg: "#dcfce7", text: "#16a34a" },
  RTO: { bg: "#fee2e2", text: "#991b1b" },
  RETURN_INITIATED: { bg: "#fef3c7", text: "#92400e" },
  RETURNED: { bg: "#fee2e2", text: "#991b1b" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
  SHIPROCKET_FAILED: { bg: "#fee2e2", text: "#991b1b" },
};

// Debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Skeleton Loader
const SkeletonLoader = ({ count = 10 }) => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonRow}>
            <div className={styles.skeletonOrderId}></div>
            <div className={styles.skeletonBadge}></div>
            <div className={styles.skeletonBadge}></div>
          </div>
          <div className={styles.skeletonRow}>
            <div className={styles.skeletonField}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.skeletonField}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
            <div className={styles.skeletonField}>
              <div className={styles.skeletonLabel}></div>
              <div className={styles.skeletonValue}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const { sellerOrders, isLoading } = useSelector((state) => state.orders);

  const [actioningId, setActioningId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allOrdersLoaded, setAllOrdersLoaded] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedStatusFilter = useDebounce(statusFilter, 300);
  const debouncedSortBy = useDebounce(sortBy, 300);

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  useEffect(() => {
    setVisibleCount(10);
    setAllOrdersLoaded(false);
  }, [debouncedSearchTerm, debouncedStatusFilter, debouncedSortBy]);

  // ✅ SOCKET.IO — a brand-new order shows up here the instant it's paid
  // for, and any admin action on an already-visible order refreshes the
  // list too. Every branch just re-pulls from REST — no client-side order
  // synthesis, so there's no risk of shape drift or duplicate rows.
  useOrderSocketEvents({
    onOrderCreated: () => dispatch(fetchSellerOrders()),
    onAdminConfirmed: () => dispatch(fetchSellerOrders()),
    onAdminRejected: () => dispatch(fetchSellerOrders()),
    onShippingUpdated: () => dispatch(fetchSellerOrders()),
  });

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateSellerOrder({ id, status })).unwrap();
      toast.success("Order status updated");
      dispatch(fetchSellerOrders());
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  const handleConfirm = async (orderId) => {
    setActioningId(orderId);
    try {
      await orderApi.sellerConfirmOrder(orderId);
      toast.success("Order confirmed");
      dispatch(fetchSellerOrders());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm order");
    } finally {
      setActioningId(null);
    }
  };

  const openRejectDialog = (orderId) => {
    setRejectingId(orderId);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActioningId(rejectingId);
    try {
      await orderApi.sellerRejectOrder(rejectingId, rejectReason.trim());
      toast.success("Order rejected");
      setRejectingId(null);
      dispatch(fetchSellerOrders());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject order");
    } finally {
      setActioningId(null);
    }
  };

  const openOrderPopup = (order) => {
    setSelectedOrder(order);
    document.body.style.overflow = "hidden";
  };

  const closeOrderPopup = () => {
    setSelectedOrder(null);
    document.body.style.overflow = "auto";
  };

  const getStatusStyle = (status) => {
    return STATUS_COLORS[status] || { bg: "#f3f4f6", text: "#6b7280" };
  };

  const getFulfillmentStyle = (status) => {
    return FULFILLMENT_COLORS[status] || { bg: "#f3f4f6", text: "#6b7280" };
  };

  const getFilteredOrders = () => {
    let filtered = [...sellerOrders];

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(term) ||
          order.customer?.fullName?.toLowerCase().includes(term) ||
          order.customer?.phone?.includes(term),
      );
    }

    if (debouncedStatusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.orderStatus === debouncedStatusFilter,
      );
    }

    switch (debouncedSortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highest":
        filtered.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        break;
      case "lowest":
        filtered.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const visibleOrders = filteredOrders.slice(0, visibleCount);

  // Load more orders with throttling - 10 cards in first 1 second
  const loadMoreOrders = useCallback(() => {
    if (
      isLoadingMore ||
      allOrdersLoaded ||
      visibleCount >= filteredOrders.length
    ) {
      if (visibleCount >= filteredOrders.length) {
        setAllOrdersLoaded(true);
      }
      return;
    }

    setIsLoadingMore(true);
    let currentCount = visibleCount;
    const maxCount = Math.min(visibleCount + 10, filteredOrders.length);
    const batchSize = 10;
    const delayPerBatch = 1000; // 1 second for 10 cards

    const loadNextBatch = () => {
      const nextCount = Math.min(currentCount + batchSize, maxCount);
      setVisibleCount(nextCount);
      currentCount = nextCount;

      if (currentCount < maxCount) {
        setTimeout(loadNextBatch, delayPerBatch);
      } else {
        setIsLoadingMore(false);
        if (currentCount >= filteredOrders.length) {
          setAllOrdersLoaded(true);
        }
      }
    };

    setTimeout(loadNextBatch, 200);
  }, [visibleCount, filteredOrders.length, isLoadingMore, allOrdersLoaded]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (visibleOrders.length === 0 || allOrdersLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreOrders();
        }
      },
      { threshold: 0.1 },
    );

    const sentinel = document.getElementById("orders-sentinel");
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [visibleOrders, allOrdersLoaded, loadMoreOrders]);

  const showLoadingState = isLoading;

  return (
    <div className={styles.ordersWrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Orders</h2>
          <span className={styles.orderCount}>
            {filteredOrders?.length || 0} orders
          </span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>
      </div>

      {showLoadingState && filteredOrders.length === 0 ? (
        <SkeletonLoader count={10} />
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <FiPackage size={48} className={styles.emptyIcon} />
          <h3>No orders found</h3>
          <p>
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "When you receive orders, they'll appear here"}
          </p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {visibleOrders.map((order) => {
            const statusStyle = getStatusStyle(order.orderStatus);
            const fulfillmentStyle = getFulfillmentStyle(
              order.fulfillmentStatus,
            );
            const isActionRequired =
              order.fulfillmentStatus === "PENDING_SELLER_CONFIRMATION";
            const customer = order?.customer || {};
            const totalAmount = order.totalAmount || 0;

            return (
              <div
                key={order._id}
                className={styles.orderCard}
                onClick={() => openOrderPopup(order)}
              >
                <div className={styles.orderCardContent}>
                  <div className={styles.orderCardLeft}>
                    <div className={styles.orderId}>
                      #{order.orderNumber || "N/A"}
                    </div>
                    <div className={styles.orderCardFields}>
                      <div className={styles.orderCardField}>
                        <span className={styles.fieldLabel}>Customer</span>
                        <span className={styles.fieldValue}>
                          {customer.fullName || "N/A"}
                        </span>
                      </div>
                      <div className={styles.orderCardField}>
                        <span className={styles.fieldLabel}>Total</span>
                        <span className={styles.fieldValue}>
                          {formatCurrency(order.sellerSubtotal || 0)}
                        </span>
                      </div>
                      <div className={styles.orderCardField}>
                        <span className={styles.fieldLabel}>Date</span>
                        <span className={styles.fieldValue}>
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className={styles.orderCardField}>
                        <span className={styles.fieldLabel}>Items</span>
                        <span className={styles.fieldValue}>
                          {order.items?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.orderCardRight}>
                    <div className={styles.orderCardBadges}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {order.orderStatus || "N/A"}
                      </span>
                      <span
                        className={styles.fulfillmentBadge}
                        style={{
                          backgroundColor: fulfillmentStyle.bg,
                          color: fulfillmentStyle.text,
                        }}
                      >
                        {FULFILLMENT_LABEL[order.fulfillmentStatus] ||
                          order.fulfillmentStatus ||
                          "N/A"}
                      </span>
                      {isActionRequired && (
                        <span className={styles.actionRequiredBadge}>⚡</span>
                      )}
                    </div>
                    <span className={styles.orderCardView}>
                      <FiEye size={14} />
                      View
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {!allOrdersLoaded && filteredOrders.length > visibleCount && (
            <div id="orders-sentinel" className={styles.sentinel} />
          )}
          {isLoadingMore && (
            <div className={styles.loadingMore}>
              <div className={styles.spinnerSmall}></div>
              <span>Loading more orders...</span>
            </div>
          )}
        </div>
      )}

      {/* Order Popup */}
      {selectedOrder && (
        <div className={styles.popupOverlay} onClick={closeOrderPopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.popupClose} onClick={closeOrderPopup}>
              <FiX size={20} />
            </button>

            <div className={styles.popupContent}>
              <div className={styles.popupHeader}>
                <div className={styles.popupOrderId}>
                  #{selectedOrder.orderNumber}
                </div>
                <div className={styles.popupBadges}>
                  <span
                    className={styles.popupStatusBadge}
                    style={{
                      backgroundColor: getStatusStyle(selectedOrder.orderStatus)
                        .bg,
                      color: getStatusStyle(selectedOrder.orderStatus).text,
                    }}
                  >
                    {selectedOrder.orderStatus || "N/A"}
                  </span>
                  <span
                    className={styles.popupFulfillmentBadge}
                    style={{
                      backgroundColor: getFulfillmentStyle(
                        selectedOrder.fulfillmentStatus,
                      ).bg,
                      color: getFulfillmentStyle(
                        selectedOrder.fulfillmentStatus,
                      ).text,
                    }}
                  >
                    {FULFILLMENT_LABEL[selectedOrder.fulfillmentStatus] ||
                      selectedOrder.fulfillmentStatus ||
                      "N/A"}
                  </span>
                </div>
              </div>

              <div className={styles.popupBody}>
                <div className={styles.popupSection}>
                  <h4>
                    <FiUser className={styles.popupSectionIcon} /> Customer
                  </h4>
                  <div className={styles.popupCompactGrid}>
                    <div className={styles.popupCompactItem}>
                      <span className={styles.popupLabel}>Name</span>
                      <span className={styles.popupValue}>
                        {selectedOrder.customer?.fullName || "N/A"}
                      </span>
                    </div>
                    <div className={styles.popupCompactItem}>
                      <span className={styles.popupLabel}>Phone</span>
                      <span className={styles.popupValue}>
                        {selectedOrder.customer?.phone || "N/A"}
                      </span>
                    </div>
                    <div className={styles.popupCompactItem}>
                      <span className={styles.popupLabel}>Email</span>
                      <span className={styles.popupValue}>
                        {selectedOrder.customer?.email || "N/A"}
                      </span>
                    </div>
                    <div className={styles.popupCompactItem}>
                      <span className={styles.popupLabel}>Address</span>
                      <span className={styles.popupValue}>
                        {selectedOrder.customer?.addressLine1
                          ? `${selectedOrder.customer.addressLine1}, ${selectedOrder.customer.city || ""}, ${selectedOrder.customer.state || ""} - ${selectedOrder.customer.pincode || ""}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.popupSection}>
                  <h4>
                    <FiPackage className={styles.popupSectionIcon} /> Items
                  </h4>
                  <div className={styles.popupItems}>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className={styles.popupItemRow}>
                        <div className={styles.popupItemLeft}>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name || "Product"}
                              className={styles.popupItemImage}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          )}
                          <div className={styles.popupItemDetails}>
                            <span className={styles.popupItemName}>
                              {item.name || "Product"}
                            </span>
                            <span className={styles.popupItemSku}>
                              SKU: {item.sku || "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className={styles.popupItemRight}>
                          <span className={styles.popupItemQty}>
                            ×{item.quantity || 0}
                          </span>
                          <span className={styles.popupItemPrice}>
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.shipping &&
                  (selectedOrder.shipping.courierName ||
                    selectedOrder.shipping.awbCode) && (
                    <div className={styles.popupSection}>
                      <h4>
                        <FiTruck className={styles.popupSectionIcon} /> Shipping
                      </h4>
                      <div className={styles.popupCompactShipping}>
                        {selectedOrder.shipping.courierName && (
                          <span className={styles.popupCompactShippingItem}>
                            <strong>Courier:</strong>{" "}
                            {selectedOrder.shipping.courierName}
                          </span>
                        )}
                        {selectedOrder.shipping.awbCode && (
                          <span className={styles.popupCompactShippingItem}>
                            <strong>AWB:</strong>{" "}
                            {selectedOrder.shipping.awbCode}
                          </span>
                        )}
                        {selectedOrder.shipping.status && (
                          <span className={styles.popupCompactShippingItem}>
                            <strong>Status:</strong>{" "}
                            {selectedOrder.shipping.status}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {selectedOrder.fulfillmentStatus === "SELLER_REJECTED" &&
                  selectedOrder.sellerRejectionReason && (
                    <div className={styles.popupRejection}>
                      <FiX size={14} />
                      <span>{selectedOrder.sellerRejectionReason}</span>
                    </div>
                  )}

                {selectedOrder.fulfillmentStatus ===
                  "PENDING_SELLER_CONFIRMATION" && (
                  <div className={styles.popupActions}>
                    <button
                      className={styles.confirmBtn}
                      disabled={actioningId === selectedOrder._id}
                      onClick={() => {
                        handleConfirm(selectedOrder._id);
                        closeOrderPopup();
                      }}
                    >
                      <FiCheck size={14} />
                      {actioningId === selectedOrder._id
                        ? "Confirming..."
                        : "Confirm"}
                    </button>
                    <button
                      className={styles.rejectBtn}
                      disabled={actioningId === selectedOrder._id}
                      onClick={() => {
                        openRejectDialog(selectedOrder._id);
                        closeOrderPopup();
                      }}
                    >
                      <FiX size={14} />
                      Reject
                    </button>
                  </div>
                )}

                <div className={styles.popupFooter}>
                  <span className={styles.popupEarnings}>
                    Earnings:{" "}
                    <strong>
                      {formatCurrency(selectedOrder.sellerSubtotal)}
                    </strong>
                  </span>
                  <span
                    className={`${styles.popupPaymentStatus} ${styles[selectedOrder.paymentStatus || ""]}`}
                  >
                    {selectedOrder.paymentStatus || "N/A"}
                  </span>
                  <select
                    className={styles.popupStatusSelect}
                    value={selectedOrder.orderStatus || "placed"}
                    onChange={(e) => {
                      handleStatusChange(selectedOrder._id, e.target.value);
                      const updatedOrder = {
                        ...selectedOrder,
                        orderStatus: e.target.value,
                      };
                      setSelectedOrder(updatedOrder);
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectingId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reject Order</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setRejectingId(null)}
              >
                <FiX size={20} />
              </button>
            </div>
            <p className={styles.modalSub}>
              Please provide a reason for rejecting this order.
            </p>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Product unavailable, Inventory issue..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setRejectingId(null)}
                disabled={actioningId === rejectingId}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmRejectBtn}
                disabled={actioningId === rejectingId || !rejectReason.trim()}
                onClick={submitReject}
              >
                {actioningId === rejectingId ? "Rejecting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
