// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellerRequests.jsx

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiMapPin,
  FiCalendar,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";
import styles from "./SellerRequests.module.css";

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
  }, [filter, page, search]);

  const handleStatusChange = async (sellerId, status, reason = "") => {
    setActionLoading(sellerId);
    try {
      let endpoint = "";
      let method = "put";
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
        method: method,
        url: endpoint,
        data: data,
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
      pending: { label: "Pending", className: styles.pending },
      approved: { label: "Approved", className: styles.approved },
      rejected: { label: "Rejected", className: styles.rejected },
      suspended: { label: "Suspended", className: styles.suspended },
      under_review: { label: "Under Review", className: styles.underReview },
    };
    return badges[status] || { label: status, className: styles.pending };
  };

  const getKycBadge = (kycStatus) => {
    const badges = {
      not_submitted: { label: "Not submitted", className: styles.pending },
      submitted: { label: "Submitted", className: styles.underReview },
      under_review: { label: "Reviewing", className: styles.underReview },
      verified: { label: "Verified", className: styles.approved },
      rejected: { label: "Rejected", className: styles.rejected },
    };
    return (
      badges[kycStatus] || {
        label: kycStatus || "Not submitted",
        className: styles.pending,
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

  const renderStatusActions = (seller) => {
    if (seller.status === "pending") {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.approveBtn}`}
            onClick={() => handleStatusChange(seller._id, "approved")}
            disabled={actionLoading === seller._id}
          >
            <FiCheck size={16} /> Approve
          </button>
          <button
            className={`${styles.actionBtn} ${styles.rejectBtn}`}
            onClick={() => {
              const reason = prompt("Enter rejection reason:");
              if (reason !== null)
                handleStatusChange(seller._id, "rejected", reason);
            }}
            disabled={actionLoading === seller._id}
          >
            <FiX size={16} /> Reject
          </button>
        </div>
      );
    }

    if (seller.status === "approved") {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.suspendBtn}`}
            onClick={() => {
              const reason = prompt("Enter suspension reason:");
              if (reason !== null)
                handleStatusChange(seller._id, "suspended", reason);
            }}
            disabled={actionLoading === seller._id}
          >
            <FiAlertCircle size={16} /> Suspend
          </button>
        </div>
      );
    }

    if (seller.status === "suspended") {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.unsuspendBtn}`}
            onClick={() => handleStatusChange(seller._id, "unsuspend")}
            disabled={actionLoading === seller._id}
          >
            <FiCheck size={16} /> Unsuspend
          </button>
        </div>
      );
    }

    return null;
  };

  // Only offer KYC approve/reject once the seller has actually submitted something
  const renderKycActions = (seller) => {
    const kycStatus = seller.kyc?.status || "not_submitted";

    if (kycStatus === "submitted" || kycStatus === "under_review") {
      return (
        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionBtn} ${styles.approveBtn}`}
            onClick={() => handleKycChange(seller._id, "verified")}
            disabled={kycActionLoading === seller._id}
          >
            <FiShield size={16} /> Verify KYC
          </button>
          <button
            className={`${styles.actionBtn} ${styles.rejectBtn}`}
            onClick={() => {
              const reason = prompt("Enter KYC rejection reason:");
              if (reason !== null)
                handleKycChange(seller._id, "rejected", reason);
            }}
            disabled={kycActionLoading === seller._id}
          >
            <FiX size={16} /> Reject KYC
          </button>
        </div>
      );
    }

    if (kycStatus === "verified") {
      return <span className={styles.kycVerifiedNote}>KYC verified</span>;
    }

    if (kycStatus === "rejected") {
      return (
        <button
          className={`${styles.actionBtn} ${styles.approveBtn}`}
          onClick={() => handleKycChange(seller._id, "verified")}
          disabled={kycActionLoading === seller._id}
        >
          <FiShield size={16} /> Verify anyway
        </button>
      );
    }

    return <span className={styles.kycWaitingNote}>Awaiting submission</span>;
  };

  if (loading && sellers.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <FiLoader className={styles.spinner} />
        <p>Loading seller requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.sellerRequests}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Seller Requests</h2>
          <p className={styles.subtitle}>
            Manage seller registrations and approvals
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterBox}>
            <FiFilter className={styles.filterIcon} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.statItem} ${styles.pendingStat}`}>
            <span className={styles.statNumber}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={`${styles.statItem} ${styles.approvedStat}`}>
            <span className={styles.statNumber}>{stats.approved}</span>
            <span className={styles.statLabel}>Approved</span>
          </div>
          <div className={`${styles.statItem} ${styles.rejectedStat}`}>
            <span className={styles.statNumber}>{stats.rejected}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
          <div className={`${styles.statItem} ${styles.suspendedStat}`}>
            <span className={styles.statNumber}>{stats.suspended}</span>
            <span className={styles.statLabel}>Suspended</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Seller</th>
              <th>Contact</th>
              <th>Store</th>
              <th>Account status</th>
              <th>KYC status</th>
              <th>Date</th>
              <th>Account actions</th>
              <th>KYC actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  <div className={styles.emptyState}>
                    <FiUser size={40} />
                    <p>No seller requests found</p>
                  </div>
                </td>
              </tr>
            ) : (
              sellers.map((seller) => {
                const status = getStatusBadge(seller.status);
                const kyc = getKycBadge(seller.kyc?.status);
                return (
                  <tr key={seller._id}>
                    <td>
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
                    <td>
                      <div className={styles.contactInfo}>
                        <div>
                          <FiMail size={14} /> {seller.email}
                        </div>
                        <div>
                          <FiPhone size={14} /> {seller.phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.storeInfo}>
                        <strong>{seller.storeInfo?.storeName}</strong>
                        <span>
                          {seller.productCategories?.join(", ") ||
                            "No categories"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td>
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
                    <td>
                      <div className={styles.dateInfo}>
                        <FiCalendar size={14} />
                        <span>
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => onViewSeller(seller)}
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        {renderStatusActions(seller)}
                      </div>
                    </td>
                    <td>{renderKycActions(seller)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageBtn} ${page === 1 ? styles.disabled : ""}`}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FiChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={`${styles.pageBtn} ${page === totalPages ? styles.disabled : ""}`}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellerRequests;
