import { Task } from "../models/Task.model.js";
import mongoose from "mongoose";

// GET /api/dashboard/stats
export const getTaskStats = async (req, res) => {
  try {
    // TODO (Phase 8): Add { user: req.user.id } to all countDocuments queries after Auth integration
    const [total, pending, processing, completed, failed] = await Promise.all([
      Task.countDocuments(),
      // ⚠️ IMPORTANT: Agar tera Task model "queued" use karta hai, toh "pending" ko "queued" kar dena.
      Task.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: "processing" }),
      Task.countDocuments({ status: "completed" }),
      Task.countDocuments({ status: "failed" }),
    ]);

    res.json({ total, pending, processing, completed, failed });
  } catch (error) {
    console.error("❌ Error fetching task stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// GET /api/dashboard/recent
export const getRecentTasks = async (req, res) => {
  try {
    // TODO (Phase 8): Add { user: req.user.id } filter inside find() after Auth integration
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      // ⚠️ FIX: Selecting both fileName and originalImage so frontend doesn't break if one is missing
      .select("_id status createdAt fileName originalImage progress");

    res.json(recentTasks);
  } catch (error) {
    console.error("❌ Error fetching recent tasks:", error);
    res.status(500).json({ error: "Failed to fetch recent tasks" });
  }
};

// GET /api/dashboard/health
export const getHealthStatus = async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    res.json({
      // TODO (Phase 9): Replace with actual Redis and worker heartbeat check
      worker: "online",
      redis: "connected",
      database: isDbConnected ? "connected" : "disconnected",
    });
  } catch (error) {
    console.error("❌ Error fetching health status:", error);
    res.status(500).json({ error: "Failed to fetch health status" });
  }
};
