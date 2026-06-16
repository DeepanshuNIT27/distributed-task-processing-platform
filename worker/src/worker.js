import IORedis from "ioredis";
import { Worker } from "bullmq";
import dotenv from "dotenv";
import axios from "axios";
import sharp from "sharp";
import fs from "fs";
import path from "path";

dotenv.config();

console.log("👷 Worker starting...");

if (!process.env.REDIS_URL) {
  console.error("❌ REDIS_URL missing in .env");
  process.exit(1);
}

// STABLE UPSTASH CONNECTION
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  family: 4,
  tls: { rejectUnauthorized: false },
});

connection.once("ready", () => console.log("✅ Redis authenticated & ready"));
connection.on("error", (err) => console.error("❌ Redis Error:", err.message));

// SDE STANDARD: Using 'outputs' folder instead of processed_images
const outputFolder = path.resolve("outputs");
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// BULLMQ WORKER WITH SHARP & Promise.allSettled
const imageWorker = new Worker(
  "image-processing-queue",
  async (job) => {
    console.log(`\n⚙️ Job [${job.id}] Started! Task:`, job.data.message);

    try {
      const imageUrl = job.data.imageUrl;
      if (!imageUrl) throw new Error("Image URL missing in job data!");

      console.log(`📥 Downloading image for Job [${job.id}]...`);
      const response = await axios({
        url: imageUrl,
        responseType: "arraybuffer",
      });
      const imageBuffer = Buffer.from(response.data, "binary");

      console.log(`🛠️ Processing 4 optimized versions for Job [${job.id}]...`);
      const baseFileName = `job_${job.id}`;

      // INTERVIEW UPGRADE: Promise.allSettled ensures partial success even if one format fails
      const results = await Promise.allSettled([
        // Thumbnail (150x150)
        sharp(imageBuffer)
          .resize(150, 150, { fit: "cover" })
          .toFile(path.join(outputFolder, `${baseFileName}_thumbnail.jpg`)),

        // Medium (500px width)
        sharp(imageBuffer)
          .resize(500)
          .toFile(path.join(outputFolder, `${baseFileName}_medium.jpg`)),

        // Large (1000px width)
        sharp(imageBuffer)
          .resize(1000)
          .toFile(path.join(outputFolder, `${baseFileName}_large.jpg`)),

        // WebP (Compressed version)
        sharp(imageBuffer)
          .webp({ quality: 80 })
          .toFile(path.join(outputFolder, `${baseFileName}_optimized.webp`)),
      ]);

      // Check if any specific processing failed
      const failedTasks = results.filter((r) => r.status === "rejected");
      if (failedTasks.length > 0) {
        console.warn(
          `⚠️ Job [${job.id}] partially completed with ${failedTasks.length} errors.`,
        );
      } else {
        console.log(
          `✅ Job [${job.id}] 100% Successfully Completed! Outputs saved.`,
        );
      }
    } catch (error) {
      console.error(`❌ Job [${job.id}] completely failed:`, error.message);
      throw error;
    }
  },
  { connection },
);

imageWorker.on("ready", () => {
  console.log("🚀 Worker ready and waiting for jobs...");
});
