// src/socket/socket.js
// One socket instance for the whole app (per the spec: ONE authenticated
// connection per browser session). Never trust a stale token — the `auth`
// callback re-reads localStorage every single time the client (re)connects.

import { io } from "socket.io-client";
import { API_URL } from "../utils/constants.js";

// API_URL is something like ".../api" — the Socket.IO server listens on
// the same host/port as Express (see backend/index.js), just without /api.
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

function getActiveToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("sellerAccessToken") ||
    localStorage.getItem("superAdminToken") ||
    null
  );
}

let socket = null;

export function getSocket() {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    auth: (cb) => cb({ token: getActiveToken() }),
  });

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = getActiveToken();
  if (!token) return s; // nothing to authenticate with — stay disconnected
  s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}

// Called when the server force-disconnects us (token-expiry timer, or a
// server restart) — reconnects with whatever token is currently stored.
export function reconnectSocketWithFreshToken() {
  const s = getSocket();
  const token = getActiveToken();
  if (!token) return;
  s.auth = { token };
  if (!s.connected) s.connect();
}
