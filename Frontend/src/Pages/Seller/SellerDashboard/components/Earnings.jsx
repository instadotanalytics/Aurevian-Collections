// src/Pages/Seller/SellerDashboard/Earnings.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiCalendar,
  FiDownload,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiStar,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import styles from "./Earnings.module.css";
import { API_URL } from "../../../../utils/constants";

// ============================================
// THROTTLE & DEBOUNCE UTILITIES (unchanged)
// ============================================
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============================================
// API HELPER
// Reads whichever seller token is stored — swap for your shared axios
// instance if one exists; nothing else in this file needs to change.
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

// ============================================
// SKELETON LOADER COMPONENT (unchanged)
// ============================================
const SkeletonLoader = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonButtons} />
      </div>
      <div className={styles.skeletonStats}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonStatCard}>
            <div className={styles.skeletonStatIcon} />
            <div className={styles.skeletonStatContent}>
              <div className={styles.skeletonStatLabel} />
              <div className={styles.skeletonStatValue} />
              <div className={styles.skeletonStatChange} />
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
};

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
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [payoutState, setPayoutState] = useState({
    loading: false,
    message: null,
    isError: false,
  });

  const refreshThrottleRef = useRef(null);

  // ============================================
  // FETCH: SUMMARY + TRANSACTIONS (lifetime — not period-scoped)
  // ============================================
  const fetchSummaryAndTransactions = useCallback(async () => {
    const [summaryRes, txRes] = await Promise.all([
      apiFetch("/seller/earnings/summary"),
      apiFetch("/seller/earnings/transactions?page=1&limit=10"),
    ]);
    setStats(summaryRes.data);
    setRecentTransactions(txRes.data);
  }, []);

  // ============================================
  // FETCH: CHART (period-scoped — this is what This Week/Month/Year drives)
  // ============================================
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

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([fetchSummaryAndTransactions(), fetchChart(period)]);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load earnings data");
      console.error("Error fetching earnings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSummaryAndTransactions, fetchChart]);

  const handleRefresh = useCallback(() => {
    if (refreshThrottleRef.current) return;
    refreshThrottleRef.current = throttle(() => {
      setRefreshing(true);
      loadAll();
      refreshThrottleRef.current = null;
    }, 2000)();
    setTimeout(() => {
      refreshThrottleRef.current = null;
    }, 2000);
  }, [loadAll]);

  const handlePeriodChange = useCallback(
    (newPeriod) => {
      setPeriod(newPeriod);
      fetchChart(newPeriod);
    },
    [fetchChart],
  );

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestPayout = useCallback(async () => {
    setPayoutState({ loading: true, message: null, isError: false });
    try {
      const res = await apiFetch("/seller/earnings/payout/request", {
        method: "POST",
      });
      setPayoutState({ loading: false, message: res.message, isError: false });
      // Refresh balances — the just-requested amount now counts as
      // "awaiting processing," not "available."
      fetchSummaryAndTransactions();
    } catch (err) {
      setPayoutState({ loading: false, message: err.message, isError: true });
    }
  }, [fetchSummaryAndTransactions]);

  // ============================================
  // RENDER HELPERS
  // ============================================
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className={styles.statusCompleted} />;
      case "pending":
        return <FiClock className={styles.statusPending} />;
      case "refunded":
        return <FiAlertCircle className={styles.statusRefunded} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
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
          <h1 className={styles.title}>Earnings</h1>
          <span className={styles.subtitle}>Track your sales & revenue</span>
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

      {/* Period Selector — drives the chart only; everything else below is lifetime */}
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

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiDollarSign size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Earnings</span>
            <span className={styles.statValue}>
              ₹{stats.totalEarnings.toLocaleString("en-IN")}
            </span>
            {stats.monthOverMonthChangePercent != null ? (
              <span
                className={`${styles.statChange} ${
                  stats.monthOverMonthChangePercent >= 0
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
                {stats.monthOverMonthChangePercent.toFixed(1)}% from last month
              </span>
            ) : (
              <span className={styles.statChange}>Not enough history yet</span>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCreditCard size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Available Balance</span>
            <span className={styles.statValue}>
              ₹{stats.availableBalance.toLocaleString("en-IN")}
            </span>
            <span className={styles.statChange}>
              <FiClock size={14} />₹
              {stats.pendingBalance.toLocaleString("en-IN")} pending
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiShoppingBag size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Orders</span>
            <span className={styles.statValue}>{stats.totalOrders}</span>
            <span className={styles.statChange}>
              Avg. ₹
              {Math.round(stats.averageOrderValue).toLocaleString("en-IN")} per
              order
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUsers size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Commission</span>
            <span className={styles.statValue}>
              {stats.commission.configured
                ? `₹${stats.commission.amount.toLocaleString("en-IN")}`
                : "Not configured"}
            </span>
            <span className={`${styles.statChange} ${styles.negative}`}>
              <FiTrendingDown size={14} />
              Refunds: ₹{stats.refunds.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h3>
            {period === "this-week"
              ? "This Week"
              : period === "this-year"
                ? "This Year"
                : "This Month"}
            's Earnings
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
                          ₹{item.earnings.toLocaleString("en-IN")}
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

      {/* Recent Transactions */}
      <div className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h3>Recent Transactions</h3>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "24px" }}
                  >
                    No transactions yet
                  </td>
                </tr>
              )}
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className={styles.orderId}>{tx.id}</td>
                  <td>
                    {new Date(tx.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>{tx.customer}</td>
                  <td
                    className={
                      tx.type === "refund" ? styles.refundAmount : styles.amount
                    }
                  >
                    {tx.type === "refund" ? "-" : ""}₹
                    {tx.amount.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[tx.status]}`}
                    >
                      {getStatusIcon(tx.status)}
                      {getStatusLabel(tx.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.typeBadge} ${styles[tx.type]}`}>
                      {tx.type === "sale" ? "Sale" : "Refund"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              <strong>₹{stats.availableBalance.toLocaleString("en-IN")}</strong>
              {stats.payout.totalAwaitingProcessing > 0 && (
                <small>
                  ₹
                  {stats.payout.totalAwaitingProcessing.toLocaleString("en-IN")}{" "}
                  already requested
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
                {stats.payout.minimumPayoutAmount != null
                  ? `₹${stats.payout.minimumPayoutAmount.toLocaleString("en-IN")}`
                  : "Not configured yet"}
              </strong>
              {stats.payout.minimumPayoutAmount != null && (
                <small>
                  {stats.payout.eligible ? "Reached ✓" : "Not reached yet"}
                </small>
              )}
            </div>
          </div>
          <button
            className={styles.payoutBtn}
            onClick={handleRequestPayout}
            disabled={!stats.payout.eligible || payoutState.loading}
            title={
              stats.payout.minimumPayoutAmount == null
                ? "Payouts are not configured yet"
                : !stats.payout.method
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
                  ₹{stats.bestDay.amount.toLocaleString("en-IN")}
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
    </div>
  );
};

export default Earnings;
