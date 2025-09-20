// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import router from "./routes";

const app = express();

// Core middleware
app.use(helmet()); // security headers
app.use(cors());
app.use(morgan("tiny")); // request logging
app.use(compression()); // gzip
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: "10mb" })); // JSON & base64 (live mode)
app.use(express.urlencoded({ extended: true })); // form bodies

// Healthcheck
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// Routes
app.use("/api/v1", router);

// 404
app.use((_req, res) => res.status(404).json({ error: "NotFound" }));

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err?.message === "Images only") {
      return res.status(400).json({ error: "InvalidFileType" });
    }
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "FileTooLarge" });
    }
    return res.status(500).json({ error: "ServerError" });
  }
);

export default app;
