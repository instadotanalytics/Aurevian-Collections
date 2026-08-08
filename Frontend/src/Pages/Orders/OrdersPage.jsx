// src/Pages/Orders/OrdersPage.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaRupeeSign, FaBoxOpen } from "react-icons/fa";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import styles from "./OrdersPage.module.css";
import { fetchMyOrders } from "../../redux/slices/orderSlice";

const statusColor = {
  placed: "#6b7280",
  processing: "#d97706",
  shipped: "#2563eb",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { myOrders, isLoading } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyOrders());
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Header />
      <div className={styles.ordersPage}>
        <h1 className={styles.pageTitle}>My Orders</h1>

        {isLoading && <p className={styles.loadingText}>Loading orders...</p>}

        {!isLoading && myOrders.length === 0 && (
          <div className={styles.emptyState}>
            <FaBoxOpen size={40} />
            <p>You haven't placed any orders yet.</p>
            <Link to="/shop" className={styles.shopBtn}>
              Start Shopping
            </Link>
          </div>
        )}

        <div className={styles.ordersList}>
          {myOrders.map((order) => (
            <div className={styles.orderCard} key={order._id}>
              <div className={styles.orderHeader}>
                <div>
                  <p className={styles.orderNumber}>#{order.orderNumber}</p>
                  <p className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={styles.statusBadge}
                  style={{
                    background: statusColor[order.orderStatus] || "#6b7280",
                  }}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((item, idx) => (
                  <div className={styles.orderItem} key={idx}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemQty}>Qty: {item.quantity}</p>
                    </div>
                    <span>
                      <FaRupeeSign size={11} />
                      {item.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <span>Payment: {order.paymentStatus}</span>
                <span className={styles.orderTotal}>
                  Total: <FaRupeeSign size={12} />
                  {order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrdersPage;
