import { Router } from "express";
import { AuthRepository } from "../modules/repository/auth.repository.js";
import { UserRepository } from "../modules/repository/users.repository.js";
import { UserService } from "../modules/services/users.service.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UsersController } from "../controllers/users.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { createUserSchema, updateOwnProfileSchema, updateUserSchema, userIdParamSchema } from "../modules/dto/users.dto.js";

const userRepository = new UserRepository();
const authRepository = new AuthRepository();
const userService = new UserService(userRepository, authRepository);
const usersController = new UsersController(userService)

const router = Router();

router.use(authenticate);
router.get("/me", usersController.getMe);
router.patch("/me", validate(updateOwnProfileSchema), usersController.updateMe);
router.get("/", authorize("admin", "manager"), usersController.list);
router.get("/:id", authorize("admin", "manager"), validate(userIdParamSchema), usersController.getById);

router.post("/", authorize("admin", "manager"), validate(createUserSchema), usersController.create);
router.patch("/:id", authorize("admin"), validate(updateUserSchema), usersController.update);
router.patch("/:id/deactivate", authorize("admin"), validate(userIdParamSchema), usersController.deactivate);

export default router;