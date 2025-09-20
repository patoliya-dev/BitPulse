// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes";

const app = express();

// Body parsers
app.use(express.json({ limit: "10mb" })); // JSON & base64 (live mode)
app.use(express.urlencoded({ extended: true })); // form bodies

// Core middleware
app.use(helmet()); // security headers
app.use(cors());
app.use(morgan("tiny")); // request logging
app.use(compression()); // gzip
app.use(cookieParser());

// Routes
app.use("/api/v1/", userRouter);

// 404 then error handler
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));

export default app;
