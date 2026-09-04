import { Router } from "express";
import { ProductVariantsController } from "../controllers/product-variants.controller.js";
import { ProductsRepository } from "../modules/repository/products.repository.js";
import { ProductVariantsService } from "../modules/services/product-variants.service.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createVariantGroupSchema, createVariantOptionSchema, updateVariantGroupSchema, updateVariantOptionSchema, variantGroupIdParamSchema, variantOptionIdParamSchema } from "../modules/dto/products-variant.dto.js";
import { ProductsVariantRepository } from "../modules/repository/products-variants.repository.js";

const repository = new ProductsVariantRepository();
const productRepository = new ProductsRepository();
const service = new ProductVariantsService(repository, productRepository);
const controller = new ProductVariantsController(service);

const router = Router();

router.use(authenticate);
router.get("/", authorize("admin", "manager"), validate(createVariantGroupSchema), controller.createGroup);
router.post("/:id", authorize("admin", "manager"), validate(updateVariantGroupSchema), controller.updateGroup);
router.patch("/:id/deactivate", authorize("admin", "manager"), validate(variantGroupIdParamSchema), controller.deactivateGroup);

router.post("/:groupId/options", authorize("admin", "manager"), validate(createVariantOptionSchema), controller.createOption);
router.patch("/:groupId/options/:optionsId", authorize("admin", "manager"), validate(updateVariantOptionSchema), controller.updateOption)
router.patch("/:groupId/options/:optionId/deactivate", authorize("admin", "manager"), validate(variantOptionIdParamSchema), controller.deactivateOption);

export default router;