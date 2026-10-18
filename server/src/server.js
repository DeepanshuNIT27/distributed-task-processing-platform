import "dotenv/config";

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";

import { setIO } from "./sockets/socket.instance.js";
import { closeImageQueue } from "./queues/imageQueue.js";

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

// Temporary backwards compatibility for tasks created before Cloudinary storage.
// New uploads and outputs are served directly from Cloudinary.
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

// API Routes
app.use("/api/auth", authRoutes); // 🔥 Naya auth route mount kiya
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} received. Closing API resources...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  try {
    await new Promise((resolve) => io.close(resolve));
    await closeImageQueue();
    await mongoose.disconnect();
    console.log("✅ API resources closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ API shutdown failed:", error.message);
    process.exit(1);
  }
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
