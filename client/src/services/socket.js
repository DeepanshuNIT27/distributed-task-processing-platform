import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // Strict control over connection
  reconnection: true, // ⚡ SDE Polish: Auto-reconnect on drop
  reconnectionAttempts: 5, // ⚡ SDE Polish: Max 5 retries to prevent memory leaks
});
