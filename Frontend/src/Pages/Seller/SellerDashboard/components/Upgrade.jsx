// src/Pages/Seller/SellerDashboard/components/Upgrade.jsx

import React from 'react';
import styles from './Upgrade.module.css';
import { FiStar, FiShield, FiZap, FiTrendingUp, FiCheck } from 'react-icons/fi';

const Upgrade = () => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: [
        'Up to 50 products',
        'Basic analytics',
        'Email support',
        '1 staff account'
      ],
      isCurrent: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29/mo',
      features: [
        'Up to 500 products',
        'Advanced analytics',
        'Priority support',
        '5 staff accounts',
        'Custom domain',
        'API access'
      ],
      isCurrent: false,
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '$99/mo',
      features: [
        'Unlimited products',
        'Premium analytics',
        '24/7 priority support',
        'Unlimited staff accounts',
        'Custom domain',
        'API access',
        'Dedicated account manager',
        'Advanced security'
      ],
      isCurrent: false
    }
  ];

  return (
    <div className={styles.upgradeContainer}>
      <div className={styles.upgradeHeader}>
        <h1 className={styles.upgradeTitle}>
          <FiTrendingUp className={styles.headerIcon} />
          Upgrade Your Plan
        </h1>
        <p className={styles.upgradeSubtitle}>
          Choose the perfect plan to grow your business
        </p>
      </div>

      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`${styles.planCard} ${plan.popular ? styles.popular : ''} ${plan.isCurrent ? styles.current : ''}`}
          >
            {plan.popular && (
              <div className={styles.popularBadge}>
                <FiStar /> Most Popular
              </div>
            )}
            {plan.isCurrent && (
              <div className={styles.currentBadge}>
                Current Plan
              </div>
            )}
            
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                <span className={styles.price}>{plan.price}</span>
              </div>
            </div>

            <ul className={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <FiCheck className={styles.checkIcon} />
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`${styles.upgradeBtn} ${plan.isCurrent ? styles.currentBtn : ''} ${plan.popular ? styles.popularBtn : ''}`}
              disabled={plan.isCurrent}
            >
              {plan.isCurrent ? 'Current Plan' : plan.popular ? 'Upgrade Now' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.upgradeFooter}>
        <p className={styles.footerText}>
          Need help choosing? <a href="#" className={styles.contactLink}>Contact our sales team</a>
        </p>
      </div>
    </div>
  );
};

export default Upgrade;