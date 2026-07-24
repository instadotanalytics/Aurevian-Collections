// src/Pages/Seller/SellerDashboard/components/Upgrade.jsx

import React, { useState } from 'react';
import styles from './Upgrade.module.css';
import { 
  FiStar, 
  FiShield, 
  FiZap, 
  FiTrendingUp, 
  FiCheck, 
  FiX,
  FiAward,
  FiDollarSign,
  FiPackage,
  FiHome,
  FiImage,
  FiVideo,
  FiClock,
  FiPercent,
  FiBarChart2,
  FiMessageCircle,
  FiUsers,
  FiMail,
  FiBell,
  FiSmartphone,
  FiDatabase,
  FiAperture,
  FiCpu,
  FiHeadphones,
  FiEdit,
  FiRefreshCw,
  FiArrowUp,
  FiStar as FiStarSolid
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Upgrade = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'FREE',
      icon: '🟢',
      price: '₹0',
      period: '/ Month',
      bestFor: 'New sellers',
      features: [
        '50 Products',
        'Basic Dashboard',
        'Basic Store',
        '5 Images per Product',
        '7 Days Settlement',
        '12% Commission',
        'Basic Sales Report',
        'Customer Reviews',
        'Order Management'
      ],
      isCurrent: true,
      commission: '12%',
      settlement: '7 Days'
    },
    {
      id: 'silver',
      name: 'SILVER',
      icon: '🩶',
      price: '₹499',
      period: '/ Month',
      bestFor: 'Growing sellers',
      badge: 'Silver Verified Badge',
      features: [
        '300 Products',
        'Silver Verified Badge',
        'Better Search Ranking',
        'Premium Store Design',
        '8 Images per Product',
        'Product Video Upload',
        'Advanced Analytics',
        '5 Coupons per Month',
        'Festival Sale Access',
        'Chat Support',
        '10% Commission',
        '5 Days Settlement'
      ],
      isCurrent: false,
      commission: '10%',
      settlement: '5 Days'
    },
    {
      id: 'gold',
      name: 'GOLD',
      icon: '🥇',
      price: '₹999',
      period: '/ Month',
      bestFor: 'Professional Businesses',
      badge: '⭐ Recommended',
      features: [
        '1000 Products',
        'Gold Verified Badge',
        'Homepage Featured Products',
        '360° Product Images',
        'Unlimited Coupons',
        'Sponsored Products',
        'Flash Sale Participation',
        'Push Notifications',
        'Email Marketing',
        'Advanced Reports',
        '8% Commission',
        '2 Days Settlement',
        'Phone Support'
      ],
      isCurrent: false,
      isPopular: true,
      commission: '8%',
      settlement: '2 Days'
    },
    {
      id: 'platinum',
      name: 'PLATINUM',
      icon: '💎',
      price: '₹1999',
      period: '/ Month',
      bestFor: 'Large Brands',
      features: [
        'Unlimited Products',
        'Platinum Badge',
        'Highest Search Ranking',
        'Homepage Featured Daily',
        'Custom Store Design',
        '15 Images + Unlimited Videos',
        'WhatsApp Marketing',
        'AI Sales Analytics',
        'Dedicated Account Manager',
        'API Access',
        'Early New Features',
        '5% Commission',
        '24-Hour Settlement',
        'Premium Customer Support'
      ],
      isCurrent: false,
      commission: '5%',
      settlement: '24-Hour'
    }
  ];

  const handleUpgrade = (planId) => {
    if (planId === 'free') {
      toast.success('You are already on the Free plan!');
      return;
    }
    
    setSelectedPlan(planId);
    toast.loading(`Processing ${plans.find(p => p.id === planId)?.name} plan upgrade...`);
    
    // Simulate API call
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Successfully upgraded to ${plans.find(p => p.id === planId)?.name} plan!`);
    }, 2000);
  };

  return (
    <div className={styles.upgradeContainer}>
      {/* Header */}
      <div className={styles.upgradeHeader}>
        <h1 className={styles.upgradeTitle}>
          <FiTrendingUp className={styles.headerIcon} />
          Become a Super Seller 🚀
        </h1>
        <p className={styles.upgradeSubtitle}>Choose your plan and unlock premium features</p>
      </div>

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`${styles.planCard} ${plan.isPopular ? styles.popular : ''} ${plan.isCurrent ? styles.current : ''}`}
          >
            {plan.isPopular && (
              <div className={styles.popularBadge}>
                <FiStar /> {plan.badge}
              </div>
            )}
            {plan.isCurrent && (
              <div className={styles.currentBadge}>
                <FiCheck /> Current Plan
              </div>
            )}

            <div className={styles.planIcon}>{plan.icon}</div>
            
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.planPrice}>
                <span className={styles.price}>{plan.price}</span>
                <span className={styles.period}>{plan.period}</span>
              </div>
              <span className={styles.bestFor}>Best For: {plan.bestFor}</span>
            </div>

            <ul className={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <FiCheck className={styles.checkIcon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className={styles.planFooter}>
              <div className={styles.planStats}>
                <span className={styles.statItem}>
                  <FiPercent /> {plan.commission}
                </span>
                <span className={styles.statItem}>
                  <FiClock /> {plan.settlement}
                </span>
              </div>

              <button 
                className={`${styles.upgradeBtn} ${plan.isCurrent ? styles.currentBtn : ''} ${plan.isPopular ? styles.popularBtn : ''}`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.isCurrent}
              >
                {plan.isCurrent ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <button 
        className={styles.compareToggle}
        onClick={() => setShowComparison(!showComparison)}
      >
        {showComparison ? 'Hide Detailed Comparison' : 'Show Detailed Comparison'}
      </button>

      {showComparison && (
        <div className={styles.comparisonTable}>
          <h2>📊 Detailed Feature Comparison</h2>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Features</th>
                  <th>🟢 FREE</th>
                  <th>🩶 SILVER</th>
                  <th>🥇 GOLD</th>
                  <th>💎 PLATINUM</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Products</td>
                  <td>50</td>
                  <td>300</td>
                  <td>1000</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Verified Badge</td>
                  <td>❌</td>
                  <td>✅ Silver</td>
                  <td>✅ Gold</td>
                  <td>✅ Platinum</td>
                </tr>
                <tr>
                  <td>Search Ranking</td>
                  <td>Basic</td>
                  <td>Better</td>
                  <td>Premium</td>
                  <td>Highest</td>
                </tr>
                <tr>
                  <td>Store Design</td>
                  <td>Basic</td>
                  <td>Premium</td>
                  <td>Premium+</td>
                  <td>Custom</td>
                </tr>
                <tr>
                  <td>Images per Product</td>
                  <td>5</td>
                  <td>8</td>
                  <td>10</td>
                  <td>15 + Videos</td>
                </tr>
                <tr>
                  <td>Product Videos</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅ Unlimited</td>
                </tr>
                <tr>
                  <td>Homepage Featured</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅ Daily</td>
                </tr>
                <tr>
                  <td>360° Images</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Coupons</td>
                  <td>0</td>
                  <td>5/Month</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td>Sponsored Products</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Flash Sale</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Analytics</td>
                  <td>Basic</td>
                  <td>Advanced</td>
                  <td>Advanced</td>
                  <td>AI Powered</td>
                </tr>
                <tr>
                  <td>Marketing Tools</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>Email + Push</td>
                  <td>WhatsApp + Email</td>
                </tr>
                <tr>
                  <td>Dedicated Manager</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Commission</td>
                  <td>12%</td>
                  <td>10%</td>
                  <td>8%</td>
                  <td>5%</td>
                </tr>
                <tr>
                  <td>Settlement</td>
                  <td>7 Days</td>
                  <td>5 Days</td>
                  <td>2 Days</td>
                  <td>24 Hours</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Email</td>
                  <td>Chat</td>
                  <td>Phone</td>
                  <td>Premium</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upgrade;