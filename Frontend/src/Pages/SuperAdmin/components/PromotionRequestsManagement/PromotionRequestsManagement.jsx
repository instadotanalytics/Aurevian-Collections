// src/Pages/SuperAdmin/components/PromotionRequestsManagement/PromotionRequestsManagement.jsx — NEW FILE

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchAdminPromotionRequests,
  approvePromotionRequestAdmin,
  rejectPromotionRequestAdmin,
  removePromotionRequestAdmin,
} from "../../../../redux/slices/promotionSlice";
import styles from "./PromotionRequestsManagement.module.css";

const SECTIONS = [
  { id: "all", label: "All Sections" },
  { id: "curated-for-you", label: "Curated For You" },
  { id: "new-collections", label: "New Collections" },
];

const STATUSES = [
  { id: "all", label: "All Statuses" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "removed", label: "Removed" },
];

const STATUS_BADGE = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  removed: "removed",
};

const RejectModal = ({ onCancel, onConfirm }) => {
  const [reason, setReason] = useState("");
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Reject Promotion Request</h3>
        <textarea
          className={styles.reasonInput}
          placeholder="Explain why this request is being rejected..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.rejectConfirmButton}
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim()}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

const ApproveModal = ({ onCancel, onConfirm }) => {
  const [endDate, setEndDate] = useState("");
  const [keepActiveAfterPlanExpiry, setKeepActiveAfterPlanExpiry] =
    useState(false);
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Approve Promotion Request</h3>
        <label className={styles.fieldLabel}>
          End date (optional — leave blank for no fixed end)
        </label>
        <input
          type="date"
          className={styles.dateInput}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={keepActiveAfterPlanExpiry}
            onChange={(e) => setKeepActiveAfterPlanExpiry(e.target.checked)}
          />
          Keep active on homepage even if seller's plan later expires/downgrades
        </label>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={styles.approveConfirmButton}
            onClick={() =>
              onConfirm({
                endDate: endDate || null,
                keepActiveAfterPlanExpiry,
              })
            }
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

const PromotionRequestsManagement = () => {
  const dispatch = useDispatch();
  const { requests, isLoading, isSaving } = useSelector(
    (state) => state.promotions.admin,
  );

  const [statusFilter, setStatusFilter] = useState("pending");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);

  const load = () => {
    dispatch(
      fetchAdminPromotionRequests({
        status: statusFilter,
        section: sectionFilter,
      }),
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sectionFilter]);

  const handleApprove = async ({ endDate, keepActiveAfterPlanExpiry }) => {
    try {
      await dispatch(
        approvePromotionRequestAdmin({
          id: approveTarget._id,
          endDate,
          keepActiveAfterPlanExpiry,
        }),
      ).unwrap();
      toast.success("Promotion approved");
      setApproveTarget(null);
    } catch (err) {
      toast.error(err || "Failed to approve");
    }
  };

  const handleReject = async (reason) => {
    try {
      await dispatch(
        rejectPromotionRequestAdmin({ id: rejectTarget._id, reason }),
      ).unwrap();
      toast.success("Promotion rejected");
      setRejectTarget(null);
    } catch (err) {
      toast.error(err || "Failed to reject");
    }
  };

  const handleRemove = async (request) => {
    if (
      !window.confirm(
        `Remove this promotion from the homepage? "${request.product?.productName}" will stop appearing in ${request.section}.`,
      )
    )
      return;
    try {
      await dispatch(removePromotionRequestAdmin(request._id)).unwrap();
      toast.success("Promotion removed from homepage");
    } catch (err) {
      toast.error(err || "Failed to remove");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Homepage Promotion Requests</h1>
          <p className={styles.subtitle}>
            Review and approve seller submissions for Curated For You and New
            Collections.
          </p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          {SECTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No promotion requests match this filter</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Plan</th>
                <th>Section</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className={styles.productCell}>
                      <img
                        src={
                          r.product?.thumbnail?.url || "/placeholder-image.jpg"
                        }
                        alt={r.product?.productName}
                        className={styles.productThumb}
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <span>{r.product?.productName || "Deleted product"}</span>
                    </div>
                  </td>
                  <td>
                    {r.seller?.storeInfo?.storeName ||
                      r.seller?.fullName ||
                      "Unknown seller"}
                  </td>
                  <td>
                    <span className={styles.planBadge}>
                      {r.seller?.subscriptionPlanId || "—"}
                    </span>
                  </td>
                  <td>{r.section}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[STATUS_BADGE[r.status]]}`}
                    >
                      {r.status}
                    </span>
                    {r.status === "rejected" && r.rejectionReason && (
                      <div className={styles.rejectionReason}>
                        {r.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      {r.status === "pending" && (
                        <>
                          <button
                            className={styles.approveButton}
                            onClick={() => setApproveTarget(r)}
                            disabled={isSaving}
                          >
                            Approve
                          </button>
                          <button
                            className={styles.rejectButton}
                            onClick={() => setRejectTarget(r)}
                            disabled={isSaving}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemove(r)}
                          disabled={isSaving}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          onCancel={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
      {approveTarget && (
        <ApproveModal
          onCancel={() => setApproveTarget(null)}
          onConfirm={handleApprove}
        />
      )}
    </div>
  );
};

export default PromotionRequestsManagement;
