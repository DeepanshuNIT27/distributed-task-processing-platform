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

const outputFolder = path.resolve("outputs");
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const imageWorker = new Worker(
  "image-processing-queue",
  async (job) => {
    const taskId = job?.data?.taskId;
    console.log(`\n⚙️ Job [${job.id}] Started! Task ID:`, taskId);

    try {
      if (!taskId) throw new Error("Task ID missing in job data!");

      const task = await Task.findById(taskId);
      if (!task) throw new Error(`Task not found in DB! ID: ${taskId}`);

      const imageUrl = task.originalImage;

      // ✅ FIX: Progress to 10%
      if (job) await job.updateProgress(10);
      await Task.findByIdAndUpdate(taskId, {
        status: "processing",
        progress: 10,
        startedAt: new Date(),
      });
      console.log(`🔄 Task [${taskId}] marked as Processing in DB.`);

      console.log(`📥 Downloading image for Job [${job.id}]...`);
      const response = await axios({
        url: imageUrl,
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data, "binary");

      // 🔥 Added for 7.4: Intermediate progress for smoother real-time UI
      if (job) await job.updateProgress(50);
      await Task.findByIdAndUpdate(taskId, { progress: 50 });

      console.log(`🛠️ Processing 4 optimized versions for Job [${job.id}]...`);
      const baseFileName = `job_${job.id}`;

      await Promise.all([
        sharp(imageBuffer)
          .resize(150, 150, { fit: "cover" })
          .toFile(path.join(outputFolder, `${baseFileName}_thumbnail.jpg`)),
        sharp(imageBuffer)
          .resize(500)
          .toFile(path.join(outputFolder, `${baseFileName}_medium.jpg`)),
        sharp(imageBuffer)
          .resize(1000)
          .toFile(path.join(outputFolder, `${baseFileName}_large.jpg`)),
        sharp(imageBuffer)
          .webp({ quality: 80 })
          .toFile(path.join(outputFolder, `${baseFileName}_optimized.webp`)),
      ]);

      console.log(`✅ Job [${job.id}] Images Processed Successfully!`);

      // Prepare outputs object to be saved and returned
      const outputs = {
        thumbnail: `${baseFileName}_thumbnail.jpg`,
        medium: `${baseFileName}_medium.jpg`,
        large: `${baseFileName}_large.jpg`,
        optimized: `${baseFileName}_optimized.webp`,
      };

      // ✅ FIX: Progress to 100%
      if (job) await job.updateProgress(100);
      await Task.findByIdAndUpdate(taskId, {
        status: "completed",
        progress: 100,
        errorDetails: null,
        outputs: outputs,
        completedAt: new Date(),
      });
      console.log(`✅ Task [${taskId}] marked as Completed in DB!`);

      // 🔥 CRITICAL FIX FOR 7.4: Return outputs so QueueEvents on backend can catch it
      return outputs;
    } catch (error) {
      // ✅ FIX: Defensive catch block
      if (job) {
        await job.updateProgress(0);
      }

      if (taskId) {
        await Task.findByIdAndUpdate(taskId, {
          status: "failed",
          errorDetails: error.message,
          progress: 0,
        });
      }
      console.error(`❌ Job [${job?.id}] completely failed:`, error.message);
      throw error;
    }
  },
  { connection },
);

// 🔥 FIX: Replaced listenerCount check with simple .once()
imageWorker.once("ready", () => {
  console.log("🚀 Worker ready and waiting for jobs...");
});
