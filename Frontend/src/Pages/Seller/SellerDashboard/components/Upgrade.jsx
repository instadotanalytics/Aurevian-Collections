// src/Pages/Seller/SellerDashboard/components/Upgrade.jsx

import React, { useEffect } from "react";
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
  FiXCircle,
} from "react-icons/fi";
import {
  fetchPlans,
  fetchCurrentSubscription,
  cancelSubscriptionPlan,
} from "../../../../redux/slices/sellerSubscriptionSlice";

const formatLimit = (value) => (value === -1 ? "Unlimited" : value);

const Upgrade = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, current, loading } = useSelector(
    (state) => state.sellerSubscription,
  );

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchCurrentSubscription());
  }, [dispatch]);

  const handleUpgrade = (planId) => {
    if (planId === "free") return;
    navigate(`/seller/payment/${planId}`);
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You'll be moved to the Free plan immediately and lose your current plan's benefits right away.",
      )
    ) {
      dispatch(cancelSubscriptionPlan());
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className={styles.loadingState}>
        <FiLoader className={styles.spinner} />
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className={styles.upgradeContainer}>
      {/* Header */}
      <div className={styles.upgradeHeader}>
        <h1 className={styles.upgradeTitle}>
          <FiTrendingUp className={styles.headerIcon} />
          Become a Super Seller
        </h1>
        <p className={styles.upgradeSubtitle}>
          Choose the plan that fits your business and unlock premium selling
          tools
        </p>
      </div>

      {/* Active plan banner */}
      {current?.subscriptionStatus === "active" &&
        current?.plan?.id !== "free" && (
          <div className={styles.currentPlanBanner}>
            <div className={styles.bannerText}>
              <span className={styles.bannerLabel}>Active plan</span>
              <strong className={styles.bannerPlanName}>
                {current.plan.name}
              </strong>
              {current.subscriptionExpiresAt && (
                <span className={styles.bannerExpiry}>
                  Expires on{" "}
                  {new Date(current.subscriptionExpiresAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <button className={styles.cancelLink} onClick={handleCancel}>
              <FiXCircle /> Cancel plan
            </button>
          </div>
        )}

      {/* Plans Grid */}
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${
              plan.isPopular ? styles.popular : ""
            } ${plan.isCurrent ? styles.current : ""}`}
          >
            {plan.isPopular && !plan.isCurrent && (
              <div className={styles.popularBadge}>
                <FiStar /> Recommended
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
                <span className={styles.price}>{plan.priceDisplay}</span>
                <span className={styles.period}>/ Month</span>
              </div>
              <span className={styles.bestFor}>Best for: {plan.bestFor}</span>
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
                  <FiPercent /> {plan.commissionRate}%
                </span>
                <span className={styles.statItem}>
                  <FiClock /> {plan.settlementDays}d settlement
                </span>
              </div>

              <button
                className={`${styles.upgradeBtn} ${
                  plan.isCurrent ? styles.currentBtn : ""
                } ${plan.isPopular ? styles.popularBtn : ""}`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.isCurrent || plan.id === "free"}
              >
                {plan.isCurrent ? "Current Plan" : "Upgrade Now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className={styles.comparisonTable}>
        <h2>📊 Detailed Feature Comparison</h2>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Features</th>
                {plans.map((plan) => (
                  <th key={plan.id}>
                    {plan.icon} {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Products</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{formatLimit(plan.productLimit)}</td>
                ))}
              </tr>
              <tr>
                <td>Images per Product</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.imagesPerProduct}</td>
                ))}
              </tr>
              <tr>
                <td>Commission</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.commissionRate}%</td>
                ))}
              </tr>
              <tr>
                <td>Settlement</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.settlementDays} Day(s)</td>
                ))}
              </tr>
              <tr>
                <td>Support</td>
                {plans.map((plan) => (
                  <td key={plan.id}>{plan.supportLevel}</td>
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
