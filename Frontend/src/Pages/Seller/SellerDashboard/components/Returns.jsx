// src/Pages/Seller/SellerDashboard/components/Returns.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiRefreshCw,
  FiCheck,
  FiX,
  FiPackage,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiImage,
} from "react-icons/fi";
import styles from "./Returns.module.css";
import {
  fetchSellerReturns,
  approveSellerReturn,
  rejectSellerReturn,
  retrySellerReturnSync,
  updateSellerReturnStatus,
} from "../../../../redux/slices/returnSlice.js";

const STATUS_LABEL = {
  REQUESTED: "Requested — Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  PICKED_UP: "Picked Up",
  RECEIVED: "Received",
  REFUND_PROCESSING: "Refund Processing",
  REFUNDED: "Refunded",
  EXCHANGE_PROCESSING: "Exchange Processing",
  EXCHANGE_COMPLETED: "Exchange Completed",
  CANCELLED: "Cancelled by Customer",
};

const STATUS_COLORS = {
  REQUESTED: { bg: "#fef3c7", text: "#92400e" },
  APPROVED: { bg: "#dbeafe", text: "#1e40af" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b" },
  PICKUP_SCHEDULED: { bg: "#ede9fe", text: "#5b21b6" },
  PICKED_UP: { bg: "#e0e7ff", text: "#3730a3" },
  RECEIVED: { bg: "#e0f2fe", text: "#075985" },
  REFUND_PROCESSING: { bg: "#fef3c7", text: "#92400e" },
  REFUNDED: { bg: "#d1fae5", text: "#065f46" },
  EXCHANGE_PROCESSING: { bg: "#fef3c7", text: "#92400e" },
  EXCHANGE_COMPLETED: { bg: "#d1fae5", text: "#065f46" },
  CANCELLED: { bg: "#f3f4f6", text: "#6b7280" },
};

const STATUS_ICON = {
  REQUESTED: <FiClock size={12} />,
  APPROVED: <FiCheckCircle size={12} />,
  REJECTED: <FiXCircle size={12} />,
  PICKUP_SCHEDULED: <FiTruck size={12} />,
  PICKED_UP: <FiTruck size={12} />,
  RECEIVED: <FiPackage size={12} />,
  REFUND_PROCESSING: <FiClock size={12} />,
  REFUNDED: <FiCheckCircle size={12} />,
  EXCHANGE_PROCESSING: <FiClock size={12} />,
  EXCHANGE_COMPLETED: <FiCheckCircle size={12} />,
  CANCELLED: <FiXCircle size={12} />,
};

// Mirrors backend returnController's SELLER_ADVANCEABLE_STATUSES /
// ALLOWED_PREVIOUS — only offers the next step that the backend will
// actually accept from the current status, for the current request type.
const getNextStep = (request) => {
  const { status, requestType } = request;
  if (status === "APPROVED" || status === "PICKUP_SCHEDULED") {
    return { status: "PICKED_UP", label: "Mark as Picked Up" };
  }
  if (status === "PICKED_UP") {
    return { status: "RECEIVED", label: "Mark as Received" };
  }
  if (status === "RECEIVED") {
    return requestType === "exchange"
      ? { status: "EXCHANGE_PROCESSING", label: "Start Exchange Processing" }
      : { status: "REFUND_PROCESSING", label: "Start Refund Processing" };
  }
  if (status === "REFUND_PROCESSING") {
    return { status: "REFUNDED", label: "Mark as Refunded" };
  }
  if (status === "EXCHANGE_PROCESSING") {
    return { status: "EXCHANGE_COMPLETED", label: "Mark Exchange Completed" };
  }
  return null;
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const SkeletonLoader = () => (
  <div className={styles.skelWrap}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className={styles.skelCard} />
    ))}
  </div>
);

