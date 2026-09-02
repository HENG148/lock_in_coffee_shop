import { Router } from "express";
import { CategoriesController } from "../controllers/categories.controller.js";
import { CategoriesRepository } from "../modules/repository/categories.repository.js";
import { CategoriesService } from "../modules/services/categories.service.js";
import { validate } from "../middleware/validate.middleware.js";
import { categoryIdParamSchema, createCategorySchema, updateCategorySchema } from "../modules/dto/categories.dto.js";
import { authorize } from "../middleware/auth.middleware.js";

const categoriesRepo = new CategoriesRepository();
const categoriesService = new CategoriesService(categoriesRepo);
const categoriesController = new CategoriesController(categoriesService);

const router = Router();

router.get("/", categoriesController.list)
router.get("/:id", validate(categoryIdParamSchema), categoriesController.getById);
router.post("/", authorize("admin", "manager"), validate(createCategorySchema), categoriesController.create);
router.patch("/:id", authorize("admin", "manager"), validate(updateCategorySchema), categoriesController.update);
router.patch("/:id/deactivate", authorize("admin", "manager"), validate(categoryIdParamSchema), categoriesController.deactivate);

export default router;