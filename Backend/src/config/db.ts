import mongoose from "mongoose";
import config from "./config";

const { MONGO_URI } = config;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
