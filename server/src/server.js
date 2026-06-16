import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Expose uploads directory statically for the Worker
const staticUploadsPath = path.join(process.cwd(), "src/uploads");
app.use("/uploads", express.static(staticUploadsPath));

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: `TaskFlow API is running on Port ${PORT}` });
});

// Mount modular routes
app.use("/api", taskRoutes);

// Safe boot pipeline
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed. Server boot aborted.", err.message);
    process.exit(1);
  });
