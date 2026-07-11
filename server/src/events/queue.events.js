import { QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { getIO } from "../sockets/socket.instance.js";

// 🔥 FIX 1: Connection function ke BAHAR rakha hai (Singleton Pattern).
// Ab sirf ek baar connect hoga, chahe kuch bhi ho jaye.
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false }, // 🔥 FIX 2: Strict worker-level TLS config
});

// Debug Logs
connection.on("connect", () => console.log("✅ QueueEvents Redis connected"));
connection.on("error", (err) =>
  console.error("❌ QueueEvents Redis error:", err.message),
);
connection.on("close", () =>
  console.log("⚠️ QueueEvents Redis connection closed"),
);
connection.on("reconnecting", () =>
  console.log("🔄 QueueEvents Redis reconnecting..."),
);

// 🔥 FIX 3: QueueEvents instance bhi function ke bahar rakha hai
const queueEvents = new QueueEvents("image-processing-queue", { connection });

export const setupQueueEvents = () => {
  // Helper for consistent emitting
  const emitToRoom = (taskId, eventName, payload) => {
    if (!taskId) return; // 🛡️ Guard
    const io = getIO();
    if (!io) return;

    const eventData = {
      taskId,
      ...payload,
      timestamp: new Date().toISOString(),
    };

    // 1. Specific Room ke liye (For TaskDetails page)
    io.to(taskId).emit(eventName, eventData);

    // 🔥 2. NEW: Global broadcast (For Dashboard live updates)
    io.emit("GLOBAL_TASK_UPDATE", eventData);
  };

  // 🔥 FIX 4: Prevent duplicate listeners agar function 2 baar call ho jaye
  if (queueEvents.listenerCount("active") === 0) {
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
      emitToRoom(jobId, "TASK_COMPLETED", {
        status: "completed",
        progress: 100,
        outputs: returnvalue,
      });
    });

    queueEvents.on("failed", ({ jobId, failedReason }) => {
      emitToRoom(jobId, "TASK_FAILED", {
        status: "failed",
        error: failedReason,
      });
    });

    console.log("🌉 BullMQ-to-Socket Bridge Initialized");
  }
};
