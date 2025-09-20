import mongoose from "mongoose";
import config from "./config";

const { MONGODB_URI } = config;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
