// src/Pages/Orders/OrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../Layout/Header/Header";
import Footer from "../Layout/Footer/Footer";
import OrderDetailView from "../../Components/OrderDetailView/OrderDetailView";
import * as orderApi from "../../api/orderApi.js";

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

  return (
    <>
      <Header />
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          Loading order...
        </div>
      )}
      {!loading && error && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      )}
      {!loading && order && <OrderDetailView order={order} />}
      <Footer />
    </>
  );
};

export default OrderDetail;
