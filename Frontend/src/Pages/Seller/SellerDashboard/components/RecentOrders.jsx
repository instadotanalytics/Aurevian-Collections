// src/Pages/Seller/SellerDashboard/components/RecentOrders.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import styles from "./RecentOrders.module.css";

// Every key here is a real value from Order.orderStatus — nothing invented.
const STATUS_META = {
  placed: { label: "Placed", className: "pending" },
  processing: { label: "Processing", className: "processing" },
  ready_to_ship: { label: "Ready to Ship", className: "readyToShip" },
  shipped: { label: "Shipped", className: "shipped" },
  in_transit: { label: "In Transit", className: "inTransit" },
  out_for_delivery: { label: "Out for Delivery", className: "outForDelivery" },
  delivered: { label: "Delivered", className: "delivered" },
  rto: { label: "RTO", className: "rto" },
  return_initiated: { label: "Return Initiated", className: "returnInitiated" },
  returned: { label: "Returned", className: "returned" },
  cancelled: { label: "Cancelled", className: "cancelled" },
};

const RecentOrders = ({ orders = [] }) => {
  const getStatusMeta = (status) =>
    STATUS_META[status] || { label: status || "Unknown", className: "pending" };

  return (
    <div className={styles.recentOrders}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FiPackage className={styles.headerIcon} />
          <h3>Recent Orders</h3>
        </div>
        <Link to="/seller/dashboard/orders" className={styles.viewAll}>
          View All
          <FiArrowRight className={styles.arrowIcon} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No orders yet</p>
          <span>When you receive orders, they'll appear here</span>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colOrderId}>Order ID</th>
                <th className={styles.colCustomer}>Customer</th>
                <th className={styles.colTotal}>Total</th>
                <th className={styles.colStatus}>Status</th>
                <th className={styles.colDate}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const meta = getStatusMeta(order.status);
                return (
                  <tr key={order._id}>
                    <td className={styles.colOrderId}>
                      <span className={styles.orderId}>
                        #{order.orderNumber}
                      </span>
                    </td>
                    <td className={styles.colCustomer}>
                      <span className={styles.customerName}>
                        {order.customer}
                      </span>
                    </td>
                    <td className={styles.colTotal}>
                      <span className={styles.totalAmount}>
                        ₹{Number(order.total || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className={styles.colStatus}>
                      <span
                        className={`${styles.statusBadge} ${styles[meta.className]}`}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className={styles.colDate}>
                      <span className={styles.orderDate}>
                        {new Date(order.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
