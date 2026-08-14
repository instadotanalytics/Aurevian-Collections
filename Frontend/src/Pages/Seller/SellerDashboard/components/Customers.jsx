// src/Pages/Seller/SellerDashboard/Customers.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiSearch,
  FiDownload,
  FiUsers,
  FiUserPlus,
  FiStar,
  FiMail,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiChevronRight,
  FiArrowRight,
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
      <div className={styles.skeletonToolbar} />
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
const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Refs
  const refreshThrottleRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // ============================================
  // SAMPLE DATA
  // ============================================
  const sampleCustomers = [
    {
      id: 1,
      name: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43210",
      segment: "premium",
      totalOrders: 24,
      totalSpent: 45230,
      lastOrder: "2024-12-18",
      joined: "2023-06-15",
      status: "active",
      avatar: "PS",
      reviews: 12,
      avgRating: 4.8,
    },
    {
      id: 2,
      name: "Amit Kumar",
      email: "amit.kumar@email.com",
      phone: "+91 87654 32109",
      segment: "regular",
      totalOrders: 12,
      totalSpent: 18990,
      lastOrder: "2024-12-17",
      joined: "2023-09-22",
      status: "active",
      avatar: "AK",
      reviews: 5,
      avgRating: 4.2,
    },
    {
      id: 3,
      name: "Neha Patel",
      email: "neha.patel@email.com",
      phone: "+91 76543 21098",
      segment: "vip",
      totalOrders: 38,
      totalSpent: 89450,
      lastOrder: "2024-12-16",
      joined: "2022-11-03",
      status: "active",
      avatar: "NP",
      reviews: 18,
      avgRating: 4.9,
    },
    {
      id: 4,
      name: "Raj Singh",
      email: "raj.singh@email.com",
      phone: "+91 65432 10987",
      segment: "regular",
      totalOrders: 8,
      totalSpent: 12450,
      lastOrder: "2024-12-15",
      joined: "2024-02-10",
      status: "inactive",
      avatar: "RS",
      reviews: 3,
      avgRating: 3.5,
    },
    {
      id: 5,
      name: "Sneha Reddy",
      email: "sneha.reddy@email.com",
      phone: "+91 54321 09876",
      segment: "premium",
      totalOrders: 19,
      totalSpent: 36780,
      lastOrder: "2024-12-14",
      joined: "2023-04-28",
      status: "active",
      avatar: "SR",
      reviews: 9,
      avgRating: 4.6,
    },
    {
      id: 6,
      name: "Vikram Mehta",
      email: "vikram.mehta@email.com",
      phone: "+91 43210 98765",
      segment: "new",
      totalOrders: 3,
      totalSpent: 4590,
      lastOrder: "2024-12-13",
      joined: "2024-11-05",
      status: "active",
      avatar: "VM",
      reviews: 1,
      avgRating: 5.0,
    },
    {
      id: 7,
      name: "Ananya Iyer",
      email: "ananya.iyer@email.com",
      phone: "+91 32109 87654",
      segment: "vip",
      totalOrders: 42,
      totalSpent: 112340,
      lastOrder: "2024-12-12",
      joined: "2022-08-19",
      status: "active",
      avatar: "AI",
      reviews: 22,
      avgRating: 4.9,
    },
    {
      id: 8,
      name: "Deepak Gupta",
      email: "deepak.gupta@email.com",
      phone: "+91 21098 76543",
      segment: "inactive",
      totalOrders: 2,
      totalSpent: 1890,
      lastOrder: "2024-10-28",
      joined: "2024-07-14",
      status: "inactive",
      avatar: "DG",
      reviews: 0,
      avgRating: 0,
    },
  ];

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchCustomersData = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const data = {
        customers: sampleCustomers,
        stats: {
          total: 342,
          active: 289,
          premium: 78,
          vip: 34,
          newThisMonth: 45,
          returningRate: 68,
          avgOrderValue: 364,
          lifetimeValue: 45600,
        },
      };

      setCustomers(data.customers);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError("Failed to load customers data");
      console.error("Error fetching customers:", err);
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
      fetchCustomersData();
      refreshThrottleRef.current = null;
    }, 2000)();

    setTimeout(() => {
      refreshThrottleRef.current = null;
    }, 2000);
  }, [fetchCustomersData]);

  // ============================================
  // DEBOUNCED SEARCH
  // ============================================
  const handleSearch = useCallback((value) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      searchDebounceRef.current = null;
    }, 300);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    fetchCustomersData();

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [fetchCustomersData]);

  // ============================================
  // FILTER & SEARCH LOGIC
  // ============================================
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm);

    const matchesSegment = filterSegment === "all" || customer.segment === filterSegment;

    return matchesSearch && matchesSegment;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.lastOrder) - new Date(a.lastOrder);
      case "spent":
        return b.totalSpent - a.totalSpent;
      case "orders":
        return b.totalOrders - a.totalOrders;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // ============================================
  // GET SEGMENT LABEL
  // ============================================
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

  // ============================================
  // GET STATUS LABEL
  // ============================================
  const getStatusLabel = (status) => {
    return status === "active" ? "Active" : "Inactive";
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
          <h1 className={styles.title}>Customers</h1>
          <span className={styles.subtitle}>Manage your customer relationships</span>
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
          <button className={styles.addBtn}>
            <FiUserPlus size={16} />
            Add Customer
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
            <span className={`${styles.statChange} ${styles.positive}`}>
              <FiTrendingUp size={14} />
              +12% this month
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
              {Math.round((stats.active / stats.total) * 100)}% of total
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiAward size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>VIP & Premium</span>
            <span className={styles.statValue}>{stats.vip + stats.premium}</span>
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
            <span className={`${styles.statChange} ${styles.positive}`}>
              <FiTrendingUp size={14} />
              +8% from last month
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
            {sortedCustomers.length} customers
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
            {sortedCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <div className={styles.customerInfo}>
                    <div className={styles.avatar}>
                      {customer.avatar}
                    </div>
                    <div className={styles.customerDetails}>
                      <span className={styles.customerName}>{customer.name}</span>
                      <span className={styles.customerEmail}>
                        <FiMail size={12} />
                        {customer.email}
                      </span>
                      <span className={styles.customerPhone}>
                        <FiPhone size={12} />
                        {customer.phone}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.segmentBadge} ${getSegmentColor(customer.segment)}`}>
                    {getSegmentLabel(customer.segment)}
                  </span>
                </td>
                <td>{customer.totalOrders}</td>
                <td className={styles.amount}>₹{customer.totalSpent.toLocaleString()}</td>
                <td>
                  <div className={styles.dateInfo}>
                    <FiCalendar size={12} />
                    {new Date(customer.lastOrder).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${customer.status === "active" ? styles.active : styles.inactive}`}>
                    {customer.status === "active" ? (
                      <FiCheckCircle size={12} />
                    ) : (
                      <FiClock size={12} />
                    )}
                    {getStatusLabel(customer.status)}
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
                    <button className={styles.actionBtn} title="Message">
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
        <div className={styles.modalOverlay} onClick={() => setShowDetails(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalCustomerInfo}>
                <div className={styles.modalAvatar}>
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h3>{selectedCustomer.name}</h3>
                  <span className={`${styles.segmentBadge} ${getSegmentColor(selectedCustomer.segment)}`}>
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
                  <p>{selectedCustomer.email}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Phone</label>
                  <p>{selectedCustomer.phone}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Total Orders</label>
                  <p>{selectedCustomer.totalOrders}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Total Spent</label>
                  <p>₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Joined</label>
                  <p>{new Date(selectedCustomer.joined).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Last Order</label>
                  <p>{new Date(selectedCustomer.lastOrder).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Reviews</label>
                  <p>{selectedCustomer.reviews}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Rating</label>
                  <p className={styles.ratingValue}>
                    <FiStar size={14} />
                    {selectedCustomer.avgRating || "N/A"}
                  </p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.modalActionBtn}>
                  <FiMessageSquare size={16} />
                  Send Message
                </button>
                <button className={styles.modalActionBtn}>
                  <FiEye size={16} />
                  View Orders
                </button>
                <button className={styles.modalActionBtn}>
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