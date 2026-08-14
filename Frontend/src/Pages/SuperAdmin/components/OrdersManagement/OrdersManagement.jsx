// src/Pages/SuperAdmin/components/OrdersManagement/OrdersManagement.jsx
import React, { useEffect, useState, useCallback } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { FiTruck, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./OrdersManagement.module.css";
import * as orderApi from "../../../../api/orderApi.js";

// ✅ SOCKET.IO — real-time order updates for super admin
import useOrderSocketEvents from "../../../../hooks/useOrderSocketEvents.js";

const TABS = [
  { key: "SELLER_CONFIRMED", label: "Awaiting Approval" },
  { key: "ADMIN_APPROVED", label: "Approved" },
  { key: "AWB_PENDING", label: "AWB Pending" },
  { key: "AWB_ASSIGNED", label: "Shipped" },
  { key: "SHIPROCKET_FAILED", label: "Exceptions" },
  { key: "SELLER_REJECTED", label: "Seller Rejected" },
  { key: "ADMIN_REJECTED", label: "Admin Rejected" },
];

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

  // ✅ SOCKET.IO — "Super Admin should see this without refreshing" per
  // spec item 2. A seller confirming an order is the one event admin
  // actively needs a toast for; shipping updates just quietly refresh
  // whatever tab is open (relevant for AWB Pending / Shipped tabs).
  useOrderSocketEvents({
    onOrderCreated: () => loadOrders(activeTab),
    onSellerConfirmed: () => loadOrders(activeTab),
    onShippingUpdated: () => loadOrders(activeTab),
  });

  const handleApprove = async (orderId) => {
    setActioningId(orderId);
    try {
      const res = await orderApi.adminApproveOrder(orderId);
      if (res.success) {
        toast.success(
          res.message || "Order approved and forwarded to Shiprocket",
        );
      } else {
        // Approved but Shiprocket failed — surfaced clearly, not hidden behind a generic success toast
        toast.error(res.message || "Order approved, but Shiprocket failed");
      }
      loadOrders(activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve order");
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

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Order Fulfillment</h1>
          <p className={styles.pageSubtitle}>
            Review seller-confirmed orders and approve them for Shiprocket
            fulfillment.
          </p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={() => loadOrders(activeTab)}
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className={styles.loadingText}>Loading orders...</p>}

      {!isLoading && orders.length === 0 && (
        <div className={styles.emptyState}>
          <p>No orders in this queue.</p>
        </div>
      )}

      <div className={styles.table}>
        {orders.map((order) => (
          <div className={styles.orderRow} key={order._id}>
            <div className={styles.orderMain}>
              <div>
                <p className={styles.orderNumber}>#{order.orderNumber}</p>
                <p className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className={styles.customerInfo}>
                <p className={styles.customerName}>{order.customerName}</p>
                <p className={styles.customerAddress}>
                  {order.shippingAddress?.addressLine1},{" "}
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                  - {order.shippingAddress?.pincode}
                </p>
              </div>
              <div className={styles.sellerInfo}>
                <span className={styles.sellerLabel}>Seller</span>
                <span className={styles.sellerName}>
                  {order.seller?.storeInfo?.storeName ||
                    order.seller?.fullName ||
                    "—"}
                </span>
              </div>
            </div>

            <div className={styles.items}>
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

            <div className={styles.metaRow}>
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Payment</span>
                <span
                  className={`${styles.payStatus} ${
                    styles[order.paymentStatus]
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Amount</span>
                <span>
                  <FaRupeeSign size={11} />
                  {order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className={styles.metaBlock}>
                <span className={styles.metaLabel}>Shipping Fee</span>
                <span>
                  <FaRupeeSign size={11} />
                  {order.shippingFee.toLocaleString("en-IN")}
                </span>
              </div>
              {order.sellerConfirmedAt && (
                <div className={styles.metaBlock}>
                  <span className={styles.metaLabel}>Seller Confirmed</span>
                  <span>
                    {new Date(order.sellerConfirmedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>

            {order.shipping &&
              (order.shipping.shiprocketOrderId ||
                order.shipping.awbCode ||
                order.shipping.status ||
                order.shipping.lastError) && (
                <div className={styles.shippingInfo}>
                  <FiTruck size={13} />
                  <span>
                    {order.shipping.shiprocketOrderId
                      ? `Shiprocket #${order.shipping.shiprocketOrderId}`
                      : "No Shiprocket order yet"}
                    {order.shipping.awbCode
                      ? ` · AWB ${order.shipping.awbCode}`
                      : ""}
                    {order.shipping.status ? ` · ${order.shipping.status}` : ""}
                  </span>
                  {order.shipping.lastError && (
                    <span className={styles.shippingError}>
                      {order.shipping.lastError}
                    </span>
                  )}
                </div>
              )}

            <div className={styles.fulfillmentRow}>
              <span
                className={`${styles.fulfillmentBadge} ${
                  styles[order.fulfillmentStatus] || ""
                }`}
              >
                {FULFILLMENT_LABEL[order.fulfillmentStatus] ||
                  order.fulfillmentStatus}
              </span>
              {order.fulfillmentStatus === "ADMIN_REJECTED" &&
                order.adminRejectionReason && (
                  <span className={styles.rejectionReasonText}>
                    Reason: {order.adminRejectionReason}
                  </span>
                )}
            </div>

            {order.fulfillmentStatus === "SELLER_CONFIRMED" && (
              <div className={styles.actionRow}>
                <button
                  className={styles.approveBtn}
                  disabled={actioningId === order._id}
                  onClick={() => handleApprove(order._id)}
                >
                  <FiCheck size={14} />
                  {actioningId === order._id
                    ? "Approving..."
                    : "Approve for Shipping"}
                </button>
                <button
                  className={styles.rejectBtn}
                  disabled={actioningId === order._id}
                  onClick={() => openRejectDialog(order._id)}
                >
                  <FiX size={14} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {rejectingId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectingId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
