// src/Pages/Seller/SellerDashboard/components/Upgrade.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./Upgrade.module.css";
import {
  FiStar,
  FiCheck,
  FiClock,
  FiPercent,
  FiTrendingUp,
  FiLoader,
  FiInfo,
  FiAward,
  FiZap,
  FiShoppingBag,
  FiCamera,
  FiHeadphones,
  FiRefreshCw,
  FiAlertCircle,
  FiGift,
  FiUsers,
  FiSmile,
  FiHeart,
  FiTruck,
  FiShield,
  FiThumbsUp,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";
import {
  fetchPlans,
  fetchCurrentSubscription,
} from "../../../../redux/slices/sellerSubscriptionSlice";

// ============================================
// SKELETON LOADER
// ============================================
const SkeletonLoader = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
      <div className={styles.skeletonPlans}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonPlan}>
            <div className={styles.skeletonBadge} />
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonPlanHeader} />
            <div className={styles.skeletonFeatures}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className={styles.skeletonFeature} />
              ))}
            </div>
            <div className={styles.skeletonFooter} />
          </div>
        ))}
      </div>
    </div>
  );
};

const formatLimit = (value) => (value === -1 ? "∞" : value);

// ============================================
// MAIN COMPONENT
// ============================================
const Upgrade = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, current, loading } = useSelector(
    (state) => state.sellerSubscription,
  );
  const [refreshing, setRefreshing] = useState(false);
  const refreshThrottleRef = useRef(null);

  // ============================================
  // THROTTLED REFRESH
  // ============================================
  const handleRefresh = useCallback(() => {
    if (refreshThrottleRef.current) return;

    setRefreshing(true);
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
    
    refreshThrottleRef.current = setTimeout(() => {
      refreshThrottleRef.current = null;
      setRefreshing(false);
    }, 2000);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());

    return () => {
      if (refreshThrottleRef.current) {
        clearTimeout(refreshThrottleRef.current);
      }
    };
  }, [dispatch]);

  const hasActivePaidPlan =
    current?.subscriptionStatus === "active" &&
    current?.plan &&
    current.plan.id !== "free";

  const handleUpgrade = (planId) => {
    if (planId === "free") return;
    navigate(`/seller/payment/${planId}`);
  };

  // ============================================
  // PLAN ICON MAP - Using only available icons
  // ============================================
  const getPlanIcon = (planId) => {
    switch (planId) {
      case "free":
        return <FiGift size={28} />;
      case "basic":
        return <FiSmile size={28} />;
      case "pro":
        return <FiZap size={28} />;
      case "premium":
        return <FiAward size={28} />;
      default:
        return <FiPackage size={28} />;
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading && plans.length === 0) {
    return (
      <div className={styles.container}>
        <SkeletonLoader />
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FiTrendingUp className={styles.titleIcon} />
            Upgrade Plan
          </h1>
          <span className={styles.subtitle}>Choose the perfect plan for your business</span>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FiRefreshCw className={refreshing ? styles.spinning : ""} size={16} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Current Plan Banner */}
      {hasActivePaidPlan && (
        <div className={styles.currentBanner}>
          <div className={styles.bannerContent}>
            <FiAward className={styles.bannerIcon} />
            <span className={styles.bannerLabel}>Active Plan</span>
            <strong className={styles.bannerPlan}>{current.plan.name}</strong>
            {current.subscriptionExpiresAt && (
              <span className={styles.bannerExpiry}>
                Valid until {new Date(current.subscriptionExpiresAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Plans Grid - 4 cards in a row */}
      <div className={styles.plansGrid}>
        {plans.map((plan) => {
          const isCurrent = plan.isCurrent;
          const isPopular = plan.isPopular;

          return (
            <div
              key={plan.id}
              className={`${styles.planCard} ${isPopular ? styles.popular : ""} ${isCurrent ? styles.current : ""}`}
            >
              {/* Badges */}
              {isPopular && !isCurrent && (
                <div className={styles.popularBadge}>
                  <FiStar size={12} /> Popular
                </div>
              )}
              {isCurrent && (
                <div className={styles.currentBadge}>
                  <FiCheck size={12} /> Active
                </div>
              )}

              {/* Plan Icon */}
              <div className={styles.planIcon}>
                {getPlanIcon(plan.id)}
              </div>

              {/* Plan Info */}
              <div className={styles.planInfo}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.price}>{plan.priceDisplay}</span>
                  <span className={styles.period}>/mo</span>
                </div>
                <span className={styles.bestFor}>{plan.bestFor}</span>
              </div>

              {/* Features */}
              <ul className={styles.features}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <FiCheck className={styles.checkIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Stats with icons */}
              <div className={styles.planStats}>
                <span className={styles.statItem}>
                  <FiPercent size={14} />
                  {plan.commissionRate}%
                </span>
                <span className={styles.statItem}>
                  <FiClock size={14} />
                  {plan.settlementDays}d
                </span>
                <span className={styles.statItem}>
                  <FiShoppingBag size={14} />
                  {formatLimit(plan.productLimit)}
                </span>
              </div>

              {/* Button */}
              <button
                className={`${styles.upgradeBtn} ${isCurrent ? styles.currentBtn : ""} ${isPopular && !isCurrent ? styles.popularBtn : ""}`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || plan.id === "free"}
              >
                {isCurrent ? "Current Plan" : 
                 hasActivePaidPlan ? "Switch Plan" : 
                 plan.id === "free" ? "Free" : "Upgrade Now"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className={styles.comparison}>
        <h2 className={styles.comparisonTitle}>
          <FiInfo size={20} />
          Feature Comparison
        </h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id}>
                    <span className={styles.tablePlanIcon}>
                      {getPlanIcon(plan.id)}
                    </span>
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><FiShoppingBag size={14} /> Products</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{formatLimit(plan.productLimit)}</td>
                ))}
              </tr>
              <tr>
                <td><FiCamera size={14} /> Images per Product</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.imagesPerProduct}</td>
                ))}
              </tr>
              <tr>
                <td><FiPercent size={14} /> Commission Rate</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.commissionRate}%</td>
                ))}
              </tr>
              <tr>
                <td><FiClock size={14} /> Settlement Days</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.settlementDays} days</td>
                ))}
              </tr>
              <tr>
                <td><FiHeadphones size={14} /> Support Level</td>
                {plans.map((plan) => (
                  <td key={plan.id}>
                    <FiHeadphones size={12} />
                    {plan.supportLevel}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;