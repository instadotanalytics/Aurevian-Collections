// src/Pages/Seller/SellerDashboard/components/RecentOrders.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPackage } from 'react-icons/fi';
import styles from './RecentOrders.module.css';

const RecentOrders = ({ orders = [] }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: styles.pending,
      processing: styles.processing,
      shipped: styles.shipped,
      delivered: styles.delivered,
      cancelled: styles.cancelled,
    };
    return colors[status] || '';
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className={styles.colOrderId}>
                    <span className={styles.orderId}>#{order.orderNumber}</span>
                  </td>
                  <td className={styles.colCustomer}>
                    <span className={styles.customerName}>{order.customer}</span>
                  </td>
                  <td className={styles.colTotal}>
                    <span className={styles.totalAmount}>${order.total.toFixed(2)}</span>
                  </td>
                  <td className={styles.colStatus}>
                    <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className={styles.colDate}>
                    <span className={styles.orderDate}>{new Date(order.date).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;