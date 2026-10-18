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
    originalAsset: {
      publicId: { type: String, default: null },
      assetId: { type: String, default: null },
      secureUrl: { type: String, default: null },
      format: { type: String, default: null },
      bytes: { type: Number, default: null },
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    processingOptions: {
      thumbnail: { type: Boolean, default: true },
      medium: { type: Boolean, default: true },
      large: { type: Boolean, default: true },
      webp: { type: Boolean, default: true },
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
    outputAssets: {
      thumbnail: { type: mongoose.Schema.Types.Mixed, default: null },
      medium: { type: mongoose.Schema.Types.Mixed, default: null },
      large: { type: mongoose.Schema.Types.Mixed, default: null },
      optimized: { type: mongoose.Schema.Types.Mixed, default: null },
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
