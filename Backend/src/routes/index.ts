import { Router } from "express";
import userRouter from "./user.routes";
import attendenceRouter from "./attendenece.routes";

const router = Router();

router.use("/users", userRouter);
router.use("/attendence", attendenceRouter);

export default router;
