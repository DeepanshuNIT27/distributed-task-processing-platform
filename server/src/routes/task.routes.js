import express from "express";
import { uploadImage } from "../controllers/task.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// The key "image" must match the form-data key in frontend/Postman
router.post("/upload", upload.single("image"), uploadImage);

export default router;
