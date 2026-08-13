// src/Pages/Seller/SellerDashboard/components/Orders.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaRupeeSign } from "react-icons/fa";
import { FiTruck, FiCheck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "./Orders.module.css";
import {
  fetchSellerOrders,
  updateSellerOrder,
} from "../../../../redux/slices/orderSlice";
import * as orderApi from "../../../../api/orderApi.js";

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

const FULFILLMENT_LABEL = {
  PENDING_SELLER_CONFIRMATION: "Action Required",
  SELLER_CONFIRMED: "Confirmed — Awaiting Admin Approval",
  SELLER_REJECTED: "Rejected",
  ADMIN_APPROVED: "Admin Approved",
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

const Orders = () => {
  const dispatch = useDispatch();
  const { sellerOrders, isLoading } = useSelector((state) => state.orders);

  const [actioningId, setActioningId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    dispatch(fetchSellerOrders());
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateSellerOrder({ id, status })).unwrap();
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err || "Failed to update status");
    }
  };

  const handleConfirm = async (orderId) => {
    setActioningId(orderId);
    try {
      await orderApi.sellerConfirmOrder(orderId);
      toast.success("Order confirmed — sent for admin approval");
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

  return (
    <div className={styles.ordersWrap}>
      <h2 className={styles.title}>Orders</h2>

      {isLoading && <p className={styles.loadingText}>Loading orders...</p>}

      {!isLoading && sellerOrders.length === 0 && (
        <p className={styles.emptyText}>No orders yet.</p>
      )}

      <div className={styles.table}>
        {sellerOrders.map((order) => (
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
                <p className={styles.customerName}>
                  {order.customer?.fullName}
                </p>
                <p className={styles.customerPhone}>{order.customer?.phone}</p>
                <p className={styles.customerAddress}>
                  {order.customer?.addressLine1}, {order.customer?.city},{" "}
                  {order.customer?.state} - {order.customer?.pincode}
                </p>
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

            {order.shipping &&
              (order.shipping.courierName ||
                order.shipping.awbCode ||
                order.shipping.status) && (
                <div className={styles.shippingInfo}>
                  <FiTruck size={13} />
                  <span>
                    {order.shipping.courierName || "Courier not yet assigned"}
                    {order.shipping.awbCode
                      ? ` · AWB ${order.shipping.awbCode}`
                      : ""}
                    {order.shipping.status ? ` · ${order.shipping.status}` : ""}
                  </span>
                </div>
              )}

            {/* ✅ NEW: fulfillment status badge */}
            <div className={styles.fulfillmentRow}>
              <span
                className={`${styles.fulfillmentBadge} ${
                  styles[order.fulfillmentStatus] || ""
                }`}
              >
                {FULFILLMENT_LABEL[order.fulfillmentStatus] ||
                  order.fulfillmentStatus}
              </span>
              {order.fulfillmentStatus === "SELLER_REJECTED" &&
                order.sellerRejectionReason && (
                  <span className={styles.rejectionReasonText}>
                    Reason: {order.sellerRejectionReason}
                  </span>
                )}
            </div>

            {/* ✅ NEW: confirm/reject actions — only shown while awaiting seller action */}
            {order.fulfillmentStatus === "PENDING_SELLER_CONFIRMATION" && (
              <div className={styles.actionRow}>
                <button
                  className={styles.confirmBtn}
                  disabled={actioningId === order._id}
                  onClick={() => handleConfirm(order._id)}
                >
                  <FiCheck size={14} />
                  {actioningId === order._id
                    ? "Confirming..."
                    : "Confirm Order"}
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

            <div className={styles.orderFooter}>
              <span className={styles.subtotal}>
                Your Earnings: <FaRupeeSign size={12} />
                {order.sellerSubtotal.toLocaleString("en-IN")}
              </span>
              <span
                className={`${styles.payStatus} ${styles[order.paymentStatus]}`}
              >
                {order.paymentStatus}
              </span>
              <select
                className={styles.statusSelect}
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ NEW: reject reason confirmation dialog */}
      {rejectingId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectingId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Reject Order</h3>
            <p className={styles.modalSub}>
              Please provide a reason. The customer's payment will be handled
              through the refund process.
            </p>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Product unavailable, Inventory issue, Unable to fulfill"
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

export default Orders;
