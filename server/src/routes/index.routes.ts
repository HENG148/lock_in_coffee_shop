import { Router } from "express";
import authRoutes from './auth.routes.js'
import usersRoutes from "./user.routes.js"
import roleRoutes from "./roles.routes.js"
import categoriesRoutes from "./categories.routes.js"

const router = Router();

router.use("/auth", authRoutes);
router.use('/users', usersRoutes);
router.use("/roles", roleRoutes);
router.use("/categories", categoriesRoutes);

export default router;