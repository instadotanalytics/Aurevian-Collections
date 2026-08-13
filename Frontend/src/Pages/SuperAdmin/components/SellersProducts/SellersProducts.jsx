// src/Pages/SuperAdmin/SuperAdminDashboard/components/SellersProducts/SellersProducts.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiPackage,
  FiUser,
  FiMail,
  FiPhone,
  FiShoppingBag,
  FiCalendar,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiBox,
} from "react-icons/fi";
import styles from "./SellersProducts.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
          params: { status: filter, page, limit: 12, search },
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Pending", className: styles.pending },
      approved: { label: "Active", className: styles.approved },
      rejected: { label: "Rejected", className: styles.rejected },
      suspended: { label: "Suspended", className: styles.suspended },
      under_review: { label: "Under Review", className: styles.underReview },
    };
    return badges[status] || { label: status, className: styles.pending };
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "S";

  if (loading && sellers.length === 0 && !error) {
    return (
      <div className={styles.loadingContainer}>
        <FiLoader className={styles.spinner} />
        <p>Loading sellers...</p>
      </div>
    );
  }

  if (error && sellers.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <FiAlertCircle className={styles.errorIcon} />
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={fetchSellers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.sellersProducts}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Sellers &amp; Products</h2>
          <p className={styles.subtitle}>
            {totalSellers} seller{totalSellers === 1 ? "" : "s"} · browse
            catalogs across your marketplace
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, email, store, phone..."
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
              <option value="approved">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {sellers.length === 0 ? (
        <div className={styles.emptyState}>
          <FiUser size={40} />
          <p>No sellers found.</p>
        </div>
      ) : (
        <div className={styles.sellerGrid}>
          {sellers.map((seller) => {
            const status = getStatusBadge(seller.status);
            return (
              <div key={seller._id} className={styles.sellerCard}>
                <div className={styles.cardTop}>
                  <div className={styles.sellerAvatar}>
                    {seller.profileImage ? (
                      <img src={seller.profileImage} alt={seller.fullName} />
                    ) : (
                      <span>{getInitials(seller.fullName)}</span>
                    )}
                  </div>
                  <span className={`${styles.statusBadge} ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <h3 className={styles.sellerName}>{seller.fullName}</h3>
                {seller.storeInfo?.storeName && (
                  <div className={styles.storeName}>
                    <FiShoppingBag size={13} />
                    {seller.storeInfo.storeName}
                  </div>
                )}

                <div className={styles.contactList}>
                  <div className={styles.contactRow}>
                    <FiMail size={13} />
                    <span>{seller.email}</span>
                  </div>
                  {seller.phone && (
                    <div className={styles.contactRow}>
                      <FiPhone size={13} />
                      <span>{seller.phone}</span>
                    </div>
                  )}
                  <div className={styles.contactRow}>
                    <FiCalendar size={13} />
                    <span>
                      Joined {new Date(seller.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <FiBox size={16} />
                    <div>
                      <span className={styles.statValue}>
                        {seller.productCounts.total}
                      </span>
                      <span className={styles.statLabel}>Products</span>
                    </div>
                  </div>
                  <div className={styles.statBox}>
                    <FiPackage size={16} />
                    <div>
                      <span className={styles.statValue}>
                        {seller.productCounts.published}
                      </span>
                      <span className={styles.statLabel}>Published</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.viewSellerBtn}
                    onClick={() => onViewSeller?.(seller)}
                  >
                    <FiEye size={15} /> View Seller
                  </button>
                  <button
                    className={styles.viewProductsBtn}
                    onClick={() => onViewSellerProducts?.(seller)}
                  >
                    <FiPackage size={15} /> View Products
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageBtn} ${page === 1 ? styles.disabled : ""}`}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <FiChevronLeft size={16} /> Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={`${styles.pageBtn} ${page === totalPages ? styles.disabled : ""}`}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SellersProducts;
