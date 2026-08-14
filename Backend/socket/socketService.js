// backend/socket/socketService.js
// Owns the Socket.IO server instance, room auto-join on connect, the
// backend-verified order:subscribe handshake, and every low-level emit
// helper. Emits NEVER throw — a socket failure must never break the REST
// request that triggered it.

import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import { socketAuthMiddleware } from "./socketAuth.js";
import { ROOMS } from "./socketEvents.js";
import Order from "../models/Order.js";

let io = null;

// ============================================
// Can this connected socket join order:{orderId}? Verified server-side —
// never trust a client-declared orderId as authorization by itself.
// ============================================
async function canAccessOrder(socket, orderId) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) return false;

  const order = await Order.findById(orderId).select(
    "user seller items.seller",
  );
  if (!order) return false;

  if (socket.data.role === "super_admin") return true;

  if (socket.data.role === "user") {
    return order.user?.toString() === socket.data.userId;
  }

  if (socket.data.role === "seller") {
    const ownsItem =
      (order.seller && order.seller.toString() === socket.data.sellerId) ||
      order.items?.some(
        (i) => i.seller && i.seller.toString() === socket.data.sellerId,
      );
    return !!ownsItem;
  }

  return false;
}

export function initSocket(httpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const { role, userId, sellerId, isSuperAdmin, tokenExp } = socket.data;

    console.log(
      `🔌 [${role.toUpperCase()} SOCKET] connected — socket=${socket.id} userId=${userId || "-"} sellerId=${sellerId || "-"}`,
    );

    // ✅ Auto-join identity room — this is what makes "user should only
    // receive their own events" / "seller only their own account" true.
    if (role === "user") {
      socket.join(ROOMS.user(userId));
      console.log(`🏠 [USER SOCKET] joined room=${ROOMS.user(userId)}`);
    } else if (role === "seller") {
      socket.join(ROOMS.seller(sellerId));
      console.log(`🏠 [SELLER SOCKET] joined room=${ROOMS.seller(sellerId)}`);
    } else if (role === "super_admin" || isSuperAdmin) {
      socket.join(ROOMS.adminSuperadmin);
      console.log(`🏠 [ADMIN SOCKET] joined room=${ROOMS.adminSuperadmin}`);
    }

    // ✅ TEMP DEBUG — echoes back what this socket actually joined, so the
    // browser console can independently confirm room membership. Remove
    // once the pipeline is confirmed working end-to-end.
    socket.emit("identity:ack", {
      role,
      userId,
      sellerId,
      isSuperAdmin,
      rooms: Array.from(socket.rooms),
    });

    // ✅ Force-expire the socket in sync with the JWT's own expiry (15 min
    // access tokens) so a stale token can never keep receiving events.
    // Client auto-reconnects with a fresh token — see SocketContext.jsx.
    if (tokenExp) {
      const msUntilExpiry = tokenExp * 1000 - Date.now() - 5000; // 5s margin
      if (msUntilExpiry > 0) {
        const expiryTimer = setTimeout(() => {
          socket.disconnect(true);
        }, msUntilExpiry);
        socket.on("disconnect", () => clearTimeout(expiryTimer));
      }
    }

    // ============================================
    // ORDER ROOM SUBSCRIPTION
    // ============================================
    socket.on("order:subscribe", async (payload, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        const orderId = payload?.orderId;
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
          return ack({ success: false, message: "Invalid order ID" });
        }
        const allowed = await canAccessOrder(socket, orderId);
        if (!allowed) {
          return ack({
            success: false,
            message: "Not authorized for this order",
          });
        }
        socket.join(ROOMS.order(orderId));
        ack({ success: true });
      } catch (error) {
        console.error("❌ order:subscribe error:", error.message);
        ack({ success: false, message: "Subscription failed" });
      }
    });

    socket.on("order:unsubscribe", (payload) => {
      const orderId = payload?.orderId;
      if (orderId) socket.leave(ROOMS.order(orderId));
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} — reason=${reason}`);
    });

    socket.on("error", (err) => {
      console.error("❌ Socket error:", socket.id, err?.message);
    });
  });

  io.engine.on("connection_error", (err) => {
    console.error("❌ Socket.IO connection_error:", err.message);
  });

  console.log("✅ Socket.IO initialized");
  return io;
}

export function getIO() {
  return io;
}

// ============================================
// LOW-LEVEL EMIT HELPERS
// ============================================
function safeEmit(room, event, payload) {
  try {
    if (!io) {
      console.warn("⚠️ Socket.IO not initialized — skipping emit", event);
      return;
    }
    // ✅ TEMP DEBUG — remove once confirmed working
    const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    console.log(`📢 [SOCKET EMIT] event=${event}`);
    console.log(
      `🎯 [SOCKET TARGET] room=${room} (sockets currently in room: ${roomSize})`,
    );
    console.log(
      `📦 [SOCKET PAYLOAD] orderId=${payload?.orderId} orderNumber=${payload?.orderNumber}`,
    );
    if (roomSize === 0) {
      console.warn(
        `⚠️ [SOCKET EMIT] Nobody is in room "${room}" right now — event will be dropped silently. This is normal if that user/seller/admin is offline.`,
      );
    }
    io.to(room).emit(event, payload);
  } catch (error) {
    console.error(`❌ Socket emit failed [${event} → ${room}]:`, error.message);
  }
}

export function emitToUser(userId, event, payload) {
  if (!userId) return;
  safeEmit(ROOMS.user(userId), event, payload);
}

export function emitToSeller(sellerId, event, payload) {
  if (!sellerId) return;
  safeEmit(ROOMS.seller(sellerId), event, payload);
}

export function emitToAdmin(event, payload) {
  safeEmit(ROOMS.adminSuperadmin, event, payload);
}

export function emitToOrder(orderId, event, payload) {
  if (!orderId) return;
  safeEmit(ROOMS.order(orderId), event, payload);
}
