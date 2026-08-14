// src/hooks/useOrderRoom.js
import { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext.jsx";

// Joins order:{orderId} for the component's lifetime, after the backend
// verifies the connected user actually owns/has access to this order.
// Safe no-op if the socket isn't connected — REST data still loads fine.
export default function useOrderRoom(orderId) {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !connected || !orderId) return;

    socket.emit("order:subscribe", { orderId }, (ack) => {
      if (!ack?.success) {
        console.warn(
          "⚠️ Could not subscribe to live order updates:",
          ack?.message,
        );
      }
    });

    return () => {
      socket.emit("order:unsubscribe", { orderId });
    };
  }, [socket, connected, orderId]);
}
