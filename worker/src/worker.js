import IORedis from "ioredis";
import { Worker } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

console.log("👷 Worker starting...");

if (!process.env.REDIS_URL) {
  console.error("❌ REDIS_URL missing in .env");
  process.exit(1);
}

/**
 * ✅ STABLE REDIS CONNECTION (Upstash Safe)
 * - TLS required
 * - IPv4 forced
 * - prevents ECONNRESET + reconnect loops
 */
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Redis connection events (clean logging)
 */
connection.on("connect", () => {
  console.log("🔗 Redis TCP connected");
});

connection.on("ready", () => {
  console.log("✅ Redis authenticated & ready");
});

connection.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

/**
 * BullMQ Worker (Consumer)
 */
const imageWorker = new Worker(
  "image-processing-queue",
  async (job) => {
    console.log("⚙️ Job received:", job.id, job.data);
  },
  { connection },
);

imageWorker.on("ready", () => {
  console.log("🚀 Worker ready and waiting for jobs...");
});

imageWorker.on("error", (err) => {
  console.error("❌ Worker error:", err.message);
});
