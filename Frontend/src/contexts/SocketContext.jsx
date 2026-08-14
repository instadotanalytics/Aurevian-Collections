import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  reconnectSocketWithFreshToken,
} from "../socket/socket.js";
import { unlockAudioContext } from "../utils/notificationSound.js"; // ✅ NEW

const SocketContext = createContext({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(getSocket());

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isAuthenticated: isSeller } = useSelector((state) => state.seller);
  const { isAuthenticated: isSuperAdmin } = useSelector(
    (state) => state.superAdmin,
  );

  const anyLoggedIn = isAuthenticated || isSeller || isSuperAdmin;

  // ✅ NEW — unlock the audio context on the very first real user gesture
  // anywhere in the app (click, tap, or keydown). Runs once, then removes
  // itself. This is what makes notification sounds work without ever
  // asking the user to click a "Play Sound" button.
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudioContext();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;

    const handleConnect = () => setConnected(true);

    const handleDisconnect = (reason) => {
      setConnected(false);
      if (reason === "io server disconnect") {
        reconnectSocketWithFreshToken();
      }
    };

    const handleConnectError = (err) => {
      setConnected(false);
      console.warn("⚠️ Socket connection issue:", err.message);
    };

    const handleIdentityAck = (data) => {
      console.log(
        `✅ [SOCKET IDENTITY] role=${data.role} rooms=${data.rooms.join(", ")}`,
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("identity:ack", handleIdentityAck);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("identity:ack", handleIdentityAck);
    };
  }, []);

  useEffect(() => {
    if (anyLoggedIn) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [anyLoggedIn]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
