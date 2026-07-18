// src/Pages/Seller/SellerDashboard/components/QuickActions.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './QuickActions.module.css';

const QuickActions = () => {
  const actions = [
    { icon: '📦', label: 'Add Product', path: '/seller/products/add' },
    { icon: '📋', label: 'View Orders', path: '/seller/orders' },
    { icon: '📄', label: 'Documents', path: '/seller/documents' },
    { icon: '👤', label: 'Profile', path: '/seller/profile' },
  ];

  return (
    <div className={styles.quickActions}>
      <h3>Quick Actions</h3>
      <div className={styles.actionsGrid}>
        {actions.map((action) => (
          <Link to={action.path} key={action.label} className={styles.actionCard}>
            <span className={styles.actionIcon}>{action.icon}</span>
            <span className={styles.actionLabel}>{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;