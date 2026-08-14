// src/Pages/Orders/OrderDetail.jsx
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

// Merges only the fields a socket event can actually carry — never
// clobbers fields (shippingAddress, items, razorpay, etc.) it doesn't know
// about, since MongoDB via REST remains the source of truth for those.
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

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await orderApi.getOrderById(id);
        if (cancelled) return;
        if (res.success) {
          setOrder(res.data);
        } else {
          setError(res.message || "Order not found");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Unable to load this order");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ✅ SOCKET.IO — join order:{id}, backend-verified. REST load above
  // always runs regardless of whether the socket is connected.
  useOrderRoom(id);

  useOrderSocketEvents({
    onSellerConfirmed: (payload) => {
      if (payload.orderId !== id) return;
      notifySellerConfirmed(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onSellerRejected: (payload) => {
      if (payload.orderId !== id) return;
      notifySellerRejected(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onAdminConfirmed: (payload) => {
      if (payload.orderId !== id) return;
      notifyAdminApproved(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onAdminRejected: (payload) => {
      if (payload.orderId !== id) return;
      notifyAdminRejected(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onShippingUpdated: (payload) => {
      if (payload.orderId !== id) return;
      notifyShippingUpdated(payload);
      setOrder((prev) => patchOrder(prev, payload));
    },
    onStatusUpdated: (payload) => {
      if (payload.orderId !== id) return;
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
            <p className={styles.stateTitle}>Loading order</p>
            <p className={styles.stateSub}>
              Just a moment while we pull up the details.
            </p>
          </div>
        )}
        {!loading && error && (
          <div className={styles.stateWrap}>
            <p className={styles.stateTitle}>Something went wrong</p>
            <p className={`${styles.stateSub} ${styles.errorText}`}>{error}</p>
          </div>
        )}
        {!loading && order && <OrderDetailView order={order} />}
      </div>
      <Footer />
    </>
  );
};

export default OrderDetail;
