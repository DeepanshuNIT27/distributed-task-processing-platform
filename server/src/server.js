import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { imageQueue } from "./queues/imageQueue.js";
// 🔥 NAYA IMPORT: Task Model
import { Task } from "./models/Task.model.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Health Check API
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: `TaskFlow API is running on Port ${PORT}` });
});

// 🚀 PADAV 4: DATABASE TRACKING ROUTE (FIXED PAYLOAD)
app.post("/api/test-job", async (req, res) => {
  try {
    // Temporary test image until upload API is implemented
    const imageUrl =
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=2000&auto=format&fit=crop";

    // 1. Create Task document (status automatically 'pending')
    const task = await Task.create({
      originalImage: imageUrl,
    });

    // 2. Queue mein strictly sirf taskId bhejna hai
    const job = await imageQueue.add("process-image", {
      taskId: task._id,
    });

    res.status(201).json({
      success: true,
      message: "Image job queued successfully",
      taskId: task._id,
      jobId: job.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🛡️ SAFE BOOT PIPELINE
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed. Server boot aborted.", err.message);
    process.exit(1);
  });
