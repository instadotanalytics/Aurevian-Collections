// src/Pages/Seller/SellerDashboard/components/QuickActions.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPlus, 
  FiList, 
  FiFileText, 
  FiUser 
} from 'react-icons/fi';
import styles from './QuickActions.module.css';

const QuickActions = () => {
  const actions = [
    { icon: FiPlus, label: 'Add Product', path: '/seller/products/new' },
    { icon: FiList, label: 'View Orders', path: '/seller/orders' },
    { icon: FiFileText, label: 'Documents', path: '/seller/documents' },
    { icon: FiUser, label: 'Profile', path: '/seller/profile' },
  ];

  return (
    <div className={styles.quickActions}>
      <h3>Quick Actions</h3>
      <div className={styles.actionsGrid}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link to={action.path} key={action.label} className={styles.actionCard}>
              <span className={styles.actionIcon}>
                <Icon size={22} />
              </span>
              <span className={styles.actionLabel}>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;