// src/Pages/SuperAdmin/SuperAdminDashboard/components/StatsCards.jsx

import React from 'react';
import { FiUsers, FiUserPlus, FiUserCheck, FiUserX, FiClock, FiAlertCircle } from 'react-icons/fi';
import styles from './StatsCards.module.css';

const StatsCards = ({ stats }) => {
  const cards = [
    { 
      id: 'total', 
      label: 'Total Sellers', 
      value: stats?.total || 0, 
      icon: FiUsers, 
      color: '#667eea',
      bgColor: '#eef2ff'
    },
    { 
      id: 'pending', 
      label: 'Pending Requests', 
      value: stats?.pending || 0, 
      icon: FiClock, 
      color: '#f59e0b',
      bgColor: '#fffbeb'
    },
    { 
      id: 'approved', 
      label: 'Approved', 
      value: stats?.approved || 0, 
      icon: FiUserCheck, 
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    { 
      id: 'rejected', 
      label: 'Rejected', 
      value: stats?.rejected || 0, 
      icon: FiUserX, 
      color: '#ef4444',
      bgColor: '#fef2f2'
    },
    { 
      id: 'suspended', 
      label: 'Suspended', 
      value: stats?.suspended || 0, 
      icon: FiAlertCircle, 
      color: '#8b5cf6',
      bgColor: '#f5f3ff'
    },
    { 
      id: 'underReview', 
      label: 'Under Review', 
      value: stats?.underReview || 0, 
      icon: FiUserPlus, 
      color: '#06b6d4',
      bgColor: '#ecfeff'
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {cards.map((card) => (
        <div key={card.id} className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: card.bgColor, color: card.color }}>
            <card.icon size={24} />
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{card.value}</p>
            <p className={styles.statLabel}>{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;