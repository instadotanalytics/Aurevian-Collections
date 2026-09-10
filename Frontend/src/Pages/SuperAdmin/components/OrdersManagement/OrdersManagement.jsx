// src/Pages/SuperAdmin/components/OrdersManagement/OrdersManagement.jsx
import React, { useEffect, useState, useCallback } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiTruck,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiPackage,
  FiInbox,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiShoppingBag,
  FiAlertCircle,
  FiCreditCard,
  FiClock, // new
  FiCheckCircle, // new
  FiAlertTriangle, // new
  FiXCircle, // new
  FiSlash, // new
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./OrdersManagement.module.css";
import * as orderApi from "../../../../api/orderApi.js";

// ✅ SOCKET.IO — real-time order updates for super admin
import useOrderSocketEvents from "../../../../hooks/useOrderSocketEvents.js";

const TABS = [
  {
    key: "SELLER_CONFIRMED",
    label: "Awaiting Approval",
    icon: FiClock,
    accent: "pending",
  },
  {
    key: "ADMIN_APPROVED",
    label: "Approved",
    icon: FiCheckCircle,
    accent: "approved",
  },
  {
    key: "AWB_PENDING",
    label: "AWB Pending",
    icon: FiPackage,
    accent: "pending",
  },
  { key: "AWB_ASSIGNED", label: "Shipped", icon: FiTruck, accent: "suspended" },
  {
    key: "SHIPROCKET_FAILED",
    label: "Exceptions",
    icon: FiAlertTriangle,
    accent: "rejected",
  },
  {
    key: "SELLER_REJECTED",
    label: "Seller Rejected",
    icon: FiXCircle,
    accent: "rejected",
  },
  {
    key: "ADMIN_REJECTED",
    label: "Admin Rejected",
    icon: FiSlash,
    accent: "rejected",
  },
];

// Accent color used for the active tab's icon + underline dot
const TAB_ACCENT_COLOR = {
  pending: "#d97706",
  approved: "#10b981",
  suspended: "#3b82f6",
  rejected: "#ef4444",
};

const FULFILLMENT_LABEL = {
  PENDING_SELLER_CONFIRMATION: "Awaiting Seller",
  SELLER_CONFIRMED: "Awaiting Fulfillment Approval",
  SELLER_REJECTED: "Seller Rejected",
  ADMIN_APPROVED: "Approved — Processing",
  ADMIN_REJECTED: "Admin Rejected",
  SHIPMENT_CREATED: "Shipment Created",
  AWB_PENDING: "Shipment Created — AWB Pending",
  AWB_ASSIGNED: "AWB Assigned",
  READY_TO_SHIP: "Ready to Ship",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  RTO: "Returned to Origin",
  RETURN_INITIATED: "Return in Progress",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
  SHIPROCKET_FAILED: "Shiprocket Failed",
};

// Same five-hue badge language used across the admin app: grey = neutral,
// amber = pending / awaiting action, blue = in progress, green = done,
// red = stopped / rejected / failed.
const FULFILLMENT_GROUPS = {
  PENDING_SELLER_CONFIRMATION: "pending",
  SELLER_CONFIRMED: "pending",
  SELLER_REJECTED: "rejected",
  ADMIN_APPROVED: "approved",
  ADMIN_REJECTED: "rejected",
  SHIPMENT_CREATED: "suspended",
  AWB_PENDING: "pending",
  AWB_ASSIGNED: "suspended",
  READY_TO_SHIP: "suspended",
  PICKED_UP: "suspended",
  IN_TRANSIT: "suspended",
  OUT_FOR_DELIVERY: "suspended",
  DELIVERED: "approved",
  RTO: "rejected",
  RETURN_INITIATED: "rejected",
  RETURNED: "rejected",
  CANCELLED: "rejected",
  SHIPROCKET_FAILED: "rejected",
};

const PAYMENT_GROUPS = {
  paid: "approved",
  pending: "pending",
  failed: "rejected",
  refunded: "suspended",
};

const GROUP_CLASS = {
  neutral: "statusNeutral",
  pending: "statusPending",
  approved: "statusApproved",
  suspended: "statusSuspended",
  rejected: "statusRejected",
};

// Card skeleton loader — mirrors the row skeleton used across SuperAdmin tables
const SkeletonLoader = ({ count = 4 }) => (
  <div className={styles.skeletonList}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <div className={styles.skeletonCardHeader}>
          <div className={styles.skeletonHeaderLeft}>
            <div
              className={styles.skeletonLine}
              style={{ width: "120px" }}
            ></div>
            <div
              className={styles.skeletonLineShort}
              style={{ width: "80px" }}
            ></div>
          </div>
          <div className={styles.skeletonPill}></div>
        </div>
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine} style={{ width: "45%" }}></div>
          <div
            className={styles.skeletonLineShort}
            style={{ width: "70%" }}
          ></div>
        </div>
        <div className={styles.skeletonMetaRow}>
          <div className={styles.skeletonMetaBlock}></div>
          <div className={styles.skeletonMetaBlock}></div>
          <div className={styles.skeletonMetaBlock}></div>
        </div>
        <div className={styles.skeletonActionsRow}>
          <div className={styles.skeletonBtn}></div>
          <div className={styles.skeletonBtn}></div>
        </div>
      </div>
    ))}
  </div>
);

const OrdersManagement = () => {
  const [activeTab, setActiveTab] = useState("SELLER_CONFIRMED");
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadOrders = useCallback(async (status) => {
    setIsLoading(true);
    try {
      const res = await orderApi.getAdminOrders(status);
      if (res.success) {
        setOrders(res.data);
      } else {
        toast.error(res.message || "Failed to load orders");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab, loadOrders]);

  // ✅ SOCKET.IO — real-time order updates for super admin
  useOrderSocketEvents({
    onOrderCreated: () => loadOrders(activeTab),
    onSellerConfirmed: () => loadOrders(activeTab),
    onShippingUpdated: () => loadOrders(activeTab),
  });

  const handleApprove = async (orderId) => {
    setActioningId(orderId);
    try {
      const res = await orderApi.adminApproveOrder(orderId);
      if (res.shiprocketSync?.success === false) {
        toast.error(
          res.message ||
            "Order approved, but Shiprocket synchronization failed. You can retry.",
        );
      } else {
        toast.success(
          res.message || "Order approved and forwarded to Shiprocket",
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve order");
    } finally {
      setActioningId(null);
      loadOrders(activeTab);
    }
  };

  const handleRetrySync = async (orderId) => {
    setActioningId(orderId);
    try {
      const res = await orderApi.retryOrderShiprocketSync(orderId);
      if (res.shiprocketSync?.success === false) {
        toast.error(res.message || "Shiprocket sync failed again");
      } else {
        toast.success(res.message || "Shiprocket synchronization successful");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to retry synchronization",
      );
    } finally {
      setActioningId(null);
      loadOrders(activeTab);
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
      await orderApi.adminRejectOrder(rejectingId, rejectReason.trim());
      toast.success("Order rejected");
      setRejectingId(null);
      loadOrders(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject order");
    } finally {
      setActioningId(null);
    }
  };

  const getFulfillmentBadge = (value) => {
    const group = FULFILLMENT_GROUPS[value] || "neutral";
    return {
      label: FULFILLMENT_LABEL[value] || value,
      className: styles[GROUP_CLASS[group]],
    };
  };

  const getPaymentBadge = (value) => {
    const group = PAYMENT_GROUPS[value] || "neutral";
    return {
      label: value,
      className: styles[GROUP_CLASS[group]],
    };
  };

  const showLoadingState = isLoading && orders.length === 0;

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiInbox size={60} className={styles.emptyIcon} />
      <h3>No orders in this queue</h3>
      <p>Orders will show up here once they reach this stage.</p>
    </div>
  );

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Order Fulfillment</h1>
          <span className={styles.countPill}>
            {orders.length} order{orders.length === 1 ? "" : "s"} in queue
          </span>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.headerSubtitle}>
            Review seller-confirmed orders and approve them for Shiprocket
            fulfillment
          </p>
          <button
            className={styles.refreshBtn}
            onClick={() => loadOrders(activeTab)}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabsTrack}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                style={{ "--tab-accent": TAB_ACCENT_COLOR[tab.accent] }}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon
                  size={14}
                  className={styles.tabIcon}
                  style={{
                    color: isActive ? TAB_ACCENT_COLOR[tab.accent] : undefined,
                  }}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders */}
      {showLoadingState ? (
        <SkeletonLoader count={4} />
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => {
            const fulfillmentBadge = getFulfillmentBadge(
              order.fulfillmentStatus,
            );
            const paymentBadge = getPaymentBadge(order.paymentStatus);

            return (
              <div className={styles.orderCard} key={order._id}>
                {/* Card Header — order number, date, payment badge */}
                <div className={styles.orderCardHeader}>
                  <div className={styles.orderHeaderLeft}>
                    <div className={styles.orderNumberWrap}>
                      <FiPackage size={14} className={styles.orderNumberIcon} />
                      <span className={styles.orderNumber}>
                        #{order.orderNumber}
                      </span>
                    </div>
                    <div className={styles.orderDateWrap}>
                      <FiCalendar size={12} />
                      <span className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderHeaderRight}>
                    <span
                      className={`${styles.statusBadge} ${paymentBadge.className}`}
                    >
                      <FiCreditCard size={11} />
                      {paymentBadge.label}
                    </span>
                  </div>
                </div>

                {/* Customer + Seller Info Grid */}
                <div className={styles.orderInfoGrid}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>
                      <FiUser size={12} /> Customer
                    </span>
                    <span className={styles.infoValue}>
                      {order.customerName}
                    </span>
                    <span className={styles.infoSub}>
                      <FiMapPin size={11} />
                      {order.shippingAddress?.addressLine1},{" "}
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>
                      <FiShoppingBag size={12} /> Seller
                    </span>
                    <span className={styles.infoValue}>
                      {order.seller?.storeInfo?.storeName ||
                        order.seller?.fullName ||
                        "—"}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className={styles.itemsSection}>
                  <span className={styles.sectionLabel}>Order Items</span>
                  <div className={styles.itemsList}>
                    {order.items.map((item, idx) => (
                      <div className={styles.itemRow} key={idx}>
                        <img src={item.image} alt={item.name} />
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemQty}>x{item.quantity}</span>
                        <span className={styles.itemPrice}>
                          <FaRupeeSign size={11} />
                          {item.subtotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Row */}
                <div className={styles.metaRow}>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Total Amount</span>
                    <span className={styles.metaValue}>
                      <FaRupeeSign size={11} />
                      {order.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Shipping Fee</span>
                    <span className={styles.metaValue}>
                      <FaRupeeSign size={11} />
                      {order.shippingFee.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {order.sellerConfirmedAt && (
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Seller Confirmed</span>
                      <span className={styles.metaValue}>
                        {new Date(order.sellerConfirmedAt).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Shipping Info */}
                {order.shipping &&
                  (order.shipping.shiprocketOrderId ||
                    order.shipping.awbCode ||
                    order.shipping.status ||
                    order.shipping.lastError) && (
                    <div className={styles.shippingInfo}>
                      <FiTruck size={14} className={styles.shippingIcon} />
                      <span className={styles.shippingText}>
                        {order.shipping.shiprocketOrderId
                          ? `Shiprocket #${order.shipping.shiprocketOrderId}`
                          : "No Shiprocket order yet"}
                        {order.shipping.awbCode
                          ? ` · AWB ${order.shipping.awbCode}`
                          : ""}
                        {order.shipping.status
                          ? ` · ${order.shipping.status}`
                          : ""}
                      </span>
                      {order.shipping.lastError && (
                        <span className={styles.shippingError}>
                          <FiAlertCircle size={12} />
                          {order.shipping.lastError}
                        </span>
                      )}
                    </div>
                  )}

                {/* Fulfillment Status */}
                <div className={styles.fulfillmentRow}>
                  <span
                    className={`${styles.statusBadge} ${fulfillmentBadge.className}`}
                  >
                    {fulfillmentBadge.label}
                  </span>
                  {order.fulfillmentStatus === "ADMIN_REJECTED" &&
                    order.adminRejectionReason && (
                      <span className={styles.rejectionReasonText}>
                        <FiAlertCircle size={12} />
                        Reason: {order.adminRejectionReason}
                      </span>
                    )}
                </div>

                {/* Actions */}
                {order.fulfillmentStatus === "SELLER_CONFIRMED" && (
                  <div className={styles.actionRow}>
                    <button
                      className={`${styles.actionBtn} ${styles.approveBtn}`}
                      disabled={actioningId === order._id}
                      onClick={() => handleApprove(order._id)}
                    >
                      <FiCheck size={14} />
                      <span>
                        {actioningId === order._id
                          ? "Approving..."
                          : "Approve for Shipping"}
                      </span>
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.rejectBtn}`}
                      disabled={actioningId === order._id}
                      onClick={() => openRejectDialog(order._id)}
                    >
                      <FiX size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {(order.fulfillmentStatus === "SHIPROCKET_FAILED" ||
                  order.fulfillmentStatus === "AWB_PENDING") && (
                  <div className={styles.actionRow}>
                    <button
                      className={`${styles.actionBtn} ${styles.approveBtn}`}
                      disabled={actioningId === order._id}
                      onClick={() => handleRetrySync(order._id)}
                    >
                      <FiRefreshCw size={14} />
                      <span>
                        {actioningId === order._id
                          ? "Retrying..."
                          : "Retry Shiprocket Sync"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectingId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <FiPackage size={22} />
            </div>
            <h3 className={styles.modalTitle}>Reject Fulfillment</h3>
            <p className={styles.modalSub}>
              This order will not be sent to Shiprocket. Please provide a
              reason.
            </p>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Address issue, Seller issue, Inventory verification failed, Manual review required"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setRejectingId(null)}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmRejectBtn}
                disabled={actioningId === rejectingId}
                onClick={submitReject}
              >
                {actioningId === rejectingId
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
