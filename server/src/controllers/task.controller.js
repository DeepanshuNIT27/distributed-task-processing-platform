import { Task } from "../models/Task.model.js";
import { imageQueue } from "../queues/imageQueue.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload an image file" });
    }

    // Static URL for MVP. In production, this can be replaced with S3.
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/original/${req.file.filename}`;

    const task = await Task.create({
      originalImage: imageUrl,
    });

    const job = await imageQueue.add("process-image", {
      taskId: task._id,
    });

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
