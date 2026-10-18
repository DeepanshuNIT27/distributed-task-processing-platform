import { Task } from "../models/Task.model.js";
import { imageQueue } from "../queues/imageQueue.js";
import mongoose from "mongoose"; // 🔥 SURGICAL STRIKE: Analytics aggregate filter ke liye zaroori hai
import {
  assertCloudinaryConfigured,
  deleteCloudinaryImage,
  uploadImageBuffer,
} from "../config/cloudinary.js";

export const uploadImage = async (req, res) => {
  let uploadedPublicId = null;
  let task = null;

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

    assertCloudinaryConfigured();

    const taskId = new mongoose.Types.ObjectId();
    const publicId = `users/${req.user.id}/tasks/${taskId}/original`;
    const uploadedImage = await uploadImageBuffer(req.file.buffer, {
      public_id: publicId,
    });
    uploadedPublicId = uploadedImage.public_id;
    const imageUrl = uploadedImage.secure_url;

    task = await Task.create({
      _id: taskId,
      user: req.user.id, // 🔥 SURGICAL STRIKE: Task ko current logged-in user assign kiya
      originalImage: imageUrl,
      originalAsset: {
        publicId: uploadedImage.public_id,
        assetId: uploadedImage.asset_id,
        secureUrl: uploadedImage.secure_url,
        format: uploadedImage.format,
        bytes: uploadedImage.bytes,
        width: uploadedImage.width,
        height: uploadedImage.height,
      },
      processingOptions: options,
    });

    const job = await imageQueue.add(
      "process-image",
      { taskId: task._id, options },
      {
        jobId: task._id.toString(),
        priority: jobPriority,
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
    if (task?._id) {
      await Task.findByIdAndDelete(task._id).catch(() => {});
    }
    if (uploadedPublicId) {
      await deleteCloudinaryImage(uploadedPublicId).catch(() => {});
    }
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
    task.errorDetails = null;
    await task.save();

    await imageQueue.add(
      "process-image",
      { taskId: task._id, options: task.processingOptions },
      {
        jobId: `${task._id}-retry-${Date.now()}`,
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
