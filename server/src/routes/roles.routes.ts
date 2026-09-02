import { Router } from "express";
import { RoleController } from "../controllers/role.controller.js";
import { RoleService } from "../modules/services/role.service.js";
import { authorize } from "../middleware/auth.middleware.js";

const roleService = new RoleService();
const roleController = new RoleController(roleService);

const router = Router();
router.get('/permission', roleController.getMyPermission);
router.get("/permission/all", authorize("admin"), roleController.getFullMatrix);

export default router;