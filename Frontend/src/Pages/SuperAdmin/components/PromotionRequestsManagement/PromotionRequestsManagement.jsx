
// src/Pages/SuperAdmin/components/PromotionRequestsManagement/PromotionRequestsManagement.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiX,
  FiCheck,
  FiTrash2,
  FiCalendar,
  FiTag,
  FiUsers,
} from "react-icons/fi";
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

// Skeleton Loader Component (mirrors SellerRequests' SkeletonLoader)
const SkeletonLoader = ({ count = 8 }) => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <div className={styles.skeletonThumb}></div>
          <div className={styles.skeletonName}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLineShort}></div>
          </div>
          <div className={styles.skeletonPlan}></div>
          <div className={styles.skeletonStatus}></div>
          <div className={styles.skeletonActions}>
            <div className={styles.skeletonIcon}></div>
            <div className={styles.skeletonIcon}></div>
          </div>
        </div>
      ))}
    </div>
  );
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
          autoFocus
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
            Reject Request
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
            Approve Request
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
  const [search, setSearch] = useState("");
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

  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const productName = r.product?.productName?.toLowerCase() || "";
      const storeName = r.seller?.storeInfo?.storeName?.toLowerCase() || "";
      const sellerName = r.seller?.fullName?.toLowerCase() || "";
      return (
        productName.includes(q) ||
        storeName.includes(q) ||
        sellerName.includes(q)
      );
    });
  }, [requests, search]);

  const stats = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0, removed: 0 };
    requests.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    return counts;
  }, [requests]);

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

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pending", className: styles.statusPending },
      approved: { label: "Approved", className: styles.statusApproved },
      rejected: { label: "Rejected", className: styles.statusRejected },
      removed: { label: "Removed", className: styles.statusNeutral },
    };
    return badges[status] || { label: status, className: styles.statusNeutral };
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiTag size={60} className={styles.emptyIcon} />
      <h3>No promotion requests found</h3>
      <p>
        {search || statusFilter !== "all" || sectionFilter !== "all"
          ? "Try adjusting your filters or search terms"
          : "Seller promotion submissions will show up here once received"}
      </p>
      {(search || statusFilter !== "all" || sectionFilter !== "all") && (
        <button
          className={styles.clearFiltersBtn}
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
            setSectionFilter("all");
          }}
        >
          <FiX size={18} />
          Clear All Filters
        </button>
      )}
    </div>
  );

  const showLoadingState = isLoading && requests.length === 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Homepage Promotion Requests</h1>
          <span className={styles.countPill}>
            {filteredRequests.length} requests
          </span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.statsBar}>
            <span className={styles.statsLabel}>
              <FiUsers size={14} />
              Overview:
            </span>
            <span className={styles.statsItem}>
              Pending: <strong>{stats.pending}</strong>
            </span>
            <span className={styles.statsItem}>
              Approved: <strong>{stats.approved}</strong>
            </span>
            <span className={styles.statsItem}>
              Rejected: <strong>{stats.rejected}</strong>
            </span>
            <span className={styles.statsItem}>
              Removed: <strong>{stats.removed}</strong>
            </span>
          </div>
        </div>
      </div>

      <p className={styles.pageSubtitle}>
        Review and approve seller submissions for Curated For You and New
        Collections.
      </p>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by product, store, or seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
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

          {(search || statusFilter !== "all" || sectionFilter !== "all") && (
            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSectionFilter("all");
              }}
            >
              <FiX size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {showLoadingState ? (
        <div className={styles.tableContainer}>
          <SkeletonLoader count={8} />
        </div>
      ) : filteredRequests.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.reqTable}>
            <thead>
              <tr>
                <th className={styles.productCell}>Product</th>
                <th className={styles.sellerCell}>Seller</th>
                <th className={styles.planCell}>Plan</th>
                <th className={styles.sectionCell}>Section</th>
                <th className={styles.statusCell}>Status</th>
                <th className={styles.dateCell}>Submitted</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => {
                const status = getStatusBadge(r.status);
                return (
                  <tr key={r._id} className={styles.tableRow}>
                    <td className={styles.productCell} data-label="Product">
                      <div className={styles.productInfo}>
                        <img
                          src={
                            r.product?.thumbnail?.url ||
                            "/placeholder-image.jpg"
                          }
                          alt={r.product?.productName}
                          className={styles.productThumb}
                          onError={(e) => {
                            e.target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <span className={styles.productName}>
                          {r.product?.productName || "Deleted product"}
                        </span>
                      </div>
                    </td>

                    <td className={styles.sellerCell} data-label="Seller">
                      {r.seller?.storeInfo?.storeName ||
                        r.seller?.fullName ||
                        "Unknown seller"}
                    </td>

                    <td className={styles.planCell} data-label="Plan">
                      <span className={styles.planBadge}>
                        {r.seller?.subscriptionPlanId || "—"}
                      </span>
                    </td>

                    <td className={styles.sectionCell} data-label="Section">
                      {r.section}
                    </td>

                    <td className={styles.statusCell} data-label="Status">
                      <span
                        className={`${styles.statusBadge} ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {r.status === "rejected" && r.rejectionReason && (
                        <div className={styles.rejectionReason}>
                          {r.rejectionReason}
                        </div>
                      )}
                    </td>

                    <td className={styles.dateCell} data-label="Submitted">
                      <div className={styles.dateInfo}>
                        <FiCalendar size={12} />
                        <span>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className={styles.actionsCell} data-label="Actions">
                      <div className={styles.actions}>
                        {r.status === "pending" && (
                          <div className={styles.actionBtnGroup}>
                            <button
                              className={`${styles.actionIconBtn} ${styles.approveIconBtn}`}
                              onClick={() => setApproveTarget(r)}
                              disabled={isSaving}
                              title="Approve request"
                            >
                              <FiCheck size={14} />
                              <span className={styles.actionBtnLabel}>
                                Approve
                              </span>
                            </button>
                            <button
                              className={`${styles.actionIconBtn} ${styles.rejectIconBtn}`}
                              onClick={() => setRejectTarget(r)}
                              disabled={isSaving}
                              title="Reject request"
                            >
                              <FiX size={14} />
                              <span className={styles.actionBtnLabel}>
                                Reject
                              </span>
                            </button>
                          </div>
                        )}
                        {r.status === "approved" && (
                          <button
                            className={`${styles.actionIconBtn} ${styles.removeIconBtn}`}
                            onClick={() => handleRemove(r)}
                            disabled={isSaving}
                            title="Remove from homepage"
                          >
                            <FiTrash2 size={14} />
                            <span className={styles.actionBtnLabel}>
                              Remove
                            </span>
                          </button>
                        )}
                        {(r.status === "rejected" ||
                          r.status === "removed") && (
                          <span className={styles.mutedNote}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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