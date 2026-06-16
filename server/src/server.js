import express from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/task.routes.js";
import { initSocket } from "./sockets/task.socket.js";
import { setupQueueEvents } from "./queues/queue.events.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(express.json());

const staticUploadsPath = path.join(process.cwd(), "src/uploads");
app.use("/uploads", express.static(staticUploadsPath));

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: `TaskFlow API running on Port ${PORT}` });
});

app.use("/api", taskRoutes);

// 🔥 FIX: Safer Boot Order. Start the server first, then try connecting to background events.
connectDB()
  .then(() => {
    initSocket(server);

    // 1. API and Sockets are alive NOW
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // 2. Connect to Redis Queue Events independently in the background
    setupQueueEvents().catch((err) => {
      console.error(
        "⚠️ Non-Fatal: Failed to connect to background queue events.",
        err.message,
      );
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed. Server boot aborted.", err.message);
    process.exit(1);
  });
