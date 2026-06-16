import { QueueEvents } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { getIO } from "../sockets/task.socket.js";

dotenv.config();

// 🔥 FIX: Reverted to strictly using TLS because Upstash requires it to prevent ECONNRESET
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false },
});

export const setupQueueEvents = async () => {
  try {
    const queueEvents = new QueueEvents("image-processing-queue", {
      connection,
    });

    // 🔥 FIX: Added a timeout so it doesn't freeze the entire server boot process if Redis is down
    await Promise.race([
      queueEvents.waitUntilReady(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Queue Events Ready Timeout")),
          10000,
        ),
      ),
    ]);

    console.log("🎧 Queue Events listener initialized on Server.");

    queueEvents.on("progress", ({ jobId, data }) => {
      const io = getIO();
      io.emit("task:progress", { taskId: jobId, progress: data });
    });

    queueEvents.on("completed", ({ jobId }) => {
      const io = getIO();
      io.emit("task:completed", { taskId: jobId });
    });

    queueEvents.on("failed", ({ jobId, failedReason }) => {
      const io = getIO();
      io.emit("task:failed", {
        taskId: jobId,
        error: failedReason || "Unknown error",
      });
    });
  } catch (error) {
    // 🔥 FIX: Catch block ensures that even if this fails, the server doesn't crash
    console.error(
      "❌ Queue Events Setup Failed (Check Redis URL):",
      error.message,
    );
  }
};
