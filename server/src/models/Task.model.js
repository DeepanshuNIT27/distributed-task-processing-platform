import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    // 🔥 SURGICAL STRIKE: Task ko User ke sath link karne ke liye
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalImage: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    outputs: {
      thumbnail: { type: String, default: null },
      medium: { type: String, default: null },
      large: { type: String, default: null },
      optimized: { type: String, default: null },
    },
    errorDetails: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Task = mongoose.model("Task", taskSchema);
