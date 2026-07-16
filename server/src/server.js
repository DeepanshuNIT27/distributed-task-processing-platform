import "dotenv/config";

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

import { setIO } from "./sockets/socket.instance.js";
import { setupQueueEvents } from "./events/queue.events.js";

import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js"; // 🔥 Naya import add kiya

const app = express();
const server = http.createServer(app);

// Connect MongoDB
await connectDB();

// --- Middlewares ---
app.use(cors());
// 🔥 SURGICAL STRIKE: Payload size limit badha di (10MB) taaki Base64 image easily pass ho sake
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 🔥 CRITICAL FIX: In folders ko public kiya taaki Worker image download kar sake aur Frontend unhe dekh sake!
// 🔥 CRITICAL FIX: Express ko exact "src/uploads" ka rasta de diya
app.use("/uploads", express.static("src/uploads"));
app.use("/outputs", express.static("outputs"));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setIO(io);

// Socket Rooms
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("join-task-room", (taskId) => {
    if (!taskId) return;

    socket.join(taskId);
    console.log(`📡 Client ${socket.id} joined room: ${taskId}`);
  });

  socket.on("leave-task-room", (taskId) => {
    if (!taskId) return;

    socket.leave(taskId);
  });
});

// Start BullMQ → Socket bridge
setupQueueEvents();

// API Routes
app.use("/api/auth", authRoutes); // 🔥 Naya auth route mount kiya
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
