import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiSettings,
  FiBarChart2,
  FiShield,
  FiUser,
  FiLogOut,
  FiPlus
} from "react-icons/fi";
import styles from "./SuperAdminDashboard.module.css";

const SuperAdminDashboard = () => {
  const { user } = useSelector((state) => state.superAdmin);

  const stats = [
    { icon: FiUsers, label: "Total Users", value: "1,284", change: "+12%", color: "#667eea" },
    { icon: FiShoppingBag, label: "Total Orders", value: "856", change: "+8%", color: "#f093fb" },
    { icon: FiPackage, label: "Products", value: "342", change: "+5%", color: "#4facfe" },
    { icon: FiDollarSign, label: "Revenue", value: "CHF 45,230", change: "+15%", color: "#43e97b" },
  ];

  const quickActions = [
    { icon: FiUsers, label: "Manage Users", path: "/super-admin/users" },
    { icon: FiShoppingBag, label: "Manage Orders", path: "/super-admin/orders" },
    { icon: FiPackage, label: "Manage Products", path: "/super-admin/products" },
    { icon: FiSettings, label: "Settings", path: "/super-admin/settings" },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Admin" />
              ) : (
                <span>{user?.initials || "SA"}</span>
              )}
            </div>
            <div className={styles.headerInfo}>
              <h1>Welcome back, {user?.firstName || "Super Admin"}!</h1>
              <p>Here's what's happening with your store today</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.badge}>Super Admin</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: stat.color }}>
              <stat.icon />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statChange}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Link key={index} to={action.path} className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <action.icon />
              </div>
              <span className={styles.actionLabel}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <FiUser />
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>New user registered: John Doe</p>
              <span className={styles.activityTime}>2 minutes ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <FiShoppingBag />
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>New order #ORD-2024-001 placed</p>
              <span className={styles.activityTime}>15 minutes ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <FiPackage />
            </div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>Product "Gold Necklace" added</p>
              <span className={styles.activityTime}>1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;