import IORedis from "ioredis";
import { Worker } from "bullmq";
import dotenv from "dotenv";
import axios from "axios";
import sharp from "sharp";
import mongoose from "mongoose";
import { Task } from "./models/Task.model.js";
import {
  deleteCloudinaryImage,
  uploadImageBuffer,
} from "./config/cloudinary.js";

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

const queueName = process.env.QUEUE_NAME || "image-processing-queue";

connection.once("ready", () => console.log("✅ Redis authenticated & ready"));
connection.on("error", (err) => console.error("❌ Redis Error:", err.message));

const imageWorker = new Worker(
  queueName,
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

      await Task.findByIdAndUpdate(taskId, { progress: 50 });

      // 🔥 UI TESTING DELAY: Live progress dekhne ke liye 2 second ka pause
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(
        `🛠️ Processing dynamic requested versions for Job [${job.id}]...`,
      );
      const basePublicId = `users/${task.user}/tasks/${taskId}/outputs`;
      const outputs = {};
      const outputAssets = {};
      const generatedImages = [];

      if (options.thumbnail) {
        generatedImages.push({
          key: "thumbnail",
          publicId: `${basePublicId}/thumbnail`,
          bufferPromise: sharp(imageBuffer)
            .resize(150, 150, { fit: "cover" })
            .jpeg({ quality: 82 })
            .toBuffer(),
        });
      }
      if (options.medium) {
        generatedImages.push({
          key: "medium",
          publicId: `${basePublicId}/medium`,
          bufferPromise: sharp(imageBuffer)
            .resize(500)
            .jpeg({ quality: 85 })
            .toBuffer(),
        });
      }
      if (options.large) {
        generatedImages.push({
          key: "large",
          publicId: `${basePublicId}/large`,
          bufferPromise: sharp(imageBuffer)
            .resize(1000)
            .jpeg({ quality: 88 })
            .toBuffer(),
        });
      }
      if (options.webp) {
        generatedImages.push({
          key: "optimized",
          publicId: `${basePublicId}/optimized`,
          bufferPromise: sharp(imageBuffer).webp({ quality: 80 }).toBuffer(),
        });
      }

      const generatedBuffers = await Promise.all(
        generatedImages.map(async (image) => ({
          ...image,
          buffer: await image.bufferPromise,
        })),
      );

      const uploadedPublicIds = [];
      try {
        for (const image of generatedBuffers) {
          const uploaded = await uploadImageBuffer(image.buffer, {
            public_id: image.publicId,
          });
          uploadedPublicIds.push(uploaded.public_id);
          outputs[image.key] = uploaded.secure_url;
          outputAssets[image.key] = {
            publicId: uploaded.public_id,
            assetId: uploaded.asset_id,
            secureUrl: uploaded.secure_url,
            format: uploaded.format,
            bytes: uploaded.bytes,
            width: uploaded.width,
            height: uploaded.height,
          };
        }
      } catch (uploadError) {
        await Promise.allSettled(
          uploadedPublicIds.map((publicId) => deleteCloudinaryImage(publicId)),
        );
        throw uploadError;
      }

      console.log(`✅ Job [${job.id}] Images Processed Successfully!`);

      await Task.findByIdAndUpdate(taskId, {
        status: "completed",
        progress: 100,
        errorDetails: null,
        outputs: outputs, // Dynamic outputs saved to DB
        outputAssets,
        completedAt: new Date(),
      });
      console.log(`✅ Task [${taskId}] marked as Completed in DB!`);

      return outputs;
    } catch (error) {
      // 🔥 PHASE 9.8 DLQ LOGIC
      const maxAttempts = job?.opts?.attempts || 1;
      const attemptsMade = job?.attemptsMade || 0;

      if (attemptsMade >= maxAttempts) {
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
    concurrency: 1,
    drainDelay: 60,
    lockDuration: 120000,
    stalledInterval: 300000,
    maxStalledCount: 1,
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

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} received. Closing worker resources...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Worker shutdown timed out.");
    process.exit(1);
  }, 30000);
  forceExitTimer.unref();

  try {
    await imageWorker.close();

    if (connection.status !== "end") {
      await connection.quit();
    }

    await mongoose.disconnect();
    console.log("✅ Worker resources closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Worker shutdown failed:", error.message);
    process.exit(1);
  }
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
