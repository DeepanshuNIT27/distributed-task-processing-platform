import { QueueEvents } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { getIO } from "../sockets/task.socket.js";

dotenv.config();

// 🔥 STRICT ENV USAGE: No hardcoding!
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false }, // Keeping your strict TLS as requested
});

export const setupQueueEvents = async () => {
  try {
    // 🔥 ENV Variables for config
    const queueName = process.env.QUEUE_NAME;
    const timeoutMs = parseInt(process.env.QUEUE_READY_TIMEOUT, 10) || 10000;

    if (!queueName) {
      throw new Error("QUEUE_NAME is missing in .env!");
    }

    const queueEvents = new QueueEvents(queueName, { connection });

    // Added a timeout so it doesn't freeze the entire server boot process if Redis is down
    await Promise.race([
      queueEvents.waitUntilReady(),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(`Queue Events Ready Timeout after ${timeoutMs}ms`),
            ),
          timeoutMs,
        ),
      ),
    ]);

    console.log("🎧 Queue Events listener initialized on Server.");

    // 🔥 FIX: Emitting strictly to specific Task Rooms matching Frontend event names
    const emitToRoom = (taskId, eventName, payload) => {
      if (!taskId) return;
      const io = getIO();
      if (!io) return;

      io.to(taskId).emit(eventName, {
        taskId,
        ...payload,
        timestamp: new Date().toISOString(),
      });
    };

    queueEvents.on("active", ({ jobId }) => {
      emitToRoom(jobId, "TASK_PROCESSING", {
        status: "processing",
        progress: 0,
      });
    });

    queueEvents.on("progress", ({ jobId, data }) => {
      emitToRoom(jobId, "TASK_PROGRESS", {
        status: "processing",
        progress: data,
      });
    });

    queueEvents.on("completed", ({ jobId, returnvalue }) => {
      // returnvalue contains the outputs object from the worker
      emitToRoom(jobId, "TASK_COMPLETED", {
        status: "completed",
        progress: 100,
        outputs: returnvalue,
      });
    });

    queueEvents.on("failed", ({ jobId, failedReason }) => {
      emitToRoom(jobId, "TASK_FAILED", {
        status: "failed",
        error: failedReason || "Unknown error",
      });
    });
  } catch (error) {
    // Catch block ensures that even if this fails, the server doesn't crash
    console.error(
      "❌ Queue Events Setup Failed (Check Redis URL):",
      error.message,
    );
  }
};
