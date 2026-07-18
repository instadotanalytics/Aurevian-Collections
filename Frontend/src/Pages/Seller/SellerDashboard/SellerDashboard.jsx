// src/Pages/Seller/SellerDashboard/SellerDashboard.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSellerDashboard, 
  fetchRecentOrders, 
  fetchRecentActivities 
} from '../../../redux/slices/sellerSlice';
import StatsCard from './components/StatsCard';
import RecentOrders from './components/RecentOrders';
import RecentActivities from './components/RecentActivities';
import QuickActions from './components/QuickActions';
import styles from './SellerDashboard.module.css';
import LoadingScreen from '../../Layout/LoadingScreen/Loadingscreen';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { seller, dashboardStats, recentOrders, recentActivities, isLoading } = useSelector(
    (state) => state.seller
  );

  useEffect(() => {
    dispatch(fetchSellerDashboard());
    dispatch(fetchRecentOrders());
    dispatch(fetchRecentActivities());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p><LoadingScreen/></p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Welcome Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcome}>
            Welcome back, {seller?.firstName || 'Seller'}! 👋
          </h1>
          <p className={styles.subtitle}>
            Here's what's happening with your store today.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addProductBtn}>
            + Add New Product
          </button>
          <div className={styles.storeStatus}>
            <span className={`${styles.statusDot} ${seller?.status === 'approved' ? styles.active : styles.pending}`}></span>
            <span className={styles.statusText}>
              {seller?.status === 'approved' ? 'Store Active' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard 
          title="Total Products"
          value={dashboardStats?.totalProducts || 0}
          icon="📦"
          color="#6366f1"
        />
        <StatsCard 
          title="Total Orders"
          value={dashboardStats?.totalOrders || 0}
          icon="🛍️"
          color="#f59e0b"
        />
        <StatsCard 
          title="Total Revenue"
          value={`$${dashboardStats?.totalRevenue || 0}`}
          icon="💰"
          color="#10b981"
        />
        <StatsCard 
          title="Total Sales"
          value={dashboardStats?.totalSales || 0}
          icon="📈"
          color="#ec4899"
        />
        <StatsCard 
          title="Rating"
          value={dashboardStats?.rating?.toFixed(1) || '0.0'}
          icon="⭐"
          color="#8b5cf6"
        />
        <StatsCard 
          title="Wallet Balance"
          value={`$${dashboardStats?.walletBalance || 0}`}
          icon="💳"
          color="#06b6d4"
        />
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <RecentOrders orders={recentOrders} />
        </div>
        <div className={styles.rightColumn}>
          <QuickActions />
          <RecentActivities activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;