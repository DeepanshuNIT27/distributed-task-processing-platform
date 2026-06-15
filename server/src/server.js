import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { imageQueue } from "./queues/imageQueue.js"; // 👈 Naya Queue Import

// Load environment variables (.env file se)
dotenv.config();

const app = express();

// Set PORT to environment variable or fallback to 5000
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies (POST requests ke liye zaroori)
app.use(express.json());

// Health Check API to test the server
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: `TaskFlow API is running on Port ${PORT}` });
});

// 🚀 PADAV 2: LIVE TEST ROUTE (Job push karne ke liye)
app.post("/api/test-job", async (req, res) => {
  try {
    const job = await imageQueue.add("process-image", {
      message: "Task 1",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Job pushed to Upstash! 🚀",
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🛡️ SAFE BOOT PIPELINE (Crash se bachane ke liye)
connectDB()
  .then(() => {
    // Start the Express Server ONLY when DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed. Server boot aborted.", err.message);
    process.exit(1);
  });
