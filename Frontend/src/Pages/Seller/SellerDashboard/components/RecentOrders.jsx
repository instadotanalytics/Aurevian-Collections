// src/Pages/Seller/SellerDashboard/components/RecentOrders.jsx

import React from 'react';
import { Link } from 'react-router-dom';
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
        <h3>Recent Orders</h3>
        <Link to="/seller/orders" className={styles.viewAll}>
          View All →
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
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className={styles.orderId}>#{order.orderNumber}</td>
                  <td>{order.customer}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
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