import { Router } from "express";
import { registerUser } from "../controllers/user.controller";
const router = Router();

// For upload mode, client should send multipart/form-data with files
router.post("/users/register", registerUser);

export default router;
