// src/Components/OrderStatusTimeline/OrderStatusTimeline.jsx
import React from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./OrderStatusTimeline.module.css";

// ============================================
// Mirrors the exact orderStatus enum already on the Order model
// (backend/models/Order.js) and the exact mapping already done by
// mapShiprocketStatus() in shippingController.js. No new statuses are
// invented here — this only renders what the backend already produces.
// ============================================
const HAPPY_PATH = [
  { key: "placed", label: "Order Placed" },
  { key: "processing", label: "Order Confirmed" },
  { key: "ready_to_ship", label: "Courier Assigned" },
  { key: "shipped", label: "Picked Up" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const EXCEPTION_STATUSES = {
  cancelled: { label: "Order Cancelled", tone: "neutral" },
  rto: { label: "Returned to Origin", tone: "warning" },
  return_initiated: { label: "Return in Progress", tone: "warning" },
  returned: { label: "Return Completed", tone: "neutral" },
};

// order: { orderStatus, paymentMethod, paymentStatus, shipping: { courierName, awbCode, trackingUrl, estimatedDeliveryDate, status } }
const OrderStatusTimeline = ({ order }) => {
  if (!order) return null;

  const { orderStatus, shipping } = order;

  if (EXCEPTION_STATUSES[orderStatus]) {
    const exception = EXCEPTION_STATUSES[orderStatus];
    return (
      <div className={styles.wrap}>
        <div className={`${styles.exceptionBanner} ${styles[exception.tone]}`}>
          <span className={styles.exceptionLabel}>{exception.label}</span>
          {shipping?.status && (
            <span className={styles.exceptionDetail}>
              Last known courier status: {shipping.status}
            </span>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.findIndex((s) => s.key === orderStatus);
  // Unknown/legacy status — default to "placed" rather than showing nothing
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className={styles.wrap}>
      <ol className={styles.timeline}>
        {HAPPY_PATH.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <li
              key={step.key}
              className={`${styles.step} ${isDone ? styles.done : ""} ${
                isActive ? styles.active : ""
              } ${isPending ? styles.pending : ""}`}
            >
              <span className={styles.dot}>
                {isDone ? <FiCheck size={12} /> : null}
              </span>
              <div className={styles.stepBody}>
                <span className={styles.stepLabel}>{step.label}</span>

                {/* Contextual detail lines — only shown once we actually have the data */}
                {step.key === "ready_to_ship" &&
                  (isDone || isActive) &&
                  shipping?.courierName && (
                    <span className={styles.stepDetail}>
                      via {shipping.courierName}
                    </span>
                  )}
                {step.key === "shipped" &&
                  (isDone || isActive) &&
                  shipping?.awbCode && (
                    <span className={styles.stepDetail}>
                      AWB: {shipping.awbCode}
                    </span>
                  )}
                {step.key === "delivered" &&
                  isActive &&
                  shipping?.estimatedDeliveryDate && (
                    <span className={styles.stepDetail}>
                      Estimated:{" "}
                      {new Date(
                        shipping.estimatedDeliveryDate,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
              </div>
            </li>
          );
        })}
      </ol>

      {shipping?.trackingUrl && orderStatus !== "delivered" && (
        <a
          href={shipping.trackingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.trackLink}
        >
          Track on courier's site →
        </a>
      )}
    </div>
  );
};

export default OrderStatusTimeline;
