// src/Pages/Seller/SellerDashboard/components/StatsCard.jsx

import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={styles.statsCard}>
      <div className={styles.iconWrapper} style={{ backgroundColor: color + '20' }}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;