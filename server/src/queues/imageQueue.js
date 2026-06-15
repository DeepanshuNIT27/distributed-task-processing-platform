import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// SAME EXACT CONFIG AS WORKER (Prevents silent fail)
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false },
});

export const imageQueue = new Queue("image-processing-queue", { connection });
console.log("📦 BullMQ Producer Queue initialized on Server.");
