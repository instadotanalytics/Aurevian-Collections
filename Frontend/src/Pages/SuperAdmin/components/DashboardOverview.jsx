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
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiStar,
  FiCalendar,
  FiArrowRight,
  FiRefreshCw
} from 'react-icons/fi';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import styles from './DashboardOverview.module.css';

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
        'pending': { icon: <FiClock />, label: 'New seller registration', color: '#f59e0b' },
        'approved': { icon: <FiUserCheck />, label: 'Seller approved', color: '#10b981' },
        'rejected': { icon: <FiUserX />, label: 'Seller rejected', color: '#ef4444' },
        'suspended': { icon: <FiAlertCircle />, label: 'Seller suspended', color: '#8b5cf6' },
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

  if (loading && !stats) {
    return (
      <div className={styles.loadingContainer}>
        <FiRefreshCw className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardOverview}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>👋 Welcome to Super Admin Dashboard</h1>
          <p className={styles.welcomeSubtitle}>
            Here's an overview of your platform's performance and recent activities
          </p>
        </div>
        <div className={styles.welcomeStats}>
          <div className={styles.welcomeStat}>
            <span className={styles.welcomeStatValue}>{stats?.total || 0}</span>
            <span className={styles.welcomeStatLabel}>Total Sellers</span>
          </div>
          <div className={styles.welcomeStat}>
            <span className={styles.welcomeStatValue}>{stats?.active || 0}</span>
            <span className={styles.welcomeStatLabel}>Active Sellers</span>
          </div>
          <div className={styles.welcomeStat}>
            <span className={styles.welcomeStatValue}>{stats?.pending || 0}</span>
            <span className={styles.welcomeStatLabel}>Pending Approvals</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Recent Activity and Orders */}
      <div className={styles.twoColumnLayout}>
        <div className={styles.leftColumn}>
          <RecentActivities activities={recentActivities} title="Recent Seller Activity" />
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.recentOrders}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                <FiShoppingBag className={styles.sectionIcon} />
                Recent Orders
              </h3>
              <button className={styles.viewAllBtn}>
                View All <FiArrowRight />
              </button>
            </div>
            <div className={styles.ordersList}>
              {recentOrders.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent orders</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className={styles.orderItem}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>#{order.orderNumber}</span>
                      <span className={styles.orderCustomer}>{order.customer}</span>
                    </div>
                    <div className={styles.orderDetails}>
                      <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
                      <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                        {order.status}
                      </span>
                      <span className={styles.orderTime}>
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sellers Table */}
      <div className={styles.recentSellers}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FiUsers className={styles.sectionIcon} />
            Recent Seller Registrations
          </h3>
          <button className={styles.viewAllBtn}>
            View All <FiArrowRight />
          </button>
        </div>
        <div className={styles.sellersTable}>
          <table>
            <thead>
              <tr>
                <th>Seller</th>
                <th>Store</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSellers.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>
                    <div className={styles.emptyState}>
                      <p>No sellers registered yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentSellers.map((seller) => (
                  <tr key={seller._id}>
                    <td>
                      <div className={styles.sellerCell}>
                        <div className={styles.sellerAvatar}>
                          {seller.profileImage ? (
                            <img src={seller.profileImage} alt={seller.fullName} />
                          ) : (
                            <span>{seller.fullName?.[0] || 'S'}</span>
                          )}
                        </div>
                        <span className={styles.sellerName}>{seller.fullName}</span>
                      </div>
                    </td>
                    <td>{seller.storeInfo?.storeName || 'N/A'}</td>
                    <td>{seller.email}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[seller.status]}`}>
                        {seller.status || 'pending'}
                      </span>
                    </td>
                    <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;