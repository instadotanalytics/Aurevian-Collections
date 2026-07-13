 import React, { useState } from "react";
import styles from "./AnnouncementBar.module.css";
import { announcements as defaultAnnouncements } from "./NavData";

/**
 * AnnouncementBar - Simple version without external icons
 */
const AnnouncementBar = ({ 
  items = defaultAnnouncements, 
  speed = 28 
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const displayItems = items.length > 0 ? items : [
    "✨ Aurevian - Luxury Redefined",
    "💎 Free Shipping on Orders Above ₹50,000",
    "🌟 New Arrivals: The Royal Collection",
    "🎁 Complimentary Gift Wrapping",
    "👑 Exclusive Member Benefits"
  ];

  const loopItems = [...displayItems, ...displayItems];

  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="marquee"
      aria-label="Store announcements"
    >
      <div className={styles.container}>
        <div className={styles.trackWrapper}>
          <div 
            className={`${styles.track} ${isPaused ? styles.paused : ''}`}
            style={{ animationDuration: `${speed}s` }}
          >
            {loopItems.map((text, idx) => (
              <div className={styles.itemGroup} key={idx}>
                <span className={styles.itemText}>{text}</span>
                <span className={styles.itemSeparator}>✦</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;