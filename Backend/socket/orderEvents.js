// backend/socket/orderEvents.js
// High-level, business-shaped emit functions. This is the ONLY place that
// decides what goes into an order-related payload — controllers just call
// these one-liners. Every payload is deliberately minimal (no shipping
// address, no razorpay signature, no full customer PII).

import { ORDER_EVENTS } from "./socketEvents.js";
import {
  emitToUser,
  emitToSeller,
  emitToAdmin,
  emitToOrder,
} from "./socketService.js";

const baseOrderPayload = (order) => ({
  orderId: order._id.toString(),
  orderNumber: order.orderNumber,
  sellerId: order.seller ? order.seller.toString() : null,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  fulfillmentStatus: order.fulfillmentStatus,
  totalAmount: order.totalAmount,
  updatedAt: order.updatedAt,
});

export function emitOrderCreated(order) {
  try {
    console.log(
      `🧾 [ORDER CREATED] orderId=${order._id} orderNumber=${order.orderNumber} seller=${order.seller}`,
    );

    const sellerPayload = {
      ...baseOrderPayload(order),
      customerName: order.customerName,
      items: order.items.map((i) => ({
        name: i.name,
        image: i.image,
        quantity: i.quantity,
        subtotal: i.subtotal,
      })),
      itemsTotal: order.itemsTotal,
      shippingFee: order.shippingFee,
      createdAt: order.createdAt,
    };
    emitToSeller(order.seller, ORDER_EVENTS.ORDER_CREATED, sellerPayload);

    // ✅ NEW — per updated spec: super admin should also see a new order
    // land in real time, not just when the seller confirms it. Same event
    // name, admin room, no PII beyond what the seller payload already has.
    emitToAdmin(ORDER_EVENTS.ORDER_CREATED, sellerPayload);
  } catch (error) {
    console.error("❌ emitOrderCreated failed:", error.message);
  }
}

export function emitSellerConfirmed(order) {
  try {
    const payload = baseOrderPayload(order);
    emitToUser(order.user, ORDER_EVENTS.ORDER_SELLER_CONFIRMED, payload);
    emitToOrder(order._id, ORDER_EVENTS.ORDER_SELLER_CONFIRMED, payload);
    emitToAdmin(ORDER_EVENTS.ORDER_SELLER_CONFIRMED, {
      ...payload,
      customerName: order.customerName,
    });
  } catch (error) {
    console.error("❌ emitSellerConfirmed failed:", error.message);
  }
}

export function emitSellerRejected(order) {
  try {
    const payload = {
      ...baseOrderPayload(order),
      reason: order.sellerRejectionReason,
    };
    emitToUser(order.user, ORDER_EVENTS.ORDER_SELLER_REJECTED, payload);
    emitToOrder(order._id, ORDER_EVENTS.ORDER_SELLER_REJECTED, payload);
    emitToAdmin(ORDER_EVENTS.ORDER_SELLER_REJECTED, {
      ...payload,
      customerName: order.customerName,
    });
  } catch (error) {
    console.error("❌ emitSellerRejected failed:", error.message);
  }
}

export function emitAdminApproved(order) {
  try {
    const payload = baseOrderPayload(order);
    emitToUser(order.user, ORDER_EVENTS.ORDER_SUPERADMIN_CONFIRMED, payload);
    emitToSeller(
      order.seller,
      ORDER_EVENTS.ORDER_SUPERADMIN_CONFIRMED,
      payload,
    );
    emitToOrder(order._id, ORDER_EVENTS.ORDER_SUPERADMIN_CONFIRMED, payload);
  } catch (error) {
    console.error("❌ emitAdminApproved failed:", error.message);
  }
}

export function emitAdminRejected(order) {
  try {
    const payload = {
      ...baseOrderPayload(order),
      reason: order.adminRejectionReason,
    };
    emitToUser(order.user, ORDER_EVENTS.ORDER_SUPERADMIN_REJECTED, payload);
    emitToSeller(order.seller, ORDER_EVENTS.ORDER_SUPERADMIN_REJECTED, payload);
    emitToOrder(order._id, ORDER_EVENTS.ORDER_SUPERADMIN_REJECTED, payload);
  } catch (error) {
    console.error("❌ emitAdminRejected failed:", error.message);
  }
}

export function emitShippingUpdated(order) {
  try {
    const payload = {
      ...baseOrderPayload(order),
      shipping: {
        status: order.shipping?.status || null,
        courierName: order.shipping?.courierName || null,
        awbCode: order.shipping?.awbCode || null,
        trackingUrl: order.shipping?.trackingUrl || null,
        estimatedDeliveryDate: order.shipping?.estimatedDeliveryDate || null,
        shippedAt: order.shipping?.shippedAt || null,
        deliveredAt: order.shipping?.deliveredAt || null,
      },
    };
    emitToUser(order.user, ORDER_EVENTS.ORDER_SHIPPING_UPDATED, payload);
    emitToSeller(order.seller, ORDER_EVENTS.ORDER_SHIPPING_UPDATED, payload);
    emitToOrder(order._id, ORDER_EVENTS.ORDER_SHIPPING_UPDATED, payload);
    emitToAdmin(ORDER_EVENTS.ORDER_SHIPPING_UPDATED, payload);
  } catch (error) {
    console.error("❌ emitShippingUpdated failed:", error.message);
  }
}

export function emitOrderStatusUpdated(order) {
  try {
    const payload = baseOrderPayload(order);
    emitToUser(order.user, ORDER_EVENTS.ORDER_STATUS_UPDATED, payload);
    emitToSeller(order.seller, ORDER_EVENTS.ORDER_STATUS_UPDATED, payload);
    emitToOrder(order._id, ORDER_EVENTS.ORDER_STATUS_UPDATED, payload);
    emitToAdmin(ORDER_EVENTS.ORDER_STATUS_UPDATED, payload);
  } catch (error) {
    console.error("❌ emitOrderStatusUpdated failed:", error.message);
  }
}
