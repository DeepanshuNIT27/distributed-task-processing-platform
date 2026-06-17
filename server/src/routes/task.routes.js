import express from "express";

import {
  uploadImage,
  getAllTasks,
  getTaskById,
} from "../controllers/task.controller.js";
import { upload } from "../middleware/upload.middleware.js";


const router = express.Router();


router.post("/upload", upload.single("image"), uploadImage);


router.get("/tasks", getAllTasks);

router.get("/tasks/:id", getTaskById);

export default router;
