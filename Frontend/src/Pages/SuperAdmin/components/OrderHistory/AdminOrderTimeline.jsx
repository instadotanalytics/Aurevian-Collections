// src/Pages/SuperAdmin/components/OrderHistory/AdminOrderTimeline.jsx
import React from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./OrderHistory.module.css";

// Reads ONLY what the backend actually recorded. Fulfillment stages
// (seller confirm → admin approve → AWB) come from order.statusHistory,
// which the app writes. Shipment-progress stages (picked up → delivered)
// come from order.orderStatus + shipping.shippedAt/deliveredAt, because
// the Shiprocket webhook writes those fields, not fulfillmentStatus.
const SHIPMENT_PROGRESS_ORDER = [
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

const EXCEPTION_LABELS = {
  SELLER_REJECTED: "Seller Rejected",
  ADMIN_REJECTED: "Admin Rejected",
  SHIPROCKET_FAILED: "Shiprocket Failed",
  CANCELLED: "Order Cancelled",
  RTO: "Returned to Origin",
  RETURN_INITIATED: "Return in Progress",
  RETURNED: "Return Completed",
};

const AdminOrderTimeline = ({ order }) => {
  if (!order) return null;

  const history = order.statusHistory || [];
  const findEntry = (status) => history.find((h) => h.status === status);

  if (EXCEPTION_LABELS[order.fulfillmentStatus]) {
    const entry = findEntry(order.fulfillmentStatus);
    const reasonField =
      order.fulfillmentStatus === "SELLER_REJECTED"
        ? order.sellerRejectionReason
        : order.fulfillmentStatus === "ADMIN_REJECTED"
          ? order.adminRejectionReason
          : entry?.reason;

    return (
      <div className={styles.exceptionBanner}>
        <span className={styles.exceptionLabel}>
          {EXCEPTION_LABELS[order.fulfillmentStatus]}
        </span>
        {reasonField && (
          <span className={styles.exceptionReason}>Reason: {reasonField}</span>
        )}
        {entry?.timestamp && (
          <span className={styles.exceptionDate}>
            {new Date(entry.timestamp).toLocaleString("en-IN")}
          </span>
        )}
      </div>
    );
  }

  const shippedIdx = SHIPMENT_PROGRESS_ORDER.indexOf(order.orderStatus);

  const steps = [
    {
      key: "placed",
      label: "Order Placed",
      done: true,
      date: order.createdAt,
    },
    {
      key: "paid",
      label: "Payment Confirmed",
      done: order.paymentStatus === "paid",
      date: order.placedAt,
    },
    {
      key: "seller_confirmed",
      label: "Seller Confirmed",
      done: !!order.sellerConfirmedAt,
      date: order.sellerConfirmedAt,
    },
    {
      key: "admin_approved",
      label: "Admin Approved",
      done: !!order.adminApprovedAt,
      date: order.adminApprovedAt,
    },
    {
      key: "shiprocket_created",
      label: "Shiprocket Order Created",
      done: !!order.shipping?.shiprocketOrderId,
      date: order.shipping?.shiprocketOrderId
        ? order.shipping?.lastSyncedAt
        : null,
    },
    {
      key: "awb_assigned",
      label: "AWB Assigned",
      done: !!order.shipping?.awbCode,
      date: order.shipping?.awbCode ? order.shipping?.lastSyncedAt : null,
    },
    {
      key: "picked_up",
      label: "Picked Up",
      done: !!order.shipping?.shippedAt || shippedIdx >= 1,
      date: order.shipping?.shippedAt,
    },
    {
      key: "in_transit",
      label: "In Transit",
      done: shippedIdx >= 2,
      date: null,
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      done: shippedIdx >= 3,
      date: null,
    },
    {
      key: "delivered",
      label: "Delivered",
      done: !!order.shipping?.deliveredAt || shippedIdx >= 4,
      date: order.shipping?.deliveredAt,
    },
  ];

  const activeIdx = steps.findIndex((s) => !s.done);

  return (
    <ol className={styles.timeline}>
      {steps.map((step, idx) => {
        const isActive = idx === activeIdx;
        return (
          <li
            key={step.key}
            className={`${styles.step} ${step.done ? styles.stepDone : ""} ${
              isActive ? styles.stepActive : ""
            }`}
          >
            <span className={styles.stepDot}>
              {step.done ? <FiCheck size={12} /> : null}
            </span>
            <div className={styles.stepBody}>
              <span className={styles.stepLabel}>{step.label}</span>
              {step.date && (
                <span className={styles.stepDate}>
                  {new Date(step.date).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default AdminOrderTimeline;
