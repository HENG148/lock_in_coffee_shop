import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";
import { AuthRepository } from "../modules/repository/auth.repository.js";
import { AuthService } from "../modules/services/auth.service.js";
import { loginSchema, registerSchema } from "../modules/dto/auth.dto.js";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/refresh", validate(registerSchema), authController.refresh);
router.post("/logout", validate(registerSchema), authController.logout);

export default router;