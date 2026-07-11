import { Task } from "../models/Task.model.js";
import { imageQueue } from "../queues/imageQueue.js";

// ----------------------------------------------------
// Existing Code (Untouched except BullMQ options)
// ----------------------------------------------------
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload an image file" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/original/${req.file.filename}`;

    const task = await Task.create({
      originalImage: imageUrl,
    });

    // ✅ FIX: BullMQ jobId = MongoDB taskId + 🔥 Phase 9.8 DLQ Retries
    const job = await imageQueue.add(
      "process-image",
      { taskId: task._id },
      {
        jobId: task._id.toString(),
        attempts: 3, // 🔥 DLQ: Max 3 tries before moving to Dead Letter state
        backoff: {
          type: "exponential",
          delay: 2000, // 🔥 Wait 2 seconds before first retry
        },
      },
    );

    res.status(201).json({
      success: true,
      message: "Image uploaded and queued successfully! 🚀",
      taskId: task._id,
      jobId: job.id,
      fileUrl: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ----------------------------------------------------
// 🔥 Phase 7.3: Fetch all tasks (For History Page)
// ----------------------------------------------------
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ----------------------------------------------------
// 🔥 Phase 7.4: Fetch single task details (For Task Details Page)
// ----------------------------------------------------
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ----------------------------------------------------
// 🔥 Phase 9.1: Retry Failed Task (WITH UNIQUE JOB ID FIX)
// ----------------------------------------------------
export const retryTask = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Task ko DB mein dhoondho
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    // 2. Check agar task actually failed hai
    if (task.status !== "failed") {
      return res.status(400).json({
        success: false,
        error: "Only failed tasks can be retried.",
      });
    }

    // 3. Reset task status & progress in DB
    task.status = "pending";
    task.progress = 0;
    task.error = null; // Purana error clear karo
    await task.save();

    // 4. 🔥 FIX: Same jobId ko BullMQ dubara accept nahi karta... + 🔥 DLQ Retries
    await imageQueue.add(
      "process-image",
      { taskId: task._id },
      {
        jobId: `${task._id}-retry-${Date.now()}`,
        attempts: 3, // 🔥 DLQ logic applied here too
        backoff: { type: "exponential", delay: 2000 },
      },
    );

    res.status(200).json({
      success: true,
      message: "Task has been successfully queued for retry 🚀",
      taskId: task._id,
      status: task.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ----------------------------------------------------
// 🔥 Phase 9.7: Task Analytics (Dashboard Stats)
// ----------------------------------------------------
export const getTaskAnalytics = async (req, res) => {
  try {
    // MongoDB Aggregation Pipeline - Groups tasks by status and counts them
    const stats = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Default counters
    const analytics = {
      total: 0,
      completed: 0,
      failed: 0,
      processing: 0,
      pending: 0,
      successRate: 0,
    };

    // Populate counters from DB results
    stats.forEach((stat) => {
      analytics.total += stat.count;
      if (stat._id === "completed") analytics.completed = stat.count;
      if (stat._id === "failed") analytics.failed = stat.count;
      if (stat._id === "processing") analytics.processing = stat.count;
      if (stat._id === "pending") analytics.pending = stat.count;
    });

    // Calculate Success Rate properly
    if (analytics.total > 0) {
      analytics.successRate = Math.round(
        (analytics.completed / analytics.total) * 100,
      );
    }

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
