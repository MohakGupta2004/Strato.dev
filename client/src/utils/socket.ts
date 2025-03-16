import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

/** ✅ Initialize socket connection */
export const initializeSocket = (projectId: string) => {
  if (socketInstance) return socketInstance; // Avoid multiple connections

  const token = localStorage.getItem("token");
  console.log("🔍 Token before sending:", token);

  socketInstance = io(import.meta.env.VITE_API, {
    transports: ["websocket"], // ✅ Force WebSocket only
    withCredentials: true, // ✅ Ensure credentials are sent
    auth: { token: token ? `Bearer ${token}` : null },
    query: { projectId },
    reconnection: true, // ✅ Enable auto-reconnection
    reconnectionAttempts: 5, // ✅ Retry 5 times before giving up
    reconnectionDelay: 2000, // ✅ Wait 2s before trying again
  });

  socketInstance.on("connect", () => {
    console.log("✅ WebSocket Connected:", socketInstance?.id);
  });

  socketInstance.on("disconnect", (reason) => {
    console.warn("⚠️ WebSocket Disconnected:", reason);
  });

  return socketInstance;
};

/** ✅ Receive messages */
export const receiveMessage = (eventName: string, cb: (data: { message: string; sender: string; name: string }) => void) => {
  if (!socketInstance) {
    console.warn("⚠️ No active socket connection.");
    return;
  }
  socketInstance.on(eventName, cb);
};

/** ✅ Send messages */
export const sendMessage = (eventName: string, data: { message: string; sender: string }) => {
  if (!socketInstance) {
    console.warn("⚠️ Cannot send message, socket not initialized.");
    return;
  }
  socketInstance.emit(eventName, data);
};

/** ✅ Disconnect socket (Cleanup) */
export const disconnectSocket = () => {
  if (socketInstance) {
    console.log("🔌 Disconnecting socket...");
    socketInstance.disconnect();
    socketInstance = null;
  }
};
