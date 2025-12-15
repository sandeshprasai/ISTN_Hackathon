// frontend/services/sockets.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== "undefined") {
    const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    socket = io(SOCKET_URL, {
      path: "/socket.io/",
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket!.id);
      console.log("Server URL:", SOCKET_URL);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      console.error("Error object:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket!.connect();
      }
    });

    socket.on("registered", (data) => {
      console.log("Registration response:", data);
    });
  }

  return socket!;
};

// Test function
export const testSocket = () => {
  const s = getSocket();
  console.log("Testing socket connection...");
  console.log("Socket connected:", s.connected);
  console.log("Socket ID:", s.id);

  s.emit("ping", { test: "Hello from frontend" });
  s.on("pong", (data) => {
    console.log("Pong received:", data);
  });
};

export default socket;