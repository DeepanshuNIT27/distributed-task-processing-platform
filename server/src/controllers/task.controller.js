import { Task } from "../models/Task.model.js";
import { imageQueue } from "../queues/imageQueue.js";

// ----------------------------------------------------
// Existing Code (100% Untouched)
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

    // ✅ FIX: BullMQ jobId = MongoDB taskId
    const job = await imageQueue.add(
      "process-image",
      { taskId: task._id },
      { jobId: task._id.toString() },
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
