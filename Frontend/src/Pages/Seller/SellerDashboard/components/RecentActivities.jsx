// src/Pages/Seller/SellerDashboard/components/RecentActivities.jsx

import React from 'react';
import styles from './RecentActivities.module.css';

const RecentActivities = ({ activities = [] }) => {
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={styles.recentActivities}>
      <h3>Recent Activities</h3>
      {activities.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No recent activities</p>
        </div>
      ) : (
        <div className={styles.activitiesList}>
          {activities.map((activity) => (
            <div key={activity._id} className={styles.activityItem}>
              <span className={styles.activityIcon}>{activity.icon || '📌'}</span>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>{activity.message}</p>
                <span className={styles.activityTime}>
                  {getTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivities;