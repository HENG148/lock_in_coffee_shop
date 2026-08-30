import { Router } from "express";
import authRoutes from '../routes/auth.routes.js'
import usersRoutes from "../routes/user.routes.js"

const router = Router();

router.use("/auth", authRoutes);
router.use('/users', usersRoutes);

export default router;