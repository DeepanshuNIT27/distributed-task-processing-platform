import express from "express";
import {
  getTaskStats,
  getRecentTasks,
  getHealthStatus,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", getTaskStats);
router.get("/recent", getRecentTasks);
router.get("/health", getHealthStatus);

export default router;
