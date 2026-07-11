import express from "express";

import {
  uploadImage,
  getAllTasks,
  getTaskById,
  retryTask,
  getTaskAnalytics, // 🔥 IMPORTED NEW CONTROLLER
} from "../controllers/task.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);

router.get("/", getAllTasks);

// 🔥 Phase 9.7: Analytics Route (MUST BE PLACED BEFORE /:id TO AVOID CONFLICTS)
router.get("/analytics", getTaskAnalytics);

router.get("/:id", getTaskById);

// 🔥 Phase 9.1: Retry Failed Task Route
router.post("/:id/retry", retryTask);

export default router;
