import { Router } from "express";
import { getUsers, login, registerUser } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

// For upload mode, client should send multipart/form-data with files
router.post("/register", registerUser);

// Login API
router.post("/login", login);

// list all users (requires login)
router.get("/list", authMiddleware, getUsers);

export default router;
