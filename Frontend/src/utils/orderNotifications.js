// src/utils/orderNotifications.js
// Reuses the app's existing react-hot-toast setup (see App.jsx's
// <Toaster />) — no new notification library. Deduplication now lives
// per-hook-instance in useOrderSocketEvents.js.

import toast from "react-hot-toast";

export function notifyNewOrder(payload) {
  toast.success(
    `New Order Received\n#${payload.orderNumber} · ${payload.customerName} · ₹${(
      payload.totalAmount || 0
    ).toLocaleString("en-IN")}`,
    { duration: 6000 },
  );
}

export function notifySellerConfirmed(payload) {
  toast.success(`Seller confirmed order #${payload.orderNumber}`);
}

export function notifySellerRejected(payload) {
  toast.error(`Order #${payload.orderNumber} was rejected by the seller`);
}

export function notifyAdminApproved(payload) {
  toast.success(`Order #${payload.orderNumber} approved for shipping`);
}

export function notifyAdminRejected(payload) {
  toast.error(`Order #${payload.orderNumber} was rejected by admin`);
}

export function notifyShippingUpdated(payload) {
  const status = payload.shipping?.status;
  toast(
    `Order #${payload.orderNumber} shipping update: ${status || "updated"}`,
    { icon: "📦" },
  );
}
