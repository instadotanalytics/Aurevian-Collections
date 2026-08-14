// src/hooks/useSellerNotifications.js
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useOrderSocketEvents from "./useOrderSocketEvents.js";

export default function useSellerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    console.log("🔔 [SELLER NOTIFICATION] updating state:", notif.title);
    setNotifications((prev) => [notif, ...prev].slice(0, 30));
  }, []);

  useOrderSocketEvents({
    onOrderCreated: (payload) => {
      addNotification({
        id: `${payload.orderId}-created-${Date.now()}`,
        title: "New Order Received",
        message: `#${payload.orderNumber} · ${payload.customerName} · ₹${(
          payload.totalAmount || 0
        ).toLocaleString("en-IN")}`,
        orderId: payload.orderId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
    onAdminConfirmed: (payload) => {
      addNotification({
        id: `${payload.orderId}-approved-${Date.now()}`,
        title: "Order Approved by Admin",
        message: `#${payload.orderNumber} approved and forwarded to Shiprocket`,
        orderId: payload.orderId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
    onAdminRejected: (payload) => {
      addNotification({
        id: `${payload.orderId}-rejected-${Date.now()}`,
        title: "Order Rejected by Admin",
        message: `#${payload.orderNumber}: ${payload.reason || "No reason given"}`,
        orderId: payload.orderId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
    onShippingUpdated: (payload) => {
      addNotification({
        id: `${payload.orderId}-shipping-${Date.now()}`,
        title: "Shipping Update",
        message: `#${payload.orderNumber}: ${payload.shipping?.status || "updated"}`,
        orderId: payload.orderId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
  });

  const handleItemClick = useCallback(
    (notif) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
      console.log(
        `🖱️ [SELLER NOTIFICATION] clicked — navigating to order ${notif.orderId}`,
      );
      navigate(`/seller/dashboard/orders`);
    },
    [navigate],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, handleItemClick, markAllRead };
}
