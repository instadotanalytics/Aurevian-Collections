// src/Components/common/NotificationCenter/NotificationCenter.jsx
import React, { useState, useRef, useEffect } from "react";
import { FiBell } from "react-icons/fi";
import styles from "./NotificationCenter.module.css";

const NotificationCenter = ({
  notifications,
  unreadCount,
  onItemClick,
  onOpen,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && onOpen) onOpen();
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={styles.bellBtn}
        onClick={toggle}
        aria-label="Notifications"
      >
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>Notifications</div>

          {notifications.length === 0 && (
            <div className={styles.emptyState}>No notifications yet</div>
          )}

          <div className={styles.list}>
            {notifications.map((n) => (
              <button
                key={n.id}
                className={`${styles.item} ${!n.read ? styles.unread : ""}`}
                onClick={() => {
                  onItemClick(n);
                  setOpen(false);
                }}
              >
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.itemMsg}>{n.message}</span>
                <span className={styles.itemTime}>
                  {new Date(n.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
