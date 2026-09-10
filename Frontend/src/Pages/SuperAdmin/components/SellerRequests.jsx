
// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellerRequests.jsx

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import styles from "./SellerRequests.module.css";

// Skeleton Loader Component (mirrors ProductManagement's SkeletonLoader)
const SkeletonLoader = ({ count = 8 }) => {
  return (
    <div className={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <div className={styles.skeletonIndex}></div>
          <div className={styles.skeletonAvatar}></div>
          <div className={styles.skeletonName}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLineShort}></div>
          </div>
          <div className={styles.skeletonContact}></div>
          <div className={styles.skeletonStore}></div>
          <div className={styles.skeletonStatus}></div>
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

const SellerRequests = ({ onViewSeller }) => {
  const dispatch = useDispatch();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [kycActionLoading, setKycActionLoading] = useState(null);

  const token = localStorage.getItem("superAdminToken");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/super-admin/sellers?status=${filter}&page=${page}&limit=10&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setSellers(response.data.data);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to fetch seller requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, search]);

  const handleStatusChange = async (sellerId, status, reason = "") => {
    setActionLoading(sellerId);
    try {
      let endpoint = "";
      let data = {};

      switch (status) {
        case "approved":
          endpoint = `/api/super-admin/sellers/${sellerId}/approve`;
          break;
        case "rejected":
          endpoint = `/api/super-admin/sellers/${sellerId}/reject`;
          data = { reason: reason || "Application rejected" };
          break;
        case "suspended":
          endpoint = `/api/super-admin/sellers/${sellerId}/suspend`;
          data = { reason: reason || "Terms violation" };
          break;
        case "unsuspend":
          endpoint = `/api/super-admin/sellers/${sellerId}/unsuspend`;
          break;
        default:
          return;
      }

      const response = await axios({
        method: "put",
        url: endpoint,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(`Seller ${status} successfully`);
        fetchSellers();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to ${status} seller`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================
  // KYC ACTIONS — independent from account status above
  // ============================================
  const handleKycChange = async (sellerId, status, reason = "") => {
    setKycActionLoading(sellerId);
    try {
      const response = await axios.put(
        `/api/super-admin/sellers/${sellerId}/verify-kyc`,
        { status, reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        toast.success(`KYC ${status} successfully`);
        fetchSellers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update KYC`);
    } finally {
      setKycActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pending", className: styles.statusPending },
      approved: { label: "Approved", className: styles.statusApproved },
      rejected: { label: "Rejected", className: styles.statusRejected },
      suspended: { label: "Suspended", className: styles.statusSuspended },
      under_review: {
        label: "Under Review",
        className: styles.statusNeutral,
      },
    };
    return badges[status] || { label: status, className: styles.statusNeutral };
  };

  const getKycBadge = (kycStatus) => {
    const badges = {
      not_submitted: {
        label: "Not submitted",
        className: styles.statusNeutral,
      },
      submitted: { label: "Submitted", className: styles.statusPending },
      under_review: { label: "Reviewing", className: styles.statusSuspended },
      verified: { label: "Verified", className: styles.statusApproved },
      rejected: { label: "Rejected", className: styles.statusRejected },
    };
    return (
      badges[kycStatus] || {
        label: kycStatus || "Not submitted",
        className: styles.statusNeutral,
      }
    );
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "S"
    );
  };

  const getSerialNumber = (index) => (page - 1) * 10 + index + 1;

  const renderStatusActions = (seller) => {
    if (seller.status === "pending") {
      return (
        <div className={styles.actionBtnGroup}>
          <button
            className={`${styles.actionIconBtn} ${styles.approveIconBtn}`}
            onClick={() => handleStatusChange(seller._id, "approved")}
            disabled={actionLoading === seller._id}
            title="Approve seller"
          >
            <FiCheck size={14} />
            <span className={styles.actionBtnLabel}>Approve</span>
          </button>
          <button
            className={`${styles.actionIconBtn} ${styles.rejectIconBtn}`}
            onClick={() => {
              const reason = prompt("Enter rejection reason:");
              if (reason !== null)
                handleStatusChange(seller._id, "rejected", reason);
            }}
            disabled={actionLoading === seller._id}
            title="Reject seller"
          >
            <FiX size={14} />
            <span className={styles.actionBtnLabel}>Reject</span>
          </button>
        </div>
      );
    }

    if (seller.status === "approved") {
      return (
        <div className={styles.actionBtnGroup}>
          <button
            className={`${styles.actionIconBtn} ${styles.suspendIconBtn}`}
            onClick={() => {
              const reason = prompt("Enter suspension reason:");
              if (reason !== null)
                handleStatusChange(seller._id, "suspended", reason);
            }}
            disabled={actionLoading === seller._id}
            title="Suspend seller"
          >
            <FiAlertCircle size={14} />
            <span className={styles.actionBtnLabel}>Suspend</span>
          </button>
        </div>
      );
    }

    if (seller.status === "suspended") {
      return (
        <div className={styles.actionBtnGroup}>
          <button
            className={`${styles.actionIconBtn} ${styles.unsuspendIconBtn}`}
            onClick={() => handleStatusChange(seller._id, "unsuspend")}
            disabled={actionLoading === seller._id}
            title="Unsuspend seller"
          >
            <FiCheck size={14} />
            <span className={styles.actionBtnLabel}>Unsuspend</span>
          </button>
        </div>
      );
    }

    return <span className={styles.mutedNote}>—</span>;
  };

  // Only offer KYC approve/reject once the seller has actually submitted something
  const renderKycActions = (seller) => {
    const kycStatus = seller.kyc?.status || "not_submitted";

    if (kycStatus === "submitted" || kycStatus === "under_review") {
      return (
        <div className={styles.actionBtnGroup}>
          <button
            className={`${styles.actionIconBtn} ${styles.approveIconBtn}`}
            onClick={() => handleKycChange(seller._id, "verified")}
            disabled={kycActionLoading === seller._id}
            title="Verify KYC"
          >
            <FiShield size={14} />
            <span className={styles.actionBtnLabel}>Verify</span>
          </button>
          <button
            className={`${styles.actionIconBtn} ${styles.rejectIconBtn}`}
            onClick={() => {
              const reason = prompt("Enter KYC rejection reason:");
              if (reason !== null)
                handleKycChange(seller._id, "rejected", reason);
            }}
            disabled={kycActionLoading === seller._id}
            title="Reject KYC"
          >
            <FiX size={14} />
            <span className={styles.actionBtnLabel}>Reject</span>
          </button>
        </div>
      );
    }

    if (kycStatus === "verified") {
      return <span className={styles.verifiedNote}>KYC verified</span>;
    }

    if (kycStatus === "rejected") {
      return (
        <button
          className={`${styles.actionIconBtn} ${styles.approveIconBtn}`}
          onClick={() => handleKycChange(seller._id, "verified")}
          disabled={kycActionLoading === seller._id}
          title="Verify anyway"
        >
          <FiShield size={14} />
          <span className={styles.actionBtnLabel}>Verify anyway</span>
        </button>
      );
    }

    return <span className={styles.mutedNote}>Awaiting submission</span>;
  };

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiUsers size={60} className={styles.emptyIcon} />
      <h3>No seller requests found</h3>
      <p>
        {search || filter !== "all"
          ? "Try adjusting your filters or search terms"
          : "Seller applications will show up here once submitted"}
      </p>
      {(search || filter !== "all") && (
        <button
          className={styles.clearFiltersBtn}
          onClick={() => {
            setSearch("");
            setFilter("all");
            setPage(1);
          }}
        >
          <FiX size={18} />
          Clear All Filters
        </button>
      )}
    </div>
  );

  const showLoadingState = loading && sellers.length === 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Seller Requests</h1>
          <span className={styles.countPill}>{stats?.total ?? 0} sellers</span>
        </div>
        {stats && (
          <div className={styles.headerRight}>
            <div className={styles.statsBar}>
              <span className={styles.statsLabel}>
                <FiUser size={14} />
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
                Suspended: <strong>{stats.suspended}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search sellers..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => {
              setPage(1);
              setFilter(e.target.value);
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
            <option value="under_review">Under Review</option>
          </select>

          {(search || filter !== "all") && (
            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setSearch("");
                setFilter("all");
                setPage(1);
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
      ) : sellers.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.sellerTable}>
            <thead>
              <tr>
                <th className={styles.indexCell}>#</th>
                <th className={styles.sellerCell}>Seller</th>
                <th className={styles.contactCell}>Contact</th>
                <th className={styles.storeCell}>Store</th>
                <th className={styles.statusCell}>Account status</th>
                <th className={styles.statusCell}>KYC status</th>
                <th className={styles.dateCell}>Date</th>
                <th className={styles.actionsCell}>Account actions</th>
                <th className={styles.actionsCell}>KYC actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, index) => {
                const status = getStatusBadge(seller.status);
                const kyc = getKycBadge(seller.kyc?.status);
                const serialNumber = getSerialNumber(index);

                return (
                  <tr key={seller._id} className={styles.tableRow}>
                    <td className={styles.indexCell} data-label="#">
                      <span className={styles.indexNumber}>
                        {serialNumber}
                      </span>
                    </td>

                    <td className={styles.sellerCell} data-label="Seller">
                      <div className={styles.sellerInfo}>
                        <div className={styles.sellerAvatar}>
                          {seller.profileImage ? (
                            <img
                              src={seller.profileImage}
                              alt={seller.fullName}
                            />
                          ) : (
                            <span>{getInitials(seller.fullName)}</span>
                          )}
                        </div>
                        <div>
                          <div className={styles.sellerName}>
                            {seller.fullName}
                          </div>
                          <div className={styles.sellerId}>
                            ID: {seller._id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className={styles.contactCell} data-label="Contact">
                      <div className={styles.contactInfo}>
                        <div title={seller.email}>
                          <FiMail size={12} />
                          <span>{seller.email}</span>
                        </div>
                        <div>
                          <FiPhone size={12} />
                          <span>{seller.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className={styles.storeCell} data-label="Store">
                      <div className={styles.storeInfo}>
                        <strong title={seller.storeInfo?.storeName}>
                          {seller.storeInfo?.storeName}
                        </strong>
                        <span>
                          {seller.productCategories?.join(", ") ||
                            "No categories"}
                        </span>
                      </div>
                    </td>

                    <td
                      className={styles.statusCell}
                      data-label="Account status"
                    >
                      <span
                        className={`${styles.statusBadge} ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className={styles.statusCell} data-label="KYC status">
                      <span
                        className={`${styles.statusBadge} ${kyc.className}`}
                      >
                        {kyc.label}
                      </span>
                      {seller.kyc?.status === "rejected" &&
                        seller.kyc?.rejectionReason && (
                          <div className={styles.kycReason}>
                            {seller.kyc.rejectionReason}
                          </div>
                        )}
                    </td>

                    <td className={styles.dateCell} data-label="Date">
                      <div className={styles.dateInfo}>
                        <FiCalendar size={12} />
                        <span>
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td
                      className={styles.actionsCell}
                      data-label="Account actions"
                    >
                      <div className={styles.actions}>
                        <button
                          className={styles.actionIconBtn}
                          onClick={() => onViewSeller(seller)}
                          title="View details"
                        >
                          <FiEye size={14} />
                          <span className={styles.actionBtnLabel}>View</span>
                        </button>
                        {renderStatusActions(seller)}
                      </div>
                    </td>

                    <td className={styles.actionsCell} data-label="KYC actions">
                      <div className={styles.actions}>
                        {renderKycActions(seller)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!showLoadingState && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FiChevronLeft size={18} />
          </button>

          <div className={styles.paginationPages}>
            {[...Array(totalPages)].map((_, i) => {
              const p = i + 1;
              const isActive = p === page;
              const isNearCurrent = Math.abs(p - page) <= 2;
              const isFirst = p === 1;
              const isLast = p === totalPages;

              if (isNearCurrent || isFirst || isLast) {
                return (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${
                      isActive ? styles.activePage : ""
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              }

              if (
                (p === page - 3 && page > 4) ||
                (p === page + 3 && page < totalPages - 3)
              ) {
                return (
                  <span key={p} className={styles.pageDots}>
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            className={styles.paginationBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerRequests;