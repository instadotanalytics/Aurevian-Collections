// src/Pages/SuperAdmin/components/OrderHistory/OrderHistory.jsx
import React, { useEffect, useState, useCallback } from "react";
import { FaRupeeSign } from "react-icons/fa";
import { FiSearch, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "./OrderHistory.module.css";
import AdminOrderDetailModal from "./AdminOrderDetailModal.jsx";
import * as orderApi from "../../../../api/orderApi.js";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
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
  { value: "ALL", label: "All" },
  { value: "NOT_CREATED", label: "Not Created" },
  { value: "CREATED", label: "Created" },
  { value: "AWB_ASSIGNED", label: "AWB Assigned" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
];

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

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Order History</h1>
          <p className={styles.pageSubtitle}>
            Permanent record of every order ever placed —{" "}
            {pagination.totalOrders} total.
          </p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <FiSearch size={14} />
          <input
            type="text"
            placeholder="Order number, customer name, email, phone..."
            value={search}
            onChange={handleFilterChange(setSearch)}
          />
        </div>

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
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Seller</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Shiprocket</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className={styles.loadingCell}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={10} className={styles.loadingCell}>
                  No orders match these filters.
                </td>
              </tr>
            )}
            {!loading &&
              orders.map((o) => (
                <tr key={o._id}>
                  <td className={styles.mono}>#{o.orderNumber}</td>
                  <td>
                    <div>{o.customerName}</div>
                    <div className={styles.subText}>{o.customerEmail}</div>
                  </td>
                  <td>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>{o.items?.length || 0}</td>
                  <td>
                    {o.seller?.storeInfo?.storeName ||
                      o.seller?.fullName ||
                      "—"}
                  </td>
                  <td>
                    <FaRupeeSign size={10} />
                    {o.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${styles[o.paymentStatus]}`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td>{o.orderStatus}</td>
                  <td>
                    {o.shipping?.shiprocketOrderId
                      ? o.shipping.awbCode
                        ? "AWB Assigned"
                        : "Created"
                      : "Not Created"}
                  </td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => setDetailId(o._id)}
                    >
                      <FiEye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationBar}>
        <button
          className={styles.pageBtn}
          disabled={pagination.currentPage <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <FiChevronLeft size={14} /> Previous
        </button>
        <span className={styles.pageInfo}>
          Page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalOrders} orders)
        </span>
        <button
          className={styles.pageBtn}
          disabled={pagination.currentPage >= pagination.totalPages}
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
        >
          Next <FiChevronRight size={14} />
        </button>
      </div>

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
