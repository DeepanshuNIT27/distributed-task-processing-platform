import { Task } from "../models/Task.model.js";
import { imageQueue } from "../queues/imageQueue.js";
import mongoose from "mongoose"; // 🔥 SURGICAL STRIKE: Analytics aggregate filter ke liye zaroori hai

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload an image file" });
    }

    let options = { thumbnail: true, medium: true, large: true, webp: true };
    if (req.body.options) {
      try {
        options = JSON.parse(req.body.options);
      } catch (e) {}
    }

    let jobPriority = 2;
    if (req.body.priority === "High") jobPriority = 1;
    if (req.body.priority === "Low") jobPriority = 3;

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/original/${req.file.filename}`;

    const task = await Task.create({
      user: req.user.id, // 🔥 SURGICAL STRIKE: Task ko current logged-in user assign kiya
      originalImage: imageUrl,
    });

    const job = await imageQueue.add(
      "process-image",
      { taskId: task._id, options },
      {
        jobId: task._id.toString(),
        priority: jobPriority,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
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

export const getAllTasks = async (req, res) => {
  try {
    // 🔥 SURGICAL STRIKE: Sirf usi user ke tasks dhoondho jo logged in hai
    const tasks = await Task.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    // 🔥 SURGICAL STRIKE: Security ke liye verify karo ki task usi user ka hai
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: "Task not found or unauthorized" });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const retryTask = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 SURGICAL STRIKE: Sirf apni failed image retry kar sake user
    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: "Task not found or unauthorized" });
    }

    if (task.status !== "failed") {
      return res.status(400).json({
        success: false,
        error: "Only failed tasks can be retried.",
      });
    }

    task.status = "pending";
    task.progress = 0;
    task.error = null;
    await task.save();

    await imageQueue.add(
      "process-image",
      { taskId: task._id },
      {
        jobId: `${task._id}-retry-${Date.now()}`,
        attempts: 3,
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

export const getTaskAnalytics = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      // 🔥 SURGICAL STRIKE: Aggregation chalaane se pehle sirf is user ka data filter kar lo
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const analytics = {
      total: 0,
      completed: 0,
      failed: 0,
      processing: 0,
      pending: 0,
      successRate: 0,
    };

    stats.forEach((stat) => {
      analytics.total += stat.count;
      if (stat._id === "completed") analytics.completed = stat.count;
      if (stat._id === "failed") analytics.failed = stat.count;
      if (stat._id === "processing") analytics.processing = stat.count;
      if (stat._id === "pending") analytics.pending = stat.count;
    });

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
