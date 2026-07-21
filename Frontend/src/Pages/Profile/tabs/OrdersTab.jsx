// src/Pages/Profile/tabs/OrdersTab.jsx

import React, { useState, useEffect } from 'react';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiAlertCircle, FiEye } from 'react-icons/fi';
import styles from '../Profile.module.css';

const OrdersTab = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/users/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FiClock />;
      case 'processing': return <FiPackage />;
      case 'shipped': return <FiTruck />;
      case 'delivered': return <FiCheckCircle />;
      case 'cancelled': return <FiAlertCircle />;
      default: return <FiPackage />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return styles.statusPending;
      case 'processing': return styles.statusProcessing;
      case 'shipped': return styles.statusShipped;
      case 'delivered': return styles.statusDelivered;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  if (loading) {
    return <div className={styles.loadingSpinner}></div>;
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FiPackage size={48} />
        <h3>No Orders Yet</h3>
        <p>You haven't placed any orders yet. Start shopping now!</p>
        <button className={styles.shopNowBtn}>Start Shopping</button>
      </div>
    );
  }

  return (
    <div className={styles.ordersTab}>
      {orders.map((order) => (
        <div key={order._id} className={styles.orderCard}>
          <div className={styles.orderHeader}>
            <div>
              <span className={styles.orderId}>#{order.orderNumber}</span>
              <span className={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <span className={`${styles.orderStatus} ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              {order.status}
            </span>
          </div>
          
          <div className={styles.orderItems}>
            {order.items?.slice(0, 3).map((item) => (
              <div key={item._id} className={styles.orderItem}>
                <img src={item.product?.images?.[0]} alt={item.product?.name} />
                <div>
                  <p>{item.product?.name}</p>
                  <span>Qty: {item.quantity}</span>
                </div>
                <span>${item.price}</span>
              </div>
            ))}
            {order.items?.length > 3 && (
              <div className={styles.moreItems}>
                +{order.items.length - 3} more items
              </div>
            )}
          </div>
          
          <div className={styles.orderFooter}>
            <div className={styles.orderTotal}>
              <span>Total:</span>
              <strong>${order.total}</strong>
            </div>
            <button className={styles.viewOrderBtn}>
              <FiEye size={16} />
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersTab;