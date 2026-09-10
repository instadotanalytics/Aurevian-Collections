
// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellersProducts/SellersProducts.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiEye,
  FiPackage,
  FiUsers,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiBox,
  FiX,
} from "react-icons/fi";
import styles from "./SellersProducts.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Skeleton Loader Component (mirrors SellerRequests' row skeleton, with a
// products column instead of a KYC column)
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
          <div className={styles.skeletonProducts}></div>
          <div className={styles.skeletonActions}>
            <div className={styles.skeletonIcon}></div>
            <div className={styles.skeletonIcon}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SellersProducts = ({ onViewSeller, onViewSellerProducts }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);

  const token = localStorage.getItem("superAdminToken");

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_URL}/super-admin/sellers-products`,
        {
          params: { status: filter, page, limit: 10, search },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setSellers(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setTotalSellers(response.data.pagination.total);
      }
    } catch (err) {
      console.error("Error fetching sellers & products:", err);
      const message =
        err.response?.data?.message ||
        "Unable to load sellers. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, search]);

  // Reset to page 1 whenever the filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  // Reuses the exact same five-hue badge language as SellerRequests /
  // ProductManagement: grey = neutral, amber = pending, green = active,
  // blue = suspended, red = rejected.
  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pending", className: styles.statusPending },
      approved: { label: "Active", className: styles.statusApproved },
      rejected: { label: "Rejected", className: styles.statusRejected },
      suspended: { label: "Suspended", className: styles.statusSuspended },
      under_review: {
        label: "Under Review",
        className: styles.statusNeutral,
      },
    };
    return badges[status] || { label: status, className: styles.statusNeutral };
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "S";

  const getSerialNumber = (index) => (page - 1) * 10 + index + 1;

  const showLoadingState = loading && sellers.length === 0 && !error;

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiUsers size={60} className={styles.emptyIcon} />
      <h3>No sellers found</h3>
      <p>
        {search || filter !== "all"
          ? "Try adjusting your filters or search terms"
          : "Sellers will show up here once they're approved"}
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

  if (error && sellers.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiAlertCircle className={styles.errorIcon} />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchSellers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Sellers &amp; Products</h1>
          <span className={styles.countPill}>
            {totalSellers} seller{totalSellers === 1 ? "" : "s"}
          </span>
        </div>
        <p className={styles.headerSubtitle}>
          Browse catalogs across your marketplace
        </p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, email, store, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
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
                <th className={styles.statusCell}>Status</th>
                <th className={styles.productsCell}>Products</th>
                <th className={styles.dateCell}>Joined</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller, index) => {
                const status = getStatusBadge(seller.status);
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
                        <div>
                          <FiMail size={12} /> <span>{seller.email}</span>
                        </div>
                        {seller.phone && (
                          <div>
                            <FiPhone size={12} /> <span>{seller.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className={styles.storeCell} data-label="Store">
                      <div className={styles.storeInfo}>
                        <strong>
                          <FiShoppingBag size={12} />
                          {seller.storeInfo?.storeName || "—"}
                        </strong>
                      </div>
                    </td>

                    <td className={styles.statusCell} data-label="Status">
                      <span
                        className={`${styles.statusBadge} ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>

                    <td className={styles.productsCell} data-label="Products">
                      <div className={styles.productStats}>
                        <span className={styles.productStat}>
                          <FiBox size={12} />
                          {seller.productCounts.total}
                          <em>total</em>
                        </span>
                        <span className={styles.productStat}>
                          <FiPackage size={12} />
                          {seller.productCounts.published}
                          <em>live</em>
                        </span>
                      </div>
                    </td>

                    <td className={styles.dateCell} data-label="Joined">
                      <div className={styles.dateInfo}>
                        <FiCalendar size={12} />
                        <span>
                          {new Date(seller.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    <td className={styles.actionsCell} data-label="Actions">
                      <div className={styles.actions}>
                        <button
                          className={styles.actionIconBtn}
                          onClick={() => onViewSeller?.(seller)}
                          title="View seller"
                        >
                          <FiEye size={14} />
                          <span className={styles.actionBtnLabel}>Seller</span>
                        </button>
                        <button
                          className={`${styles.actionIconBtn} ${styles.productsIconBtn}`}
                          onClick={() => onViewSellerProducts?.(seller)}
                          title="View products"
                        >
                          <FiPackage size={14} />
                          <span className={styles.actionBtnLabel}>
                            Products
                          </span>
                        </button>
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

export default SellersProducts;