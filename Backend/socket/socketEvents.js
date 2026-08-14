// backend/socket/socketEvents.js
// Centralized event names + room-name builders. Nothing outside this file
// should hardcode an event string or a room string.

export const ORDER_EVENTS = {
  ORDER_CREATED: "order:created",
  ORDER_SELLER_CONFIRMED: "order:seller_confirmed",
  ORDER_SELLER_REJECTED: "order:seller_rejected",
  ORDER_SUPERADMIN_CONFIRMED: "order:superadmin_confirmed",
  ORDER_SUPERADMIN_REJECTED: "order:superadmin_rejected",
  ORDER_SHIPPING_UPDATED: "order:shipping_updated",
  ORDER_STATUS_UPDATED: "order:status_updated",
};

export const ROOMS = {
  user: (userId) => `user:${userId}`,
  seller: (sellerId) => `seller:${sellerId}`,
  adminSuperadmin: "admin:superadmin",
  order: (orderId) => `order:${orderId}`,
};
