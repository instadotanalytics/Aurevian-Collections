// src/Pages/Seller/SellerDashboard/Customers.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiDownload,
  FiUsers,
  FiStar,
  FiMail,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiRefreshCw,
  FiFilter,
  FiEye,
  FiMessageSquare,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiMoreHorizontal,
} from "react-icons/fi";
import styles from "./Customers.module.css";
import { API_URL } from "../../../../utils/constants";

// ============================================
// API HELPER (same pattern as Earnings.jsx)
// ============================================
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("sellerAccessToken");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Request failed");
  return data;
}

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
// SKELETON LOADER (unchanged)
// ============================================
const SkeletonLoader = () => (
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
    <div className={styles.skeletonToolbar} />
    <div className={styles.skeletonTable}>
      <div className={styles.skeletonTableHeader} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.skeletonTableRow} />
      ))}
    </div>
  </div>
);

// ============================================
// CSV EXPORT — real client-side export of the data already on screen.
// No backend needed; nothing fabricated.
// ============================================
function exportCustomersCSV(customers) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Segment",
    "Orders",
    "Total Spent (INR)",
    "Last Order",
    "Status",
  ];
  const rows = customers.map((c) => [
    c.name || "",
    c.email || "",
    c.phone || "",
    c.segment,
    c.totalOrders,
    c.totalSpent,
    new Date(c.lastOrderAt).toISOString().slice(0, 10),
    c.status,
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// MAIN COMPONENT
// ============================================
const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const refreshThrottleRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const fetchCustomers = useCallback(async () => {
    const params = new URLSearchParams({
      search: searchTerm,
      segment: filterSegment,
      sort: sortBy,
      page: "1",
      limit: "50",
    });
    const [summaryRes, listRes] = await Promise.all([
      apiFetch("/seller/customers/summary"),
      apiFetch(`/seller/customers?${params.toString()}`),
    ]);
    setStats(summaryRes.data);
    setCustomers(listRes.data);
    setPagination(listRes.pagination);
  }, [searchTerm, filterSegment, sortBy]);

  const loadAll = useCallback(async () => {
    try {
      await fetchCustomers();
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load customers data");
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchCustomers]);

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

  const handleSearch = useCallback((value) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      searchDebounceRef.current = null;
    }, 300);
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterSegment, sortBy]);

  const getSegmentLabel = (segment) => {
    switch (segment) {
      case "vip":
        return "VIP";
      case "premium":
        return "Premium";
      case "regular":
        return "Regular";
      case "new":
        return "New";
      case "inactive":
        return "Inactive";
      default:
        return segment;
    }
  };

  const getSegmentColor = (segment) => {
    switch (segment) {
      case "vip":
        return styles.vip;
      case "premium":
        return styles.premium;
      case "regular":
        return styles.regular;
      case "new":
        return styles.new;
      case "inactive":
        return styles.inactive;
      default:
        return "";
    }
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Customers</h1>
          <span className={styles.subtitle}>
            Customers who've purchased from your store
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
          <button
            className={styles.exportBtn}
            onClick={() => exportCustomersCSV(customers)}
            disabled={customers.length === 0}
          >
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUsers size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Total Customers</span>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statChange}>
              {stats.returningRate}% return for a 2nd order
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Active</span>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statChange}>
              {stats.total > 0
                ? Math.round((stats.active / stats.total) * 100)
                : 0}
              % of total
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiAward size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>VIP & Premium</span>
            <span className={styles.statValue}>
              {stats.vip + stats.premium}
            </span>
            <span className={styles.statChange}>
              {stats.vip} VIP · {stats.premium} Premium
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCalendar size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>New This Month</span>
            <span className={styles.statValue}>{stats.newThisMonth}</span>
            <span className={styles.statChange}>
              Avg. order ₹
              {Math.round(stats.avgOrderValue).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search customers by name, email or phone..."
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterSelect}>
              <FiFilter size={14} />
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
              >
                <option value="all">All Segments</option>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
                <option value="regular">Regular</option>
                <option value="new">New</option>
                <option value="inactive">Inactive</option>
              </select>
              <FiChevronDown size={12} />
            </div>

            <div className={styles.filterSelect}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="spent">Highest Spent</option>
                <option value="orders">Most Orders</option>
                <option value="name">Alphabetical</option>
              </select>
              <FiChevronDown size={12} />
            </div>
          </div>
        </div>

        <div className={styles.toolbarRight}>
          <span className={styles.resultCount}>
            {pagination.total} customers
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Segment</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "32px" }}
                >
                  No customers yet — orders from your store will show up here.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.userId}>
                <td>
                  <div className={styles.customerInfo}>
                    <div className={styles.avatar}>
                      {getInitials(customer.name)}
                    </div>
                    <div className={styles.customerDetails}>
                      <span className={styles.customerName}>
                        {customer.name || "Unknown"}
                      </span>
                      <span className={styles.customerEmail}>
                        <FiMail size={12} />
                        {customer.email || "—"}
                      </span>
                      <span className={styles.customerPhone}>
                        <FiPhone size={12} />
                        {customer.phone || "—"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.segmentBadge} ${getSegmentColor(customer.segment)}`}
                  >
                    {getSegmentLabel(customer.segment)}
                  </span>
                </td>
                <td>{customer.totalOrders}</td>
                <td className={styles.amount}>
                  ₹{customer.totalSpent.toLocaleString("en-IN")}
                </td>
                <td>
                  <div className={styles.dateInfo}>
                    <FiCalendar size={12} />
                    {new Date(customer.lastOrderAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </div>
                </td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${customer.status === "active" ? styles.active : styles.inactive}`}
                  >
                    {customer.status === "active" ? (
                      <FiCheckCircle size={12} />
                    ) : (
                      <FiClock size={12} />
                    )}
                    {customer.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionBtn}
                      title="View Details"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowDetails(true);
                      }}
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      title="Messaging coming soon"
                      disabled
                    >
                      <FiMessageSquare size={16} />
                    </button>
                    <button className={styles.actionBtn} title="More">
                      <FiMoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDetails(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalCustomerInfo}>
                <div className={styles.modalAvatar}>
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h3>{selectedCustomer.name || "Unknown"}</h3>
                  <span
                    className={`${styles.segmentBadge} ${getSegmentColor(selectedCustomer.segment)}`}
                  >
                    {getSegmentLabel(selectedCustomer.segment)}
                  </span>
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalInfoGrid}>
                <div className={styles.modalInfoItem}>
                  <label>Email</label>
                  <p>{selectedCustomer.email || "—"}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Phone</label>
                  <p>{selectedCustomer.phone || "—"}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Total Orders</label>
                  <p>{selectedCustomer.totalOrders}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Total Spent</label>
                  <p>₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Customer Since</label>
                  <p>
                    {new Date(selectedCustomer.firstOrderAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Last Order</label>
                  <p>
                    {new Date(selectedCustomer.lastOrderAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Reviews</label>
                  <p>Not available</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Rating</label>
                  <p className={styles.ratingValue}>
                    <FiStar size={14} /> No review data
                  </p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={styles.modalActionBtn}
                  disabled
                  title="Messaging coming soon"
                >
                  <FiMessageSquare size={16} />
                  Send Message
                </button>
                <button
                  className={styles.modalActionBtn}
                  onClick={() => navigate("/seller/dashboard/orders")}
                >
                  <FiEye size={16} />
                  View Orders
                </button>
                <button
                  className={styles.modalActionBtn}
                  disabled
                  title="Email sending not wired up yet"
                >
                  <FiMail size={16} />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
