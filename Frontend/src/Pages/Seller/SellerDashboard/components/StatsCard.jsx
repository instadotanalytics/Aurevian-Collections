// src/Pages/Seller/SellerDashboard/components/StatsCard.jsx

import React from "react";
import styles from "./StatsCard.module.css";

// Simple inline sparkline generator - no extra library needed
const Sparkline = ({ data = [], color = "#c8a86e" }) => {
  if (!data.length || data.every((v) => !v)) return null;

  const width = 100;
  const height = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.sparkline}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#grad-${color.replace("#", "")})`}
        stroke="none"
      />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StatsCard = ({
  title,
  value,
  change,
  trend = [],
  color = "#c8a86e",
  icon,
  subtext, // ✅ NEW — overrides the default "vs last month" caption
}) => {
  const hasChange = change !== undefined && change !== null;
  const isPositive =
    typeof change === "number"
      ? change >= 0
      : String(change).trim().startsWith("+");

  return (
    <div className={styles.statsCard}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          {icon && (
            <span className={styles.iconWrap} style={{ color }}>
              {icon}
            </span>
          )}
          <p className={styles.title}>{title}</p>
        </div>

        {hasChange && (
          <span
            className={`${styles.badge} ${isPositive ? styles.badgeUp : styles.badgeDown}`}
          >
            {isPositive ? "▲" : "▼"}{" "}
            {typeof change === "number"
              ? `${Math.abs(change).toFixed(1)}%`
              : change}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.value}>{value}</p>
        <Sparkline data={trend} color={color} />
      </div>

      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  );
};

export default StatsCard;
