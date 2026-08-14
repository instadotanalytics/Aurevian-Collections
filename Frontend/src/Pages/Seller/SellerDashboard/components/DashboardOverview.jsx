// src/Pages/Seller/SellerDashboard/components/DashboardOverview.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import StatsCard from "./StatsCard";
import RecentOrders from "./RecentOrders";
import QuickActions from "./QuickActions";

import {
  fetchSellerDashboard,
  fetchRecentOrders,
  fetchRecentActivities,
  fetchDashboardPerformance,
  getKycStatus,
} from "../../../../redux/slices/sellerSlice";
import useSellerDashboardLiveUpdates from "../../../../hooks/useSellerDashboardLiveUpdates";

import styles from "./DashboardOverview.module.css";

const PERIODS = [
  { key: "this-week", label: "This Week" },
  { key: "this-month", label: "This Month" },
  { key: "this-year", label: "This Year" },
];

// Curated but 100% real fulfillmentStatus values — nothing invented.
const FULFILLMENT_LABELS = [
  { key: "PENDING_SELLER_CONFIRMATION", label: "Pending" },
  { key: "SELLER_CONFIRMED", label: "Confirmed" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

const inr = (value) => `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const [period, setPeriod] = useState("this-month");

  const { seller, dashboardStats, recentOrders, performance } = useSelector(
    (state) => state.seller,
  );

  useEffect(() => {
    dispatch(fetchSellerDashboard());
    dispatch(fetchRecentOrders());
    dispatch(fetchRecentActivities());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardPerformance(period));
  }, [dispatch, period]);

  // ✅ SOCKET.IO — live-refresh dashboard numbers/orders/activity, reusing
  // the seller's existing seller:<id> room. No polling, no page reload.
  useSellerDashboardLiveUpdates();

  const kycStatus = getKycStatus(seller);
  const isKycVerified = kycStatus === "verified";

  const chartData = performance?.data || [];
  const chartLoading = performance?.loading;
  const chartHasData = chartData.some((d) => d.revenue > 0);

  const revenueChange = dashboardStats?.revenueChangePercent;
  const hasRevenueChange = typeof revenueChange === "number";

  const orderStatusCounts = dashboardStats?.orderStatusBreakdown || {};
  const lowStockProducts = dashboardStats?.lowStockProducts || [];
  const topProducts = dashboardStats?.topProducts || [];

  return (
    <div className={styles.dashboardOverview}>
      {/* ================= KYC BANNER ================= */}
      {!isKycVerified && (
        <div className={styles.kycBanner}>
          <div className={styles.kycBannerLeft}>
            <div className={styles.kycIconWrap}>
              <FiAlertTriangle />
            </div>

            <div>
              <h3 className={styles.kycTitle}>
                Verify your account to start selling
              </h3>
              <p className={styles.kycText}>
                Complete your KYC verification to list products, receive orders,
                and get paid without interruption.
              </p>
            </div>
          </div>

          <Link to="/seller/kyc" className={styles.kycBtn}>
            {kycStatus === "submitted" || kycStatus === "under_review"
              ? "Check KYC Status"
              : kycStatus === "rejected"
                ? "Resubmit KYC"
                : "Complete your KYC"}
            <FiArrowRight />
          </Link>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div>
          <p className={styles.subtitle}>
            Track your store's performance and manage your business.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.storeStatus}>
            <span
              className={`${styles.statusDot} ${
                isKycVerified ? styles.active : styles.pending
              }`}
            />

            <span className={styles.statusText}>
              {isKycVerified ? (
                <>
                  <FiCheckCircle style={{ marginRight: 4 }} />
                  Store Active
                </>
              ) : (
                "Verification Pending"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="Total Products"
          value={dashboardStats?.totalProducts ?? 0}
          icon={<FiPackage />}
          color="#6366f1"
          subtext={
            dashboardStats
              ? `${dashboardStats.activeProducts ?? 0} active${
                  dashboardStats.newProductsThisMonth
                    ? ` · +${dashboardStats.newProductsThisMonth} this month`
                    : ""
                }`
              : undefined
          }
        />

        <StatsCard
          title="Total Orders"
          value={dashboardStats?.totalOrders ?? 0}
          icon={<FiShoppingBag />}
          color="#f59e0b"
          subtext={
            dashboardStats
              ? `${dashboardStats.pendingOrders ?? 0} pending confirmation`
              : undefined
          }
        />

        <StatsCard
          title="Revenue"
          value={inr(dashboardStats?.revenue)}
          icon={<FiDollarSign />}
          color="#10b981"
          trend={dashboardStats?.revenueTrend || []}
          change={hasRevenueChange ? revenueChange : undefined}
          subtext={
            hasRevenueChange
              ? `${revenueChange >= 0 ? "↑" : "↓"} ${Math.abs(revenueChange).toFixed(1)}% from last month`
              : "Compared with previous period"
          }
        />

        <StatsCard
          title="Customers"
          value={dashboardStats?.totalCustomers ?? 0}
          icon={<FiUsers />}
          color="#ec4899"
          subtext={
            dashboardStats
              ? `+${dashboardStats.newCustomersThisMonth ?? 0} new this month`
              : undefined
          }
        />
      </div>

      {/* ================= SALES PERFORMANCE ================= */}
      <div className={styles.performanceCard}>
        <div className={styles.performanceHeader}>
          <h3 className={styles.performanceTitle}>Sales Performance</h3>
          <div className={styles.periodTabs}>
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`${styles.periodTab} ${
                  period === p.key ? styles.periodTabActive : ""
                }`}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.chartWrapper}>
          {chartLoading ? (
            <div className={styles.chartEmpty}>Loading chart…</div>
          ) : !chartHasData ? (
            <div className={styles.chartEmpty}>
              No sales recorded for this period yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8a86e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#c8a86e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0ebe6"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#8c8c82" }}
                  axisLine={{ stroke: "#f0ebe6" }}
                  tickLine={false}
                  interval={period === "this-month" ? 4 : 0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#8c8c82" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                />
                <Tooltip
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [inr(value), "Revenue"]
                      : [value, "Orders"]
                  }
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #f0ebe6",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c8a86e"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <RecentOrders orders={recentOrders} />

          <div className={styles.topProductsCard}>
            <h3 className={styles.sectionTitle}>Top Products</h3>
            {topProducts.length === 0 ? (
              <div className={styles.emptyBlock}>
                <p>No sales yet</p>
                <span>Your best-performing products will appear here</span>
              </div>
            ) : (
              <div className={styles.topProductsList}>
                {topProducts.map((p) => (
                  <div key={p.productId} className={styles.topProductRow}>
                    <div className={styles.topProductImage}>
                      {p.image ? (
                        <img src={p.image} alt={p.name} />
                      ) : (
                        <FiPackage />
                      )}
                    </div>
                    <div className={styles.topProductInfo}>
                      <span className={styles.topProductName}>{p.name}</span>
                      <span className={styles.topProductMeta}>
                        {p.unitsSold} sold
                        {p.stock !== null ? ` · ${p.stock} in stock` : ""}
                      </span>
                    </div>
                    <span className={styles.topProductRevenue}>
                      {inr(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <QuickActions />

          <div className={styles.statusCard}>
            <h3 className={styles.sectionTitle}>Order Status</h3>
            <div className={styles.statusGrid}>
              {FULFILLMENT_LABELS.map(({ key, label }) => (
                <div key={key} className={styles.statusRow}>
                  <span className={styles.statusRowLabel}>{label}</span>
                  <span className={styles.statusRowValue}>
                    {orderStatusCounts[key] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.lowStockCard}>
            <div className={styles.lowStockHeader}>
              <FiAlertCircle className={styles.lowStockIcon} />
              <h3 className={styles.sectionTitle}>Low Stock</h3>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className={styles.emptyBlock}>
                <p>All good</p>
                <span>No products are running low right now</span>
              </div>
            ) : (
              <div className={styles.lowStockList}>
                {lowStockProducts.map((p) => (
                  <div key={p._id} className={styles.lowStockRow}>
                    <span className={styles.lowStockName}>{p.name}</span>
                    <span className={styles.lowStockCount}>{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
