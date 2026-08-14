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

// ============================================
// THROTTLE & DEBOUNCE UTILITIES
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

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// ============================================
// SKELETON LOADER COMPONENT
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
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState(null);

  // Refs for throttling/debouncing
  const refreshThrottleRef = useRef(null);
  const filterDebounceRef = useRef(null);

  // ============================================
  // SIMULATED API CALL
  // ============================================
  const fetchEarningsData = useCallback(async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Sample data
      const data = {
        stats: {
          totalEarnings: 124567,
          pendingPayout: 23450,
          availableBalance: 101117,
          totalOrders: 342,
          averageOrderValue: 364,
          commission: 18685,
          refunds: 2340,
        },
        monthlyData: [
          { month: "Jan", earnings: 18500, orders: 52 },
          { month: "Feb", earnings: 21200, orders: 58 },
          { month: "Mar", earnings: 19400, orders: 47 },
          { month: "Apr", earnings: 23200, orders: 63 },
          { month: "May", earnings: 27800, orders: 72 },
          { month: "Jun", earnings: 14267, orders: 50 },
        ],
        transactions: [
          {
            id: "#ORD-2024-001",
            date: "2024-12-18",
            customer: "Priya Sharma",
            amount: 3499,
            status: "completed",
            type: "sale",
          },
          {
            id: "#ORD-2024-002",
            date: "2024-12-17",
            customer: "Amit Kumar",
            amount: 1299,
            status: "pending",
            type: "sale",
          },
          {
            id: "#ORD-2024-003",
            date: "2024-12-16",
            customer: "Neha Patel",
            amount: 2499,
            status: "completed",
            type: "sale",
          },
          {
            id: "#ORD-2024-004",
            date: "2024-12-15",
            customer: "Raj Singh",
            amount: 499,
            status: "refunded",
            type: "refund",
          },
          {
            id: "#ORD-2024-005",
            date: "2024-12-14",
            customer: "Sneha Reddy",
            amount: 1899,
            status: "completed",
            type: "sale",
          },
        ],
      };

      setStats(data.stats);
      setMonthlyData(data.monthlyData);
      setRecentTransactions(data.transactions);
      setError(null);
    } catch (err) {
      setError("Failed to load earnings data");
      console.error("Error fetching earnings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ============================================
  // THROTTLED REFRESH
  // ============================================
  const handleRefresh = useCallback(() => {
    if (refreshThrottleRef.current) return;

    refreshThrottleRef.current = throttle(() => {
      setRefreshing(true);
      fetchEarningsData();
      refreshThrottleRef.current = null;
    }, 2000)();

    // Reset throttle after 2 seconds
    setTimeout(() => {
      refreshThrottleRef.current = null;
    }, 2000);
  }, [fetchEarningsData]);

  // ============================================
  // DEBOUNCED PERIOD CHANGE
  // ============================================
  const handlePeriodChange = useCallback((newPeriod) => {
    // Debounce the period change
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    filterDebounceRef.current = setTimeout(() => {
      setPeriod(newPeriod);
      // In real app, fetch data for new period here
      // For demo, just update the period
      filterDebounceRef.current = null;
    }, 300);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    fetchEarningsData();

    // Cleanup
    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
  }, [fetchEarningsData]);

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

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className={styles.container}>
        <SkeletonLoader />
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
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

  // ============================================
  // MAIN RENDER
  // ============================================
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
            <FiRefreshCw className={refreshing ? styles.spinning : ""} size={16} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className={styles.exportBtn}>
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Period Selector */}
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
            <span className={styles.statValue}>₹{stats.totalEarnings.toLocaleString()}</span>
            <span className={`${styles.statChange} ${styles.positive}`}>
              <FiTrendingUp size={14} />
              +12.5% from last month
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCreditCard size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Available Balance</span>
            <span className={styles.statValue}>₹{stats.availableBalance.toLocaleString()}</span>
            <span className={styles.statChange}>
              <FiClock size={14} />
              ₹{stats.pendingPayout.toLocaleString()} pending
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
              Avg. ₹{stats.averageOrderValue.toLocaleString()} per order
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUsers size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Commission</span>
            <span className={styles.statValue}>₹{stats.commission.toLocaleString()}</span>
            <span className={`${styles.statChange} ${styles.negative}`}>
              <FiTrendingDown size={14} />
              Refunds: ₹{stats.refunds.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h3>Monthly Earnings</h3>
          <div className={styles.chartTabs}>
            <button
              className={`${styles.chartTab} ${view === "overview" ? styles.active : ""}`}
              onClick={() => setView("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.chartTab} ${view === "details" ? styles.active : ""}`}
              onClick={() => setView("details")}
            >
              Details
            </button>
          </div>
        </div>
        <div className={styles.chartContainer}>
          <div className={styles.chartBars}>
            {monthlyData.map((item, index) => (
              <div key={index} className={styles.chartBarGroup}>
                <div className={styles.chartBarWrapper}>
                  <div
                    className={styles.chartBar}
                    style={{ height: `${(item.earnings / 28000) * 100}%` }}
                  >
                    <span className={styles.chartBarValue}>₹{item.earnings.toLocaleString()}</span>
                  </div>
                </div>
                <span className={styles.chartLabel}>{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={styles.transactionsSection}>
        <div className={styles.sectionHeader}>
          <h3>Recent Transactions</h3>
          <button className={styles.viewAllBtn}>
            View All <FiArrowRight size={14} />
          </button>
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
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td className={styles.orderId}>{tx.id}</td>
                  <td>{new Date(tx.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}</td>
                  <td>{tx.customer}</td>
                  <td className={tx.type === "refund" ? styles.refundAmount : styles.amount}>
                    {tx.type === "refund" ? "-" : ""}₹{tx.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[tx.status]}`}>
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
              <span>Next Payout</span>
              <strong>₹{stats.pendingPayout.toLocaleString()}</strong>
              <small>Estimated: Dec 25, 2024</small>
            </div>
            <div className={styles.payoutDivider} />
            <div className={styles.payoutItem}>
              <span>Payout Method</span>
              <strong>Bank Transfer</strong>
              <small>•••• 6789 • HDFC Bank</small>
            </div>
            <div className={styles.payoutDivider} />
            <div className={styles.payoutItem}>
              <span>Minimum Payout</span>
              <strong>₹1,000</strong>
              <small>Reached ✓</small>
            </div>
          </div>
          <button className={styles.payoutBtn}>
            Request Payout <FiChevronRight size={16} />
          </button>
        </div>

        <div className={styles.quickStats}>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Best Day</span>
            <strong className={styles.quickStatValue}>₹8,450</strong>
            <small>Dec 15, 2024</small>
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Best Product</span>
            <strong className={styles.quickStatValue}>Diamond Ring</strong>
            <small>43 units sold</small>
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Conversion Rate</span>
            <strong className={styles.quickStatValue}>3.8%</strong>
            <small>+0.6% from last month</small>
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatLabel}>Rating</span>
            <strong className={styles.quickStatValue}>
              <FiStar size={16} /> 4.8
            </strong>
            <small>128 reviews</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;