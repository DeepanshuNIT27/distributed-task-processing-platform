import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// 🔥 FIXED: Strictly matched with Worker's TLS to prevent Upstash ECONNRESET
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false },
});

// 🔥 Added Error Handler taaki server loop mein crash na ho
connection.on("error", (err) => {
  console.error("❌ Producer Queue Redis Error:", err.message);
});

// 🔥 Phase 9.2: Added Default Job Options for Auto-Retry & Exponential Backoff
export const imageQueue = new Queue("image-processing-queue", {
  connection,
  defaultJobOptions: {
    attempts: 3, // Agar fail hua toh total 3 baar try karega
    backoff: {
      type: "exponential",
      delay: 2000, // Pehla retry 2 sec baad, agla 4 sec baad
    },
  },
});

console.log("📦 BullMQ Producer Queue initialized on Server.");
