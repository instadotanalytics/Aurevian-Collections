import { useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext.jsx";
import { ORDER_EVENTS } from "../socket/socketEvents.js";
import { playNotificationSound } from "../utils/notificationSound.js"; // ✅ NEW

export default function useOrderSocketEvents(handlers = {}) {
  const { socket } = useSocket();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const seenRef = useRef(new Map());

  useEffect(() => {
    if (!socket) return;

    const isDup = (event, payload) => {
      const key = `${event}:${payload?.orderId}:${payload?.updatedAt || payload?.createdAt || ""}`;
      const now = Date.now();
      for (const [k, ts] of seenRef.current) {
        if (now - ts > 15000) seenRef.current.delete(k);
      }
      if (seenRef.current.has(key)) return true;
      seenRef.current.set(key, now);
      return false;
    };

    const makeListener = (event, key) => (payload) => {
      console.log(`📥 [SOCKET RECEIVED] event=${event}`, payload);

      const handler = handlersRef.current[key];
      if (!handler) return;

      if (isDup(event, payload)) {
        console.log(`⏭️ [SOCKET DEDUPE] skipped duplicate event=${event}`);
        return;
      }

      // ✅ NEW — fires exactly once per genuinely new event, only for
      // events a consumer actually cares about (handler exists) and only
      // past the dedupe gate (so one event = one sound, always).
      console.log("🔔 [NOTIFICATION] New real-time notification received");
      console.log("🔊 [NOTIFICATION] Playing notification sound");
      playNotificationSound();

      try {
        handler(payload);
      } catch (err) {
        console.error(`❌ Error handling ${event}:`, err);
      }
    };

    const bindings = [
      [ORDER_EVENTS.ORDER_CREATED, "onOrderCreated"],
      [ORDER_EVENTS.ORDER_SELLER_CONFIRMED, "onSellerConfirmed"],
      [ORDER_EVENTS.ORDER_SELLER_REJECTED, "onSellerRejected"],
      [ORDER_EVENTS.ORDER_SUPERADMIN_CONFIRMED, "onAdminConfirmed"],
      [ORDER_EVENTS.ORDER_SUPERADMIN_REJECTED, "onAdminRejected"],
      [ORDER_EVENTS.ORDER_SHIPPING_UPDATED, "onShippingUpdated"],
      [ORDER_EVENTS.ORDER_STATUS_UPDATED, "onStatusUpdated"],
    ];

    const listeners = bindings.map(([event, key]) => [
      event,
      makeListener(event, key),
    ]);

    listeners.forEach(([event, fn]) => socket.on(event, fn));
    return () => listeners.forEach(([event, fn]) => socket.off(event, fn));
  }, [socket]);
}
