import { Router } from "express";
import { createAttendance } from "../controllers/attendence.controller";

const router = Router();

router.post("/", createAttendance);

export default router;
