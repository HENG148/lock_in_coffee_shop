import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";
import { CategoriesRepository } from "../modules/repository/categories.repository.js";
import { ProductsRepository } from "../modules/repository/products.repository.js";
import { ProductsService } from "../modules/services/products.service.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { createProductSchema, listProductsQuerySchema, productIdParamSchema, updateProductSchema } from "../modules/dto/products.dto.js";
import { authorize } from "../middleware/auth.middleware.js";

const productsRepository = new ProductsRepository();
const categoriesRepository = new CategoriesRepository();
const productsService = new ProductsService(productsRepository, categoriesRepository);
const productsController = new ProductsController(productsService);

const router = Router();

router.get("/", validateQuery(listProductsQuerySchema), productsController.list);
router.get("/:id", validate(productIdParamSchema), productsController.getById);

router.post("/", authorize("admin", "manager"), validate(createProductSchema), productsController.create);

router.patch("/:id", authorize("admin", "manager"), validate(updateProductSchema), productsController.update)

export default router;