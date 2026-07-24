// src/Pages/SuperAdmin/SuperAdminDashboard/components/PaymentsManagement/PaymentsManagement.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiDollarSign,
  FiRefreshCw,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSlash,
} from "react-icons/fi";
import styles from "./PaymentsManagement.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_TABS = [
  "all",
  "paid",
  "created",
  "failed",
  "cancelled",
  "expired",
];

const formatAmount = (paise) => `₹${(paise / 100).toLocaleString("en-IN")}`;

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const token = localStorage.getItem("superAdminToken");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/super-admin/payments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status, search: search || undefined, page, limit: 15 },
        }),
        axios.get(`${API_URL}/super-admin/payments/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (paymentsRes.data.success) {
        setPayments(paymentsRes.data.data);
        setPagination(paymentsRes.data.pagination);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [status, search, page, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusIcon = (s) => {
    switch (s) {
      case "paid":
        return <FiCheckCircle />;
      case "failed":
        return <FiXCircle />;
      case "cancelled":
        return <FiSlash />;
      default:
        return <FiClock />;
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <FiRefreshCw className={styles.spinner} />
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className={styles.paymentsManagement}>
      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>
            {formatAmount(stats?.totalRevenue || 0)}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Paid Orders</span>
          <span className={styles.statValue}>
            {stats?.totalPaidOrders || 0}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Created</span>
          <span className={styles.statValue}>
            {stats?.byStatus?.created || 0}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Failed</span>
          <span className={styles.statValue}>
            {stats?.byStatus?.failed || 0}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Cancelled</span>
          <span className={styles.statValue}>
            {stats?.byStatus?.cancelled || 0}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              className={`${styles.tab} ${status === s ? styles.tabActive : ""}`}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search seller, store, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>Seller</th>
              <th>Store</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Order ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p._id}>
                  <td>{p.seller?.fullName || p.seller?.email || "—"}</td>
                  <td>{p.seller?.storeInfo?.storeName || "—"}</td>
                  <td>{p.planName}</td>
                  <td>{formatAmount(p.amount)}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[p.status]}`}
                    >
                      {statusIcon(p.status)} {p.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.modeTag}>
                      {p.isMockPayment ? "Test" : "Live"}
                    </span>
                  </td>
                  <td className={styles.orderId}>{p.razorpayOrderId}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;
