import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const connectDB = async () => {
  try {
    // Attempting to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure if DB connection fails
    process.exit(1);
  }
};
