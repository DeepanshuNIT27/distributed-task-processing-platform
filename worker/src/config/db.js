import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Worker DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Worker DB Error: ${error.message}`);
    process.exit(1);
  }
};
