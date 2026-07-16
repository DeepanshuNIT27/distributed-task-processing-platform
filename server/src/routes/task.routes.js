import express from "express";

import {
  uploadImage,
  getAllTasks,
  getTaskById,
  retryTask,
  getTaskAnalytics,
} from "../controllers/task.controller.js";
import { upload } from "../middleware/upload.middleware.js";
// 🔥 SURGICAL STRIKE: Protect middleware import kiya
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔥 SURGICAL STRIKE: Har route par protect laga diya taaki req.user mil sake
router.post("/upload", protect, upload.single("image"), uploadImage);

router.get("/", protect, getAllTasks);

// 🔥 Phase 9.7: Analytics Route (MUST BE PLACED BEFORE /:id TO AVOID CONFLICTS)
router.get("/analytics", protect, getTaskAnalytics);

router.get("/:id", protect, getTaskById);

// 🔥 Phase 9.1: Retry Failed Task Route
router.post("/:id/retry", protect, retryTask);

export default router;
