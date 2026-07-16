import IORedis from "ioredis";
import { Worker } from "bullmq";
import dotenv from "dotenv";
import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Task } from "./models/Task.model.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

if (!process.env.REDIS_URL) {
  console.error("❌ REDIS_URL missing in .env");
  process.exit(1);
}

console.log("👷 Worker starting...");

await mongoose.connect(process.env.MONGO_URI);
console.log("📦 Worker connected to MongoDB");

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false },
});

connection.once("ready", () => console.log("✅ Redis authenticated & ready"));
connection.on("error", (err) => console.error("❌ Redis Error:", err.message));

// 🔥 CRITICAL FIX: Worker ko force kiya ki wo file 'server/outputs' mein save kare
const outputFolder = path.resolve("../server/outputs");
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const imageWorker = new Worker(
  "image-processing-queue",
  async (job) => {
    const taskId = job?.data?.taskId;
    // 🔥 SURGICAL STRIKE: Extract dynamically selected options
    const options = job?.data?.options || {
      thumbnail: true,
      medium: true,
      large: true,
      webp: true,
    };

    console.log(`\n⚙️ Job [${job.id}] Started! Task ID:`, taskId);

    try {
      if (!taskId) throw new Error("Task ID missing in job data!");

      const task = await Task.findById(taskId);
      if (!task) throw new Error(`Task not found in DB! ID: ${taskId}`);

      const imageUrl = task.originalImage;

      // ✅ Update Progress to 10%
      if (job) await job.updateProgress(10);
      await Task.findByIdAndUpdate(taskId, {
        status: "processing",
        progress: 10,
        startedAt: new Date(),
      });
      console.log(`🔄 Task [${taskId}] marked as Processing in DB.`);

      // 🔥 UI TESTING DELAY: Live progress dekhne ke liye 2 second ka pause
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`📥 Downloading image for Job [${job.id}]...`);
      const response = await axios({
        url: imageUrl,
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data, "binary");

      console.log(`🔍 Validating file format for Job [${job.id}]...`);
      try {
        await sharp(imageBuffer).metadata();
      } catch (err) {
        throw new Error(
          "Invalid image format! Sharp cannot process this file (It might be a PDF or corrupted).",
        );
      }

      // ✅ Update Progress to 50%
      if (job) await job.updateProgress(50);
      await Task.findByIdAndUpdate(taskId, { progress: 50 });

      // 🔥 UI TESTING DELAY: Live progress dekhne ke liye 2 second ka pause
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(
        `🛠️ Processing dynamic requested versions for Job [${job.id}]...`,
      );
      const baseFileName = `job_${job.id}`;

      // 🔥 SURGICAL STRIKE: Only process options selected by user
      const promises = [];
      const outputs = {};

      if (options.thumbnail) {
        promises.push(
          sharp(imageBuffer)
            .resize(150, 150, { fit: "cover" })
            .toFile(path.join(outputFolder, `${baseFileName}_thumbnail.jpg`)),
        );
        outputs.thumbnail = `${baseFileName}_thumbnail.jpg`;
      }
      if (options.medium) {
        promises.push(
          sharp(imageBuffer)
            .resize(500)
            .toFile(path.join(outputFolder, `${baseFileName}_medium.jpg`)),
        );
        outputs.medium = `${baseFileName}_medium.jpg`;
      }
      if (options.large) {
        promises.push(
          sharp(imageBuffer)
            .resize(1000)
            .toFile(path.join(outputFolder, `${baseFileName}_large.jpg`)),
        );
        outputs.large = `${baseFileName}_large.jpg`;
      }
      if (options.webp) {
        promises.push(
          sharp(imageBuffer)
            .webp({ quality: 80 })
            .toFile(path.join(outputFolder, `${baseFileName}_optimized.webp`)),
        );
        outputs.optimized = `${baseFileName}_optimized.webp`;
      }

      await Promise.all(promises);

      console.log(`✅ Job [${job.id}] Images Processed Successfully!`);

      // ✅ Update Progress to 100%
      if (job) await job.updateProgress(100);
      await Task.findByIdAndUpdate(taskId, {
        status: "completed",
        progress: 100,
        errorDetails: null,
        outputs: outputs, // Dynamic outputs saved to DB
        completedAt: new Date(),
      });
      console.log(`✅ Task [${taskId}] marked as Completed in DB!`);

      return outputs;
    } catch (error) {
      if (job) {
        await job.updateProgress(0);
      }

      // 🔥 PHASE 9.8 DLQ LOGIC
      const maxAttempts = job?.opts?.attempts || 1;
      const attemptsMade = job?.attemptsMade || 0;

      if (attemptsMade >= maxAttempts - 1) {
        if (taskId) {
          await Task.findByIdAndUpdate(taskId, {
            status: "failed",
            errorDetails: `DLQ (Final Failure): ${error.message}`,
            progress: 0,
          });
        }
        console.error(
          `💀 DLQ: Job [${job?.id}] permanently failed after ${maxAttempts} attempts:`,
          error.message,
        );
      } else {
        console.warn(
          `⚠️ Job [${job?.id}] failed (Attempt ${attemptsMade + 1}/${maxAttempts}). Queuing for retry...`,
        );
      }

      throw error;
    }
  },
  {
    connection,
    // 🔥 PHASE 9.9: WORKER RECOVERY SETTINGS (ZOMBIE KILLER)
    lockDuration: 30000,
    stalledInterval: 30000,
    maxStalledCount: 2,
  },
);

imageWorker.once("ready", () => {
  console.log("🚀 Worker ready and waiting for jobs...");
});

// 🔥 PHASE 9.9: ZOMBIE LISTENER
imageWorker.on("stalled", (jobId) => {
  console.warn(
    `🧟‍♂️ ZOMBIE DETECTED: Job [${jobId}] stalled (Worker crashed). Recovering it back to queue...`,
  );
});
