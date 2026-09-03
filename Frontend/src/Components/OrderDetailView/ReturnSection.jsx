// src/Components/OrderDetailView/ReturnSection.jsx
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiPackage,
} from "react-icons/fi";
import * as returnApi from "../../api/returnApi.js";
import ReturnRequestModal from "./ReturnRequestModal.jsx";
import styles from "./ReturnSection.module.css";

const STATUS_LABEL = {
  REQUESTED: "Requested — Pending Seller Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PICKED_UP: "Picked Up",
  RECEIVED: "Received by Seller",
  REFUND_PROCESSING: "Refund Processing",
  REFUNDED: "Refunded",
  EXCHANGE_PROCESSING: "Exchange Processing",
  EXCHANGE_COMPLETED: "Exchange Completed",
  CANCELLED: "Cancelled",
};

const STATUS_ICON = {
  REQUESTED: <FiClock />,
  APPROVED: <FiCheckCircle />,
  REJECTED: <FiXCircle />,
  PICKUP_SCHEDULED: <FiTruck />,
  PICKED_UP: <FiTruck />,
  RECEIVED: <FiPackage />,
  REFUND_PROCESSING: <FiClock />,
  REFUNDED: <FiCheckCircle />,
  EXCHANGE_PROCESSING: <FiClock />,
  EXCHANGE_COMPLETED: <FiCheckCircle />,
  CANCELLED: <FiXCircle />,
};

const ReturnSection = ({ order }) => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    if (!order?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await returnApi.getOrderReturnEligibility(order._id);
      if (res.success) {
        setItems(res.data.items || []);
      } else {
        setError(res.message || "Unable to load return information");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load return information",
      );
    } finally {
      setLoading(false);
    }
  }, [order?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (requestId) => {
    setCancellingId(requestId);
    try {
      const res = await returnApi.cancelReturnRequest(requestId);
      if (res.success) {
        toast.success("Return request cancelled");
        load();
      } else {
        toast.error(res.message || "Failed to cancel request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return null;
  if (error || !items || items.length === 0) return null;

  // Stay quiet unless there's something eligible or already requested —
  // an order with nothing return-relevant yet doesn't need an empty card.
  const hasAnythingToShow = items.some((i) => i.eligible || i.existingRequest);
  if (!hasAnythingToShow) return null;

  return (
    <section className={styles.card}>
      <h3 className={styles.cardTitle}>
        <FiRefreshCw /> Return &amp; Exchange
      </h3>

      <div className={styles.itemList}>
        {items.map((item) => (
          <div className={styles.itemRow} key={item.productId}>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.productName}</span>
              {item.eligible && item.eligibleUntil && (
                <span className={styles.itemHint}>
                  Eligible until{" "}
                  {new Date(item.eligibleUntil).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              {!item.eligible && !item.existingRequest && (
                <span className={styles.itemHintMuted}>{item.reason}</span>
              )}
            </div>

            {item.existingRequest ? (
              <div className={styles.statusWrap}>
                <span
                  className={`${styles.statusBadge} ${
                    styles[item.existingRequest.status] || ""
                  }`}
                >
                  {STATUS_ICON[item.existingRequest.status]}
                  {STATUS_LABEL[item.existingRequest.status] ||
                    item.existingRequest.status}
                </span>
                {item.existingRequest.status === "REQUESTED" && (
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    disabled={cancellingId === item.existingRequest._id}
                    onClick={() => handleCancel(item.existingRequest._id)}
                  >
                    {cancellingId === item.existingRequest._id
                      ? "Cancelling..."
                      : "Cancel Request"}
                  </button>
                )}
              </div>
            ) : item.eligible ? (
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => setActiveItem(item)}
              >
                Return / Exchange
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {activeItem && (
        <ReturnRequestModal
          order={order}
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onSubmitted={() => {
            setActiveItem(null);
            load();
          }}
        />
      )}
    </section>
  );
};

export default ReturnSection;
