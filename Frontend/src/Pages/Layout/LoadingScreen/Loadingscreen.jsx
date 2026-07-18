// src/Components/common/LoadingScreen.jsx
import React from 'react';
import logo from '../../../assets/Aurevianlogo.png'; // ← adjust path to wherever you save the logo
import styles from './LoadingScreen.module.css';

/**
 * Full-screen branded loading state for Aurevian Collections.
 * Drop in during route transitions, auth checks, or data fetches.
 *
 * Usage:
 *   <LoadingScreen />
 *   <LoadingScreen text="Preparing your dashboard" />
 */
const LoadingScreen = ({ text = 'Curating your experience' }) => {
  return (
    <div className={styles.page} role="status" aria-live="polite">
      <div className={styles.halo} aria-hidden="true" />

      <div className={styles.logoWrap}>
        <img src={logo} alt="Aurevian Collection" className={styles.logo} />
        <div className={styles.shimmer} aria-hidden="true" />
      </div>

      <div className={styles.rule} aria-hidden="true" />

      <p className={styles.caption}>
        {text}
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
      </p>
    </div>
  );
};

export default LoadingScreen;