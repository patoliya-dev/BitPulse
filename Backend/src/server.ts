import app from "./app";
import config from "./config/config";
import connectDB from "./config/db";
import "dotenv/config";
import http from "http";
import mongoose from "mongoose";

const { PORT } = config;

async function start() {
  try {
    connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, closing...`);
      await mongoose.connection.close();
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
}

start();
