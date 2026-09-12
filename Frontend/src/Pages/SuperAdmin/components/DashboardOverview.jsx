
// src/Pages/SuperAdmin/SuperAdminDashboard/components/DashboardOverview.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiAlertCircle,
  FiShoppingBag,
  FiArrowRight,
  FiRefreshCw,
  FiCalendar,
} from 'react-icons/fi';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import styles from './DashboardOverview.module.css';

// Skeleton Loader Component — mirrors SellerRequests' row skeleton
const SkeletonRows = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={styles.skeletonRow}>
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonLine}></div>
      </div>
    ))}
  </>
);

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentSellers, setRecentSellers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const token = localStorage.getItem('superAdminToken');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch seller stats
      const statsRes = await axios.get('/api/super-admin/sellers/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch recent sellers (last 5)
      const sellersRes = await axios.get('/api/super-admin/sellers?page=1&limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (sellersRes.data.success) {
        setRecentSellers(sellersRes.data.data);
        setRecentActivities(generateActivities(sellersRes.data.data));
      }

      // Fetch recent orders (mock data for now)
      setRecentOrders(generateMockOrders());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateActivities = (sellers) => {
    const activities = [];

    sellers.forEach(seller => {
      const statusMap = {
        'pending': { icon: <FiClock />, label: 'New seller registration', color: '#d97706' },
        'approved': { icon: <FiUserCheck />, label: 'Seller approved', color: '#10b981' },
        'rejected': { icon: <FiUserX />, label: 'Seller rejected', color: '#ef4444' },
        'suspended': { icon: <FiAlertCircle />, label: 'Seller suspended', color: '#3b82f6' },
      };

      const activity = statusMap[seller.status] || statusMap.pending;

      activities.push({
        id: seller._id,
        type: 'seller',
        icon: activity.icon,
        label: activity.label,
        title: `${seller.fullName || seller.firstName} ${seller.lastName || ''}`,
        description: `${seller.storeInfo?.storeName || 'Store'} • ${seller.email}`,
        timestamp: seller.createdAt,
        color: activity.color,
        status: seller.status,
        data: seller
      });
    });

    return activities;
  };

  const generateMockOrders = () => {
    return [
      {
        _id: 'ord_1',
        orderNumber: 'ORD-2024-001',
        customer: 'Priya Sharma',
        total: 2999.99,
        status: 'delivered',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'ord_2',
        orderNumber: 'ORD-2024-002',
        customer: 'Amit Patel',
        total: 4999.50,
        status: 'processing',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'ord_3',
        orderNumber: 'ORD-2024-003',
        customer: 'Neha Singh',
        total: 799.99,
        status: 'shipped',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'ord_4',
        orderNumber: 'ORD-2024-004',
        customer: 'Rahul Verma',
        total: 1599.00,
        status: 'pending',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'S';

  const getSellerStatusBadge = (status) => {
    const map = {
      pending: styles.statusPending,
      approved: styles.statusApproved,
      rejected: styles.statusRejected,
      suspended: styles.statusSuspended,
      under_review: styles.statusNeutral,
    };
    return map[status] || styles.statusNeutral;
  };

  const getOrderStatusBadge = (status) => {
    const map = {
      delivered: styles.statusApproved,
      processing: styles.statusPending,
      shipped: styles.statusSuspended,
      pending: styles.statusRejected,
    };
    return map[status] || styles.statusNeutral;
  };

  if (loading && !stats) {
    return (
      <div className={styles.loadingContainer}>
        <FiRefreshCw className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const showLoadingState = loading && recentSellers.length === 0 && recentOrders.length === 0;

  return (
    <div className={styles.container}>
      {/* Header — same shape as SellerRequests: title + count pill,
          stats bar on the right */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Dashboard Overview</h1>
          <span className={styles.countPill}>{stats?.total ?? 0} sellers</span>
        </div>
        {stats && (
          <div className={styles.headerRight}>
            <div className={styles.statsBar}>
              <span className={styles.statsLabel}>
                <FiUsers size={14} />
                Overview:
              </span>
              <span className={styles.statsItem}>
                Active: <strong>{stats.active}</strong>
              </span>
              <span className={styles.statsItem}>
                Pending: <strong>{stats.pending}</strong>
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

      {/* Stats Cards (existing component) */}
      <StatsCards stats={stats} />

      {/* Recent Activity + Recent Orders */}
      <div className={styles.twoColumnLayout}>
        <div className={styles.leftColumn}>
          <RecentActivities activities={recentActivities} title="Recent Seller Activity" />
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <FiShoppingBag className={styles.sectionIcon} size={16} />
                Recent Orders
              </h3>
              <button className={styles.viewAllBtn}>
                View All <FiArrowRight size={13} />
              </button>
            </div>
            <div className={styles.tableContainer}>
              {showLoadingState ? (
                <SkeletonRows count={4} />
              ) : recentOrders.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiShoppingBag size={40} className={styles.emptyIcon} />
                  <h3>No recent orders</h3>
                  <p>Orders will show up here as they come in.</p>
                </div>
              ) : (
                <table className={styles.dashTable}>
                  <thead>
                    <tr>
                      <th className={styles.orderCell}>Order</th>
                      <th className={styles.amountCell}>Amount</th>
                      <th className={styles.statusCell}>Status</th>
                      <th className={styles.dateCell}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id} className={styles.tableRow}>
                        <td className={styles.orderCell} data-label="Order">
                          <div className={styles.orderInfo}>
                            <span className={styles.orderNumber}>#{order.orderNumber}</span>
                            <span className={styles.orderCustomer}>{order.customer}</span>
                          </div>
                        </td>
                        <td className={styles.amountCell} data-label="Amount">
                          <span className={styles.amountValue}>${order.total.toFixed(2)}</span>
                        </td>
                        <td className={styles.statusCell} data-label="Status">
                          <span className={`${styles.statusBadge} ${getOrderStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={styles.dateCell} data-label="Date">
                          <div className={styles.dateInfo}>
                            <FiCalendar size={12} />
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sellers — same table pattern as SellerRequests */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FiUsers className={styles.sectionIcon} size={16} />
            Recent Seller Registrations
          </h3>
          <button className={styles.viewAllBtn}>
            View All <FiArrowRight size={13} />
          </button>
        </div>
        <div className={styles.tableContainer}>
          {showLoadingState ? (
            <SkeletonRows count={5} />
          ) : recentSellers.length === 0 ? (
            <div className={styles.emptyState}>
              <FiUsers size={40} className={styles.emptyIcon} />
              <h3>No sellers registered yet</h3>
              <p>Seller applications will show up here once submitted.</p>
            </div>
          ) : (
            <table className={styles.dashTable}>
              <thead>
                <tr>
                  <th className={styles.sellerCell}>Seller</th>
                  <th className={styles.storeCell}>Store</th>
                  <th className={styles.statusCell}>Status</th>
                  <th className={styles.dateCell}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSellers.map((seller) => (
                  <tr key={seller._id} className={styles.tableRow}>
                    <td className={styles.sellerCell} data-label="Seller">
                      <div className={styles.sellerInfo}>
                        <div className={styles.sellerAvatar}>
                          {seller.profileImage ? (
                            <img src={seller.profileImage} alt={seller.fullName} />
                          ) : (
                            <span>{getInitials(seller.fullName)}</span>
                          )}
                        </div>
                        <div>
                          <div className={styles.sellerName}>{seller.fullName}</div>
                          <div className={styles.sellerEmail}>{seller.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.storeCell} data-label="Store">
                      <div className={styles.storeInfo}>
                        <strong title={seller.storeInfo?.storeName}>
                          {seller.storeInfo?.storeName || 'N/A'}
                        </strong>
                      </div>
                    </td>
                    <td className={styles.statusCell} data-label="Status">
                      <span className={`${styles.statusBadge} ${getSellerStatusBadge(seller.status)}`}>
                        {seller.status || 'pending'}
                      </span>
                    </td>
                    <td className={styles.dateCell} data-label="Date">
                      <div className={styles.dateInfo}>
                        <FiCalendar size={12} />
                        <span>{new Date(seller.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;