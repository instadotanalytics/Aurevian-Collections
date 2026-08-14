// src/Pages/Orders/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import OrderDetailView from "../../Components/OrderDetailView/OrderDetailView";
import * as orderApi from "../../api/orderApi.js";
import styles from "../../Components/OrderDetailView/OrderDetailView.module.css";
import useOrderRoom from "../../hooks/useOrderRoom.js";
import useOrderSocketEvents from "../../hooks/useOrderSocketEvents.js";
import {
  notifySellerConfirmed,
  notifySellerRejected,
  notifyAdminApproved,
  notifyAdminRejected,
  notifyShippingUpdated,
} from "../../utils/orderNotifications.js";

const patchOrder = (prev, payload) => {
  if (!prev) return prev;
  return {
    ...prev,
    orderStatus: payload.orderStatus ?? prev.orderStatus,
    fulfillmentStatus: payload.fulfillmentStatus ?? prev.fulfillmentStatus,
    paymentStatus: payload.paymentStatus ?? prev.paymentStatus,
    sellerRejectionReason: payload.reason ?? prev.sellerRejectionReason,
    adminRejectionReason: payload.reason ?? prev.adminRejectionReason,
    shipping: payload.shipping
      ? { ...prev.shipping, ...payload.shipping }
      : prev.shipping,
  };
};

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

  useOrderRoom(orderId);

  useOrderSocketEvents({
    onSellerConfirmed: (payload) => {
      if (payload.orderId !== orderId) return;
      notifySellerConfirmed(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onSellerRejected: (payload) => {
      if (payload.orderId !== orderId) return;
      notifySellerRejected(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onAdminConfirmed: (payload) => {
      if (payload.orderId !== orderId) return;
      notifyAdminApproved(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onAdminRejected: (payload) => {
      if (payload.orderId !== orderId) return;
      notifyAdminRejected(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onShippingUpdated: (payload) => {
      if (payload.orderId !== orderId) return;
      notifyShippingUpdated(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onStatusUpdated: (payload) => {
      if (payload.orderId !== orderId) return;
      setOrder((prev) => patchOrder(prev, payload));
    },
  });

  return (
    <>
      <Header />
      <div className={styles.page}>
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
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccess;