const Returns = () => {
  const dispatch = useDispatch();
  const { sellerReturns, isLoading } = useSelector((state) => state.returns);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actioningId, setActioningId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerReturns());
  }, [dispatch]);

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await dispatch(approveSellerReturn(id)).unwrap();
      toast.success("Return approved");
    } catch (err) {
      toast.error(err || "Failed to approve return");
    } finally {
      setActioningId(null);
    }
  };

  const openRejectDialog = (id) => {
    setRejectingId(id);
    setRejectReason("");
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActioningId(rejectingId);
    try {
      await dispatch(
        rejectSellerReturn({ id: rejectingId, reason: rejectReason.trim() }),
      ).unwrap();
      toast.success("Return rejected");
      setRejectingId(null);
    } catch (err) {
      toast.error(err || "Failed to reject return");
    } finally {
      setActioningId(null);
    }
  };

  const handleRetrySync = async (id) => {
    setActioningId(id);
    try {
      const res = await dispatch(retrySellerReturnSync(id)).unwrap();
      if (res?.shiprocketReturn?.syncStatus === "synced") {
        toast.success("Reverse pickup synced with Shiprocket");
      } else {
        toast.error("Shiprocket synchronization failed again");
      }
    } catch (err) {
      toast.error(err || "Failed to retry synchronization");
    } finally {
      setActioningId(null);
    }
  };

  const handleAdvance = async (id, status) => {
    setActioningId(id);
    try {
      await dispatch(updateSellerReturnStatus({ id, status })).unwrap();
      toast.success("Return status updated");
    } catch (err) {
      toast.error(err || "Failed to update return status");
    } finally {
      setActioningId(null);
    }
  };

  const filteredReturns = (sellerReturns || []).filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const haystack = `${r.orderNumber || ""} ${r.productName || ""} ${
        r.customerName || ""
      }`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Return &amp; Exchange Requests</h2>
          <span className={styles.count}>
            {filteredReturns.length} request
            {filteredReturns.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by order, product, customer..."
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
            {Object.keys(STATUS_LABEL).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && filteredReturns.length === 0 ? (
        <SkeletonLoader />
      ) : filteredReturns.length === 0 ? (
        <div className={styles.emptyState}>
          <FiRefreshCw size={40} className={styles.emptyIcon} />
          <h3>No return requests found</h3>
          <p>
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "When customers request a return or exchange, they'll appear here"}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredReturns.map((request) => {
            const statusStyle = STATUS_COLORS[request.status] || {
              bg: "#f3f4f6",
              text: "#6b7280",
            };
            const nextStep = getNextStep(request);
            const syncStatus = request.shiprocketReturn?.syncStatus;

            return (
              <div key={request._id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardTopLeft}>
                    {request.productImage ? (
                      <img
                        src={request.productImage}
                        alt={request.productName}
                        className={styles.productImg}
                      />
                    ) : (
                      <div className={styles.productImgPlaceholder}>
                        <FiPackage size={20} />
                      </div>
                    )}
                    <div className={styles.cardTitleBlock}>
                      <span className={styles.orderNumber}>
                        Order #{request.orderNumber}
                      </span>
                      <span className={styles.productName}>
                        {request.productName}
                      </span>
                    </div>
                  </div>

                  <div className={styles.badgeRow}>
                    <span className={styles.typeBadge}>
                      {request.requestType}
                    </span>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                    >
                      {STATUS_ICON[request.status]}
                      {STATUS_LABEL[request.status] || request.status}
                    </span>
                  </div>
                </div>

                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Customer</span>
                    <span className={styles.detailValue}>
                      {request.customerName || "N/A"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>
                      {request.customerPhone || "N/A"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Reason</span>
                    <span className={styles.detailValue}>{request.reason}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Quantity</span>
                    <span className={styles.detailValue}>
                      {request.quantity}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Unit Price</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(request.unitPrice)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Delivered On</span>
                    <span className={styles.detailValue}>
                      {formatDate(request.orderDeliveredAt)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Requested On</span>
                    <span className={styles.detailValue}>
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  {request.shiprocketReturn?.awbCode && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Return AWB</span>
                      <span className={styles.detailValue}>
                        {request.shiprocketReturn.awbCode}
                      </span>
                    </div>
                  )}
                </div>

                {request.customerNotes && (
                  <div className={styles.notesBlock}>
                    <span className={styles.notesLabel}>Customer Notes</span>
                    {request.customerNotes}
                  </div>
                )}

                {request.images?.length > 0 && (
                  <div className={styles.imageRow}>
                    {request.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Return evidence ${idx + 1}`}
                        className={styles.thumbImg}
                        onClick={() => setLightboxImage(img.url)}
                      />
                    ))}
                  </div>
                )}

                {request.status === "REJECTED" &&
                  request.sellerRejectionReason && (
                    <div className={styles.rejectionNote}>
                      <FiX size={13} />
                      <span>{request.sellerRejectionReason}</span>
                    </div>
                  )}

                {request.status === "APPROVED" && syncStatus === "failed" && (
                  <div className={`${styles.syncNote} ${styles.syncFailed}`}>
                    <FiXCircle size={13} />
                    <span>
                      Shiprocket reverse-pickup sync failed
                      {request.shiprocketReturn?.syncError
                        ? `: ${request.shiprocketReturn.syncError}`
                        : ""}
                      . You can retry below.
                    </span>
                  </div>
                )}

                {request.status === "APPROVED" && syncStatus === "pending" && (
                  <div className={`${styles.syncNote} ${styles.syncPending}`}>
                    <FiClock size={13} />
                    <span>Shiprocket reverse-pickup sync in progress...</span>
                  </div>
                )}

                <div className={styles.actionsRow}>
                  {request.status === "REQUESTED" && (
                    <>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.rejectBtn}`}
                        disabled={actioningId === request._id}
                        onClick={() => openRejectDialog(request._id)}
                      >
                        <FiX size={14} /> Reject
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.approveBtn}`}
                        disabled={actioningId === request._id}
                        onClick={() => handleApprove(request._id)}
                      >
                        <FiCheck size={14} />
                        {actioningId === request._id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                    </>
                  )}

                  {request.status === "APPROVED" && syncStatus === "failed" && (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.retryBtn}`}
                      disabled={actioningId === request._id}
                      onClick={() => handleRetrySync(request._id)}
                    >
                      <FiRefreshCw size={14} />
                      {actioningId === request._id
                        ? "Retrying..."
                        : "Retry Shiprocket Sync"}
                    </button>
                  )}

                  {nextStep && (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.advanceBtn}`}
                      disabled={actioningId === request._id}
                      onClick={() =>
                        handleAdvance(request._id, nextStep.status)
                      }
                    >
                      <FiTruck size={14} />
                      {actioningId === request._id
                        ? "Updating..."
                        : nextStep.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectingId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejectingId(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reject Return Request</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setRejectingId(null)}
              >
                <FiX size={20} />
              </button>
            </div>
            <p className={styles.modalSub}>
              Please provide a reason for rejecting this return/exchange
              request. The customer will see this reason.
            </p>
            <textarea
              className={styles.modalTextarea}
              placeholder="e.g. Product shows signs of use, outside return window..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setRejectingId(null)}
                disabled={actioningId === rejectingId}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalConfirmRejectBtn}
                disabled={actioningId === rejectingId || !rejectReason.trim()}
                onClick={submitReject}
              >
                {actioningId === rejectingId
                  ? "Rejecting..."
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Return evidence"
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              borderRadius: 10,
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Returns;
