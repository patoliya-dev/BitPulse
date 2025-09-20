import { Router } from "express";
import {
  createAttendance,
  getUserAttendance,
} from "../controllers/attendence.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createAttendance);
router.get("/report", authMiddleware, getUserAttendance);

export default router;
