import { Router } from "express";
import { login, registerUser } from "../controllers/user.controller";
const router = Router();

// For upload mode, client should send multipart/form-data with files
router.post("/users/register", registerUser);

router.post("/users/login", login);

export default router;
