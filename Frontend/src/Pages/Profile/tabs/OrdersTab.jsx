// src/Pages/Profile/tabs/OrdersTab.jsx

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiDownload,
  FiX,
  FiRotateCcw,
  FiTruck as FiTrack,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchOrders } from "../../../redux/slices/profileSlice";
import styles from "../Profile.module.css";

const OrdersTab = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.profile);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <FiCheckCircle />;
      case "processing":
        return <FiClock />;
      case "shipped":
        return <FiTruck />;
      case "cancelled":
        return <FiAlertCircle />;
      default:
        return <FiPackage />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return styles.statusDelivered;
      case "processing":
        return styles.statusProcessing;
      case "shipped":
        return styles.statusShipped;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return styles.paymentPaid;
      case "pending":
        return styles.paymentPending;
      case "failed":
        return styles.paymentFailed;
      case "refunded":
        return styles.paymentRefunded;
      default:
        return "";
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Order cancelled successfully");
        dispatch(fetchOrders());
        setShowOrderDetails(false);
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const handleReorder = async (order) => {
    try {
      for (const item of order.items) {
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            productId: item.productId || item.product?._id,
            quantity: item.quantity,
          }),
        });
      }
      toast.success("Items added to cart!");
    } catch (error) {
      toast.error("Failed to add items to cart");
    }
  };

  const handleReturnOrder = async (orderId) => {
    toast.info("Return feature coming soon");
  };

  const handleDownloadInvoice = (orderId) => {
    toast.info("Invoice download coming soon");
  };

  const getOrderTimeline = (order) => {
    const timeline = [];
    if (order.createdAt) {
      timeline.push({
        status: "Order Placed",
        date: order.createdAt,
        icon: <FiPackage />,
      });
    }
    if (order.confirmedAt) {
      timeline.push({
        status: "Confirmed",
        date: order.confirmedAt,
        icon: <FiCheckCircle />,
      });
    }
    if (order.shippedAt) {
      timeline.push({
        status: "Shipped",
        date: order.shippedAt,
        icon: <FiTruck />,
      });
    }
    if (order.deliveredAt) {
      timeline.push({
        status: "Delivered",
        date: order.deliveredAt,
        icon: <FiCheckCircle />,
      });
    }
    return timeline;
  };

  if (loading) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.emptyState}>
          <FiPackage size={48} />
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Start shopping now!</p>
          <button className={styles.shopBtn}>Start Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <h2>My Orders</h2>
        <span className={styles.orderCount}>{orders.length} orders</span>
      </div>

      <div className={styles.ordersList}>
        {orders.map((order) => (
          <div key={order._id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderLeft}>
                <span className={styles.orderId}>
                  Order #{order.orderNumber || order._id.slice(-6)}
                </span>
                <span className={styles.orderDate}>
                  <FiCalendar size={14} />
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span
                className={`${styles.orderStatus} ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            <div className={styles.orderItemsPreview}>
              {order.items?.slice(0, 3).map((item) => (
                <div key={item._id} className={styles.orderItemPreview}>
                  <img
                    src={
                      item.product?.images?.[0]?.url ||
                      item.image ||
                      "/placeholder.jpg"
                    }
                    alt={item.product?.name || item.name}
                    className={styles.orderItemImage}
                  />
                  <div className={styles.orderItemInfo}>
                    <p className={styles.orderItemName}>
                      {item.product?.name || item.name}
                    </p>
                    <span className={styles.orderItemQty}>
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <span className={styles.orderItemPrice}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {order.items?.length > 3 && (
                <div className={styles.moreItems}>
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>

            <div className={styles.orderFooter}>
              <div className={styles.orderMeta}>
                <span className={styles.orderTotal}>
                  Total: <strong>₹{order.totalAmount?.toFixed(2)}</strong>
                </span>
                {order.trackingNumber && (
                  <span className={styles.orderTracking}>
                    <FiTrack size={14} />
                    Tracking: {order.trackingNumber}
                  </span>
                )}
                {order.expectedDelivery && (
                  <span className={styles.orderExpectedDelivery}>
                    <FiCalendar size={14} />
                    Expected:{" "}
                    {new Date(order.expectedDelivery).toLocaleDateString()}
                  </span>
                )}
                <span
                  className={`${styles.paymentStatus} ${getPaymentStatusColor(order.paymentStatus)}`}
                >
                  <FiCreditCard size={14} />
                  {order.paymentStatus || "Pending"}
                </span>
              </div>
              <div className={styles.orderActions}>
                <button
                  className={styles.viewOrderBtn}
                  onClick={() => handleViewOrder(order)}
                >
                  <FiEye size={14} /> View Details
                </button>
                <button
                  className={styles.reorderBtn}
                  onClick={() => handleReorder(order)}
                >
                  <FiRotateCcw size={14} /> Reorder
                </button>
                {order.status?.toLowerCase() !== "cancelled" &&
                  order.status?.toLowerCase() !== "delivered" && (
                    <button
                      className={styles.cancelOrderBtn}
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      <FiX size={14} /> Cancel
                    </button>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className={styles.modalOverlay} onClick={handleCloseDetails}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Order Details</h3>
              <button
                onClick={handleCloseDetails}
                className={styles.closeModalBtn}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className={styles.orderDetailContent}>
              <div className={styles.orderDetailHeader}>
                <div>
                  <h4>
                    Order #
                    {selectedOrder.orderNumber || selectedOrder._id.slice(-6)}
                  </h4>
                  <p className={styles.orderDate}>
                    Placed on{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`${styles.orderStatus} ${getStatusColor(selectedOrder.status)}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>

              {/* Order Timeline */}
              <div className={styles.orderTimeline}>
                <h5>Order Timeline</h5>
                {getOrderTimeline(selectedOrder).map((event, index) => (
                  <div key={index} className={styles.timelineItem}>
                    <div className={styles.timelineIcon}>{event.icon}</div>
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineStatus}>
                        {event.status}
                      </span>
                      <span className={styles.timelineDate}>
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Items */}
              <div className={styles.orderDetailItems}>
                <h5>Items ({selectedOrder.items?.length})</h5>
                {selectedOrder.items?.map((item) => (
                  <div key={item._id} className={styles.orderDetailItem}>
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        item.image ||
                        "/placeholder.jpg"
                      }
                      alt={item.product?.name || item.name}
                      className={styles.orderDetailItemImage}
                    />
                    <div className={styles.orderDetailItemInfo}>
                      <p className={styles.orderDetailItemName}>
                        {item.product?.name || item.name}
                      </p>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.orderDetailItemPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className={styles.orderDetailSummary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Discount</span>
                    <span>
                      -₹{selectedOrder.discount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>
                    ₹{selectedOrder.shippingCost?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Payment Method</span>
                  <span>{selectedOrder.paymentMethod || "N/A"}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Payment Status</span>
                  <span
                    className={`${styles.paymentStatus} ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}
                  >
                    {selectedOrder.paymentStatus || "Pending"}
                  </span>
                </div>
                {selectedOrder.trackingNumber && (
                  <div className={styles.summaryRow}>
                    <span>Tracking Number</span>
                    <span>{selectedOrder.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Order Actions */}
              <div className={styles.orderDetailActions}>
                <button
                  className={styles.downloadInvoiceBtn}
                  onClick={() => handleDownloadInvoice(selectedOrder._id)}
                >
                  <FiDownload size={16} /> Download Invoice
                </button>
                <button
                  className={styles.reorderBtn}
                  onClick={() => handleReorder(selectedOrder)}
                >
                  <FiRotateCcw size={16} /> Reorder
                </button>
                {selectedOrder.status?.toLowerCase() !== "cancelled" &&
                  selectedOrder.status?.toLowerCase() !== "delivered" && (
                    <button
                      className={styles.cancelOrderBtn}
                      onClick={() => handleCancelOrder(selectedOrder._id)}
                    >
                      <FiX size={16} /> Cancel Order
                    </button>
                  )}
                {selectedOrder.status?.toLowerCase() === "delivered" && (
                  <button
                    className={styles.returnOrderBtn}
                    onClick={() => handleReturnOrder(selectedOrder._id)}
                  >
                    <FiRotateCcw size={16} /> Return Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
