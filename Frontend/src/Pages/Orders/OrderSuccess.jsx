
// src/Pages/Orders/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import OrderDetailView from "../../Components/OrderDetailView/OrderDetailView";
import * as orderApi from "../../api/orderApi.js";
import styles from "../../Components/OrderDetailView/OrderDetailView.module.css";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await orderApi.getOrderById(orderId);
        if (cancelled) return;
        if (res.success) {
          setOrder(res.data);
        } else {
          setError(res.message || "Order not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Unable to load your order");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className={styles.page}>
      <Header />
      {loading && (
        <div className={styles.stateWrap}>
          <div className={styles.spinner} />
          <p className={styles.stateTitle}>Loading your order</p>
          <p className={styles.stateSub}>
            Just a moment while we confirm the details.
          </p>
        </div>
      )}
      {!loading && error && (
        <div className={styles.stateWrap}>
          <p className={styles.stateTitle}>Something went wrong</p>
          <p className={`${styles.stateSub} ${styles.errorText}`}>{error}</p>
        </div>
      )}
      {!loading && order && <OrderDetailView order={order} justPlaced />}
      <Footer />
    </div>
  );
};

export default OrderSuccess;