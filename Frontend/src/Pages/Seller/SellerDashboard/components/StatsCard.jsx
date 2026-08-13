// src/Pages/Seller/SellerDashboard/components/StatsCard.jsx

import React from 'react';
import styles from './StatsCard.module.css';

// Simple inline sparkline generator - no extra library needed
const Sparkline = ({ data = [], color = '#6366f1' }) => {
  if (!data.length) return null;

  const width = 100;
  const height = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.sparkline} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const StatsCard = ({ title, value, change, trend = [], color = '#6366f1' }) => {
  const isPositive = typeof change === 'number' ? change >= 0 : String(change).trim().startsWith('+');

  return (
    <div className={styles.statsCard}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        {change !== undefined && (
          <span className={`${styles.badge} ${isPositive ? styles.badgeUp : styles.badgeDown}`}>
            {isPositive ? '▲' : '▼'} {typeof change === 'number' ? `${Math.abs(change)}%` : change}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.value}>{value}</p>
        <Sparkline data={trend} color={color} />
      </div>

      {change !== undefined && <p className={styles.subtext}>last week</p>}
    </div>
  );
};

export default StatsCard;