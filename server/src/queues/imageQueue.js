import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// 🔥 FIXED: Strictly matched with Worker's TLS to prevent Upstash ECONNRESET
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  family: 4,
  tls: { rejectUnauthorized: false },
});

// 🔥 Added Error Handler taaki server loop mein crash na ho
connection.on("error", (err) => {
  console.error("❌ Producer Queue Redis Error:", err.message);
});

// Keep Redis history bounded and let users explicitly retry failed demo jobs.
const queueName = process.env.QUEUE_NAME || "image-processing-queue";

export const imageQueue = new Queue(queueName, {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: {
      age: 3600,
      count: 20,
    },
    removeOnFail: {
      age: 86400,
      count: 20,
    },
  },
});

console.log("📦 BullMQ Producer Queue initialized on Server.");

export const closeImageQueue = async () => {
  await imageQueue.close();

  if (connection.status !== "end") {
    await connection.quit();
  }
};
