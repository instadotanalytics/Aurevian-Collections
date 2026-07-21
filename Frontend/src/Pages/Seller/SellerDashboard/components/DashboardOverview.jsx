// src/Pages/Seller/SellerDashboard/components/DashboardOverview.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowRight, FiCheckCircle } from "react-icons/fi";

import StatsCard from "./StatsCard";
import RecentOrders from "./RecentOrders";
import RecentActivities from "./RecentActivities";
import QuickActions from "./QuickActions";

import {
  fetchSellerDashboard,
  fetchRecentOrders,
  fetchRecentActivities,
  getKycStatus,
} from "../../../../redux/slices/sellerSlice";

import styles from "./DashboardOverview.module.css";

const DashboardOverview = () => {
  const dispatch = useDispatch();

  const { seller, dashboardStats, recentOrders, recentActivities } =
    useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerDashboard());
    dispatch(fetchRecentOrders());
    dispatch(fetchRecentActivities());
  }, [dispatch]);

  const kycStatus = getKycStatus(seller);
  const isKycVerified = kycStatus === "verified";

  return (
    <div className={styles.dashboardOverview}>
      {/* ================= KYC BANNER ================= */}

      {!isKycVerified && (
        <div className={styles.kycBanner}>
          <div className={styles.kycBannerLeft}>
            <div className={styles.kycIconWrap}>
              <FiAlertTriangle />
            </div>

            <div>
              <h3 className={styles.kycTitle}>
                Verify your account to start selling
              </h3>
              <p className={styles.kycText}>
                Complete your KYC verification to list products, receive orders,
                and get paid without interruption.
              </p>
            </div>
          </div>

          <Link to="/seller/kyc" className={styles.kycBtn}>
            {kycStatus === "submitted" || kycStatus === "under_review"
              ? "Check KYC Status"
              : kycStatus === "rejected"
                ? "Resubmit KYC"
                : "Complete your KYC"}
            <FiArrowRight />
          </Link>
        </div>
      )}

      {/* ================= HEADER ================= */}

      <div className={styles.header}>
        <div>
          <h1 className={styles.welcome}>Dashboard Overview</h1>

          <p className={styles.subtitle}>
            Track your store's performance and manage your business.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.addProductBtn}>+ Add New Product</button>

          <div className={styles.storeStatus}>
            <span
              className={`${styles.statusDot} ${
                isKycVerified ? styles.active : styles.pending
              }`}
            />

            <span className={styles.statusText}>
              {isKycVerified ? (
                <>
                  <FiCheckCircle style={{ marginRight: 4 }} />
                  Store Active
                </>
              ) : (
                "Verification Pending"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}

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
          title="Revenue"
          value={`₹${dashboardStats?.totalRevenue || 0}`}
          icon="💰"
          color="#10b981"
        />

        <StatsCard
          title="Sales"
          value={dashboardStats?.totalSales || 0}
          icon="📈"
          color="#ec4899"
        />

        <StatsCard
          title="Rating"
          value={dashboardStats?.rating?.toFixed(1) || "0.0"}
          icon="⭐"
          color="#8b5cf6"
        />

        <StatsCard
          title="Wallet"
          value={`₹${dashboardStats?.walletBalance || 0}`}
          icon="💳"
          color="#06b6d4"
        />
      </div>

      {/* ================= CONTENT ================= */}

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

export default DashboardOverview;
