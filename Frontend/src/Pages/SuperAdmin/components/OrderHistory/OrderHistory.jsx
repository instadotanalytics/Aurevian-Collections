
// src/Pages/SuperAdmin/components/OrderHistory/OrderHistory.jsx
import React, { useEffect, useState, useCallback } from "react";
import { FaRupeeSign } from "react-icons/fa";
import {
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
  FiX,
} from "react-icons/fi";
import styles from "./OrderHistory.module.css";
import AdminOrderDetailModal from "./AdminOrderDetailModal.jsx";
import * as orderApi from "../../../../api/orderApi.js";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  {
    value: "PENDING_SELLER_CONFIRMATION",
    label: "Pending Seller Confirmation",
  },
  {
    value: "SELLER_CONFIRMED",
    label: "Seller Confirmed / Pending Admin Approval",
  },
  { value: "ADMIN_APPROVED", label: "Admin Approved" },
  { value: "PROCESSING", label: "Processing" },
  { value: "READY_TO_SHIP", label: "Ready to Ship" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FAILED", label: "Failed" },
];

const PAYMENT_OPTIONS = ["ALL", "pending", "paid", "failed", "refunded"];

const DATE_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
];

const SHIPROCKET_OPTIONS = [
  { value: "ALL", label: "All Shiprocket" },
  { value: "NOT_CREATED", label: "Not Created" },
  { value: "CREATED", label: "Created" },
  { value: "AWB_ASSIGNED", label: "AWB Assigned" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
];

const PAYMENT_GROUP = {
  paid: "statusApproved",
  pending: "statusPending",
  failed: "statusRejected",
  refunded: "statusSuspended",
};

const ORDER_STATUS_GROUP = {
  placed: "statusPending",
  ready_to_ship: "statusSuspended",
  processing: "statusSuspended",
  shipped: "statusSuspended",
  in_transit: "statusSuspended",
  out_for_delivery: "statusSuspended",
  delivered: "statusApproved",
  cancelled: "statusRejected",
  rejected: "statusRejected",
  failed: "statusRejected",
};

const SHIPROCKET_GROUP = {
  "Not Created": "statusNeutral",
  Created: "statusSuspended",
  "AWB Assigned": "statusSuspended",
  "Picked Up": "statusSuspended",
  "In Transit": "statusSuspended",
  Delivered: "statusApproved",
  Failed: "statusRejected",
};

const getShiprocketLabel = (o) =>
  o.shipping?.shiprocketOrderId
    ? o.shipping.awbCode
      ? "AWB Assigned"
      : "Created"
    : "Not Created";

const SkeletonLoader = ({ count = 8 }) => (
  <div className={styles.skeletonContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className={styles.skeletonRow}>
        <div className={styles.skeletonIndex}></div>
        <div className={styles.skeletonName}>
          <div className={styles.skeletonLine}></div>
          <div className={styles.skeletonLineShort}></div>
        </div>
        <div className={styles.skeletonContact}></div>
        <div className={styles.skeletonStore}></div>
        <div className={styles.skeletonStatus}></div>
        <div className={styles.skeletonStatus}></div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonIcon}></div>
        </div>
      </div>
    ))}
  </div>
);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [dateRange, setDateRange] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [shiprocket, setShiprocket] = useState("ALL");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrderHistory({
        page,
        limit: 20,
        search: search || undefined,
        status: status !== "ALL" ? status : undefined,
        payment: payment !== "ALL" ? payment : undefined,
        dateRange: dateRange || undefined,
        startDate: dateRange === "custom" ? startDate || undefined : undefined,
        endDate: dateRange === "custom" ? endDate || undefined : undefined,
        shiprocket: shiprocket !== "ALL" ? shiprocket : undefined,
      });
      if (res.success) {
        setOrders(res.orders);
        setPagination(res.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    status,
    payment,
    dateRange,
    startDate,
    endDate,
    shiprocket,
  ]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleFilterChange = (setter) => (e) => {
    setPage(1);
    setter(e.target.value);
  };

  const hasActiveFilters =
    search ||
    status !== "ALL" ||
    payment !== "ALL" ||
    shiprocket !== "ALL" ||
    dateRange;

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setPayment("ALL");
    setShiprocket("ALL");
    setDateRange("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const showLoadingState = loading && orders.length === 0;

  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <FiInbox size={60} className={styles.emptyIcon} />
      <h3>No orders found</h3>
      <p>
        {hasActiveFilters
          ? "Try adjusting your filters or search terms"
          : "Orders will show up here once they are placed"}
      </p>
      {hasActiveFilters && (
        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
          <FiX size={18} />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Order History</h1>
          <span className={styles.countPill}>
            {pagination.totalOrders ?? 0} order
            {pagination.totalOrders === 1 ? "" : "s"}
          </span>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.headerSubtitle}>
            Permanent record of every order ever placed
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search order number, customer name, email, phone..."
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={status}
            onChange={handleFilterChange(setStatus)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={payment}
            onChange={handleFilterChange(setPayment)}
          >
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p === "ALL" ? "All Payments" : p}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={shiprocket}
            onChange={handleFilterChange(setShiprocket)}
          >
            {SHIPROCKET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={dateRange}
            onChange={handleFilterChange(setDateRange)}
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {dateRange === "custom" && (
            <>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={handleFilterChange(setStartDate)}
              />
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={handleFilterChange(setEndDate)}
              />
            </>
          )}

          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              <FiX size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table / List */}
      {showLoadingState ? (
        <div className={styles.tableContainer}>
          <SkeletonLoader count={8} />
        </div>
      ) : orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th className={styles.indexCell}>#</th>
                <th className={styles.orderCell}>Order</th>
                <th className={styles.customerCell}>Customer</th>
                <th className={styles.dateCell}>Date</th>
                <th className={styles.itemsCell}>Items</th>
                <th className={styles.sellerCell}>Seller</th>
                <th className={styles.totalCell}>Total</th>
                <th className={styles.statusCell}>Payment</th>
                <th className={styles.statusCell}>Order Status</th>
                <th className={styles.statusCell}>Shiprocket</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, index) => {
                const paymentClass =
                  styles[PAYMENT_GROUP[o.paymentStatus] || "statusNeutral"];
                const orderClass =
                  styles[ORDER_STATUS_GROUP[o.orderStatus] || "statusNeutral"];
                const shiprocketLabel = getShiprocketLabel(o);
                const shiprocketClass =
                  styles[SHIPROCKET_GROUP[shiprocketLabel] || "statusNeutral"];
                const serial = (pagination.currentPage - 1) * 20 + index + 1;

                return (
                  <tr key={o._id} className={styles.tableRow}>
                    <td className={styles.indexCell} data-label="#">
                      <span className={styles.indexNumber}>{serial}</span>
                    </td>

                    <td className={styles.orderCell} data-label="Order">
                      <span className={styles.orderNumber}>
                        #{o.orderNumber}
                      </span>
                    </td>

                    <td className={styles.customerCell} data-label="Customer">
                      <div className={styles.customerInfo}>
                        <span className={styles.customerName}>
                          {o.customerName}
                        </span>
                        <span className={styles.customerSub}>
                          {o.customerEmail}
                        </span>
                      </div>
                    </td>

                    <td className={styles.dateCell} data-label="Date">
                      <span className={styles.dateText}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    <td className={styles.itemsCell} data-label="Items">
                      <span className={styles.itemsCount}>
                        {o.items?.length || 0}
                      </span>
                    </td>

                    <td className={styles.sellerCell} data-label="Seller">
                      <span className={styles.sellerName}>
                        {o.seller?.storeInfo?.storeName ||
                          o.seller?.fullName ||
                          "—"}
                      </span>
                    </td>

                    <td className={styles.totalCell} data-label="Total">
                      <span className={styles.totalAmount}>
                        <FaRupeeSign size={11} />
                        {o.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className={styles.statusCell} data-label="Payment">
                      <span className={`${styles.statusBadge} ${paymentClass}`}>
                        {o.paymentStatus}
                      </span>
                    </td>

                    <td
                      className={styles.statusCell}
                      data-label="Order Status"
                    >
                      <span className={`${styles.statusBadge} ${orderClass}`}>
                        {o.orderStatus}
                      </span>
                    </td>

                    <td className={styles.statusCell} data-label="Shiprocket">
                      <span
                        className={`${styles.statusBadge} ${shiprocketClass}`}
                      >
                        {shiprocketLabel}
                      </span>
                    </td>

                    <td className={styles.actionsCell} data-label="Actions">
                      <div className={styles.actions}>
                        <button
                          className={styles.actionIconBtn}
                          onClick={() => setDetailId(o._id)}
                          title="View order"
                        >
                          <FiEye size={14} />
                          <span className={styles.actionBtnLabel}>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!showLoadingState && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            disabled={pagination.currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <FiChevronLeft size={18} />
          </button>

          <div className={styles.paginationPages}>
            {[...Array(pagination.totalPages)].map((_, i) => {
              const p = i + 1;
              const isActive = p === pagination.currentPage;
              const isNearCurrent = Math.abs(p - pagination.currentPage) <= 2;
              const isFirst = p === 1;
              const isLast = p === pagination.totalPages;

              if (isNearCurrent || isFirst || isLast) {
                return (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${
                      isActive ? styles.activePage : ""
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              }

              if (
                (p === pagination.currentPage - 3 &&
                  pagination.currentPage > 4) ||
                (p === pagination.currentPage + 3 &&
                  pagination.currentPage < pagination.totalPages - 3)
              ) {
                return (
                  <span key={p} className={styles.pageDots}>
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            className={styles.paginationBtn}
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

      {detailId && (
        <AdminOrderDetailModal
          orderId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
};

export default OrderHistory;