// src/Pages/Seller/SellerDashboard/Earnings.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiChevronRight,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiPercent,
  FiEye,
} from "react-icons/fi";
import styles from "./Earnings.module.css";
import { API_URL } from "../../../../utils/constants";

// ============================================
// API HELPER
// ============================================
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("sellerAccessToken");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

const formatINR = (amount) =>
  `₹${(Number(amount) || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const STATUS_META = {
  pending: { label: "Pending", cls: "pending", icon: FiClock },
  eligible: { label: "Eligible", cls: "eligible", icon: FiCheckCircle },
  processing: { label: "Processing", cls: "processing", icon: FiRefreshCw },
  paid: { label: "Paid", cls: "paidStatus", icon: FiCheckCircle },
  failed: { label: "Failed", cls: "failedStatus", icon: FiAlertCircle },
  cancelled: { label: "Cancelled", cls: "cancelledStatus", icon: FiX },
  reversed: { label: "Reversed", cls: "reversedStatus", icon: FiRefreshCw },
  refunded: { label: "Refunded", cls: "refunded", icon: FiAlertCircle },
};

const STATUS_FILTER_OPTIONS = [
  "all",
  "pending",
  "eligible",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "reversed",
  "refunded",
];

// ============================================
// SKELETON LOADER
// ============================================
const SkeletonLoader = () => (
  <div className={styles.skeletonContainer}>
    <div className={styles.skeletonHeader}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonButtons} />
    </div>
    <div className={styles.skeletonStats}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className={styles.skeletonStatCard}>
          <div className={styles.skeletonStatIcon} />
          <div className={styles.skeletonStatContent}>
            <div className={styles.skeletonStatLabel} />
            <div className={styles.skeletonStatValue} />
          </div>
        </div>
      ))}
    </div>
    <div className={styles.skeletonChart}>
      <div className={styles.skeletonChartHeader} />
      <div className={styles.skeletonChartBars}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.skeletonChartBar} />
        ))}
      </div>
    </div>
    <div className={styles.skeletonTable}>
      <div className={styles.skeletonTableHeader} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.skeletonTableRow} />
      ))}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
const Earnings = () => {
  const [period, setPeriod] = useState("this-month");
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [payoutState, setPayoutState] = useState({
    loading: false,
    message: null,
    isError: false,
  });

  // ---- Transaction history (ledger-backed, filterable) ----
  const [txRows, setTxRows] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState(null);
  const [txPagination, setTxPagination] = useState(null);
  const [txPage, setTxPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    from: "",
    to: "",
    sort: "recent",
  });

  // ---- Transaction detail drawer ----
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const searchDebounceRef = useRef(null);

  // ============================================
  // FETCHERS
  // ============================================
  const fetchSummary = useCallback(async () => {
    const res = await apiFetch("/seller/earnings/summary");
    setStats(res.data);
  }, []);

  const fetchChart = useCallback(async (selectedPeriod) => {
    setChartLoading(true);
    try {
      const res = await apiFetch(
        `/seller/earnings/chart?period=${selectedPeriod}`,
      );
      setChartData(res.data);
    } catch (err) {
      console.error("Error fetching earnings chart:", err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (page, currentFilters) => {
    setTxLoading(true);
    setTxError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "10");
      if (currentFilters.status !== "all")
        params.set("status", currentFilters.status);
      if (currentFilters.search) params.set("search", currentFilters.search);
      if (currentFilters.from) params.set("from", currentFilters.from);
      if (currentFilters.to) params.set("to", currentFilters.to);
      if (currentFilters.sort) params.set("sort", currentFilters.sort);

      const res = await apiFetch(`/seller/payouts?${params.toString()}`);
      setTxRows(res.data);
      setTxPagination(res.pagination);
    } catch (err) {
      setTxError(err.message || "Failed to load transactions");
    } finally {
      setTxLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([fetchSummary(), fetchChart(period)]);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load earnings data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSummary, fetchChart]);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTransactions(txPage, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPage, filters]);

  // Debounce the free-text search box before it hits the API.
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setTxPage(1);
      setFilters((f) => ({ ...f, search: searchInput.trim() }));
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchInput]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll();
    fetchTransactions(txPage, filters);
  }, [loadAll, fetchTransactions, txPage, filters]);

  const handlePeriodChange = useCallback(
    (newPeriod) => {
      setPeriod(newPeriod);
      fetchChart(newPeriod);
    },
    [fetchChart],
  );

  const handleFilterChange = (key, value) => {
    setTxPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const handleRequestPayout = useCallback(async () => {
    setPayoutState({ loading: true, message: null, isError: false });
    try {
      const res = await apiFetch("/seller/earnings/payout/request", {
        method: "POST",
      });
      setPayoutState({ loading: false, message: res.message, isError: false });
      fetchSummary();
      fetchTransactions(1, filters);
      setTxPage(1);
    } catch (err) {
      setPayoutState({ loading: false, message: err.message, isError: true });
    }
  }, [fetchSummary, fetchTransactions, filters]);

  const openDetail = useCallback(async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await apiFetch(`/seller/payouts/${id}`);
      setDetailData(res.data);
    } catch (err) {
      setDetailData({ error: err.message || "Failed to load transaction" });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailData(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <FiAlertCircle size={48} />
          <h2>{error}</h2>
          <p>Please try again later</p>
          <button onClick={handleRefresh} className={styles.retryBtn}>
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxChartValue = Math.max(1, ...chartData.map((d) => d.earnings));

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Earnings & Payouts</h1>
          <span className={styles.subtitle}>
            Track your sales, platform fees, and settlements
          </span>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw
              className={refreshing ? styles.spinning : ""}
              size={16}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ---- Required summary cards ---- */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiShoppingBag size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Sales</span>
            <span className={styles.statValue}>{stats.totalSalesCount}</span>
            <span className={styles.statChange}>
              Avg. {formatINR(stats.averageOrderValue)} per order
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiDollarSign size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Gross Earnings</span>
            <span className={styles.statValue}>
              {formatINR(stats.grossEarnings)}
            </span>
            {stats.monthOverMonthChangePercent != null ? (
              <span
                className={`${styles.statChange} ${stats.monthOverMonthChangePercent >= 0
                    ? styles.positive
                    : styles.negative
                  }`}
              >
                {stats.monthOverMonthChangePercent >= 0 ? (
                  <FiTrendingUp size={14} />
                ) : (
                  <FiTrendingDown size={14} />
                )}
                {stats.monthOverMonthChangePercent >= 0 ? "+" : ""}
                {stats.monthOverMonthChangePercent.toFixed(1)}% vs last month
              </span>
            ) : (
              <span className={styles.statChange}>Not enough history yet</span>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiPercent size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Platform Fees</span>
            <span className={styles.statValue}>
              {formatINR(stats.platformFees)}
            </span>
            <span className={styles.statChange}>
              {stats.commission.percent}% commission rate
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCreditCard size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Net Earnings</span>
            <span className={styles.statValue}>
              {formatINR(stats.netEarnings)}
            </span>
            <span className={`${styles.statChange} ${styles.negative}`}>
              <FiTrendingDown size={14} />
              Refunds: {formatINR(stats.refunds)}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiClock size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Pending Earnings</span>
            <span className={styles.statValue}>
              {formatINR(stats.pendingEarnings)}
            </span>
            <span className={styles.statChange}>Not yet delivered</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Available Balance</span>
            <span className={styles.statValue}>
              {formatINR(stats.availableBalance)}
            </span>
            <span className={styles.statChange}>
              <FiRefreshCw size={14} />
              {formatINR(stats.payout.totalAwaitingProcessing)} processing
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUsers size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Paid Out</span>
            <span className={styles.statValue}>
              {formatINR(stats.paidOut)}
            </span>
            <span className={styles.statChange}>Lifetime settlements</span>
          </div>
        </div>
      </div>

      {/* Period Selector — drives the chart only */}
      <div className={styles.periodSelector}>
        <button
          className={`${styles.periodBtn} ${period === "this-week" ? styles.active : ""}`}
          onClick={() => handlePeriodChange("this-week")}
        >
          This Week
        </button>
        <button
          className={`${styles.periodBtn} ${period === "this-month" ? styles.active : ""}`}
          onClick={() => handlePeriodChange("this-month")}
        >
          This Month
        </button>
        <button
          className={`${styles.periodBtn} ${period === "this-year" ? styles.active : ""}`}
          onClick={() => handlePeriodChange("this-year")}
        >
          This Year
        </button>
      </div>

      {/* Chart */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h3>
            {period === "this-week"
              ? "This Week"
              : period === "this-year"
                ? "This Year"
                : "This Month"}
            's Net Earnings
          </h3>
        </div>
        <div className={styles.chartContainer}>
          {chartLoading ? (
            <div className={styles.skeletonChartBars}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.skeletonChartBar} />
              ))}
            </div>
          ) : (
            <div className={styles.chartBars}>
              {chartData.map((item, index) => (
                <div key={index} className={styles.chartBarGroup}>
                  <div className={styles.chartBarWrapper}>
                    <div
                      className={styles.chartBar}
                      style={{
                        height: `${(item.earnings / maxChartValue) * 100}%`,
                      }}
                    >
                      {item.earnings > 0 && (
                        <span className={styles.chartBarValue}>
                          {formatINR(item.earnings)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={styles.chartLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Transaction History (ledger-backed) ---- */}
      <div className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h3>Transaction History</h3>
        </div>

        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} size={15} />
            <input
              type="text"
              placeholder="Search order # or product..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            {STATUS_FILTER_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : STATUS_META[s]?.label || s}
              </option>
            ))}
          </select>

          <input
            type="date"
            className={styles.dateInput}
            value={filters.from}
            onChange={(e) => handleFilterChange("from", e.target.value)}
            title="From date"
          />
          <input
            type="date"
            className={styles.dateInput}
            value={filters.to}
            onChange={(e) => handleFilterChange("to", e.target.value)}
            title="To date"
          />

          <select
            className={styles.filterSelect}
            value={filters.sort}
            onChange={(e) => handleFilterChange("sort", e.target.value)}
          >
            <option value="recent">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">Amount: high to low</option>
            <option value="amount-low">Amount: low to high</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          {txLoading ? (
            <div className={styles.skeletonTable}>
              <div className={styles.skeletonTableHeader} />
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonTableRow} />
              ))}
            </div>
          ) : txError ? (
            <div style={{ padding: 24, textAlign: "center", color: "#e74c3c" }}>
              {txError}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Gross</th>
                  <th>Platform Fee</th>
                  <th>Seller Net</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {txRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ textAlign: "center", padding: "24px" }}
                    >
                      No transactions match these filters
                    </td>
                  </tr>
                )}
                {txRows.map((tx) => {
                  const meta = STATUS_META[tx.status] || {
                    label: tx.status,
                    cls: "pending",
                    icon: FiClock,
                  };
                  const Icon = meta.icon;
                  return (
                    <tr key={tx._id}>
                      <td>
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className={styles.orderId}>{tx.orderNumber}</td>
                      <td>{tx.productNameSnapshot}</td>
                      <td>{tx.quantity}</td>
                      <td>{formatINR(tx.grossAmount)}</td>
                      <td>{formatINR(tx.commissionAmount)}</td>
                      <td className={styles.amount}>
                        {formatINR(tx.sellerNetAmount)}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${styles[meta.cls]}`}
                        >
                          <Icon size={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className={styles.orderId}>
                        {tx.referenceId || "—"}
                      </td>
                      <td>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openDetail(tx._id)}
                          title="View details"
                        >
                          <FiEye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {txPagination && txPagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              disabled={txPage <= 1}
              onClick={() => setTxPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {txPagination.currentPage} of {txPagination.totalPages}
            </span>
            <button
              className={styles.paginationBtn}
              disabled={txPage >= txPagination.totalPages}
              onClick={() => setTxPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Payout Summary */}
      <div className={styles.payoutSection}>
        <div className={styles.payoutCard}>
          <div className={styles.payoutHeader}>
            <FiCreditCard size={18} />
            <h4>Payout Summary</h4>
          </div>
          <div className={styles.payoutDetails}>
            <div className={styles.payoutItem}>
              <span>Available for Payout</span>
              <strong>{formatINR(stats.availableBalance)}</strong>
              {stats.payout.totalAwaitingProcessing > 0 && (
                <small>
                  {formatINR(stats.payout.totalAwaitingProcessing)} already
                  requested
                </small>
              )}
            </div>
            <div className={styles.payoutDivider} />
            <div className={styles.payoutItem}>
              <span>Payout Method</span>
              <strong>
                {stats.payout.method ? stats.payout.method.label : "Not set up"}
              </strong>
              {!stats.payout.method && (
                <small>Add bank/UPI details in your profile</small>
              )}
            </div>
            <div className={styles.payoutDivider} />
            <div className={styles.payoutItem}>
              <span>Minimum Payout</span>
              <strong>
                {formatINR(stats.payout.minimumPayoutAmount)}
              </strong>
              <small>
                {stats.payout.eligible ? "Reached ✓" : "Not reached yet"}
              </small>
            </div>
          </div>
          <button
            className={styles.payoutBtn}
            onClick={handleRequestPayout}
            disabled={!stats.payout.eligible || payoutState.loading}
            title={
              !stats.payout.method
                ? "Add bank/UPI details first"
                : !stats.payout.eligible
                  ? "Below minimum payout amount"
                  : undefined
            }
          >
            {payoutState.loading ? "Requesting..." : "Request Payout"}{" "}
            <FiChevronRight size={16} />
          </button>
          {payoutState.message && (
            <p
              style={{
                color: payoutState.isError ? "#EF4444" : "#10B981",
                marginTop: 8,
                fontSize: 13,
              }}
            >
              {payoutState.message}
            </p>
          )}
        </div>

        <div className={styles.quickStats}>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Best Day</span>
            {stats.bestDay ? (
              <>
                <strong className={styles.quickStatValue}>
                  {formatINR(stats.bestDay.amount)}
                </strong>
                <small>
                  {new Date(stats.bestDay.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </small>
              </>
            ) : (
              <strong className={styles.quickStatValue}>No sales yet</strong>
            )}
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Best Product</span>
            {stats.bestProduct ? (
              <>
                <strong className={styles.quickStatValue}>
                  {stats.bestProduct.name}
                </strong>
                <small>{stats.bestProduct.unitsSold} units sold</small>
              </>
            ) : (
              <strong className={styles.quickStatValue}>No sales yet</strong>
            )}
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Conversion Rate</span>
            <strong className={styles.quickStatValue}>Not enough data</strong>
            <small>Needs visitor/session tracking</small>
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Rating</span>
            {stats.rating != null ? (
              <>
                <strong className={styles.quickStatValue}>
                  <FiStar size={16} /> {stats.rating.toFixed(1)}
                </strong>
                <small>{stats.reviewCount} reviews</small>
              </>
            ) : (
              <strong className={styles.quickStatValue}>No reviews yet</strong>
            )}
          </div>
        </div>
      </div>

      {/* ---- Transaction Detail Modal ---- */}
      {detailOpen && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Transaction Details</h3>
              <button className={styles.modalClose} onClick={closeDetail}>
                <FiX size={18} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: 32, textAlign: "center" }}>Loading...</div>
            ) : detailData?.error ? (
              <div style={{ padding: 24, color: "#e74c3c" }}>
                {detailData.error}
              </div>
            ) : (
              detailData?.transaction && (
                <div className={styles.detailGrid}>
                  <div className={styles.detailRow}>
                    <span>Product</span>
                    <strong>
                      {detailData.transaction.productNameSnapshot}
                    </strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Order ID</span>
                    <strong>{detailData.transaction.orderNumber}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Quantity</span>
                    <strong>{detailData.transaction.quantity}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Unit Price (snapshot)</span>
                    <strong>
                      {formatINR(detailData.transaction.unitPriceSnapshot)}
                    </strong>
                  </div>
                  <div className={styles.detailDivider} />
                  <div className={styles.detailRow}>
                    <span>Gross Sale (Price × Qty)</span>
                    <strong>{formatINR(detailData.transaction.grossAmount)}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>
                      Platform Commission (
                      {detailData.transaction.commissionPercentSnapshot}%)
                    </span>
                    <strong className={styles.negative}>
                      − {formatINR(detailData.transaction.commissionAmount)}
                    </strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Seller Earnings</span>
                    <strong className={styles.positive}>
                      {formatINR(detailData.transaction.sellerNetAmount)}
                    </strong>
                  </div>
                  <div className={styles.detailDivider} />
                  <div className={styles.detailRow}>
                    <span>Status</span>
                    <strong>
                      {STATUS_META[detailData.transaction.status]?.label ||
                        detailData.transaction.status}
                    </strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Reference ID</span>
                    <strong>{detailData.transaction.referenceId || "—"}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Created</span>
                    <strong>
                      {new Date(
                        detailData.transaction.createdAt,
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  {detailData.transaction.paidAt && (
                    <div className={styles.detailRow}>
                      <span>Paid On</span>
                      <strong>
                        {new Date(
                          detailData.transaction.paidAt,
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  )}

                  {detailData.reversals?.length > 0 && (
                    <>
                      <div className={styles.detailDivider} />
                      <div className={styles.detailRow}>
                        <span>Refund / Reversal History</span>
                      </div>
                      {detailData.reversals.map((rv) => (
                        <div key={rv._id} className={styles.detailRow}>
                          <span>{rv.reversalReason || "Adjustment"}</span>
                          <strong className={styles.negative}>
                            {formatINR(rv.sellerNetAmount)}
                          </strong>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;