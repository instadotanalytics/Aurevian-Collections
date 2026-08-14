// src/hooks/useAdminNotifications.js
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useOrderSocketEvents from "./useOrderSocketEvents.js";

export default function useAdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    console.log("🔔 [ADMIN NOTIFICATION] updating state:", notif.title);
    setNotifications((prev) => [notif, ...prev].slice(0, 30));
  }, []);

  useOrderSocketEvents({
    onOrderCreated: (payload) => {
      addNotification({
        id: `${payload.orderId}-created-${Date.now()}`,
        title: "New Order Placed",
        message: `#${payload.orderNumber} · awaiting seller confirmation`,
        orderId: payload.orderId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
    onSellerConfirmed: (payload) => {
      addNotification({
        id: `${payload.orderId}-sellerconfirmed-${Date.now()}`,
        title: "Seller Confirmed Order",
        message: `#${payload.orderNumber} · ready for admin approval`,
        orderId: payload.orderId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    },
    onSellerRejected: (payload) => {
      addNotification({
        id: `${payload.orderId}-sellerrejected-${Date.now()}`,
        title: "Seller Rejected Order",
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
        `🖱️ [ADMIN NOTIFICATION] clicked — navigating to orders section`,
      );
      navigate(`/super-admin/dashboard/orders`);
    },
    [navigate],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, handleItemClick, markAllRead };
}
