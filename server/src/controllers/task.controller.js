import { Task } from "../models/Task.model.js";
import { imageQueue } from "../queues/imageQueue.js";

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
