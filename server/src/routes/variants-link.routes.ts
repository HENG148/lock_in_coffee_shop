import { Router } from "express";
import { ProductVariantsController } from "../controllers/product-variants.controller.js";
import { ProductsRepository } from "../modules/repository/products.repository.js";
import { ProductVariantsService } from "../modules/services/product-variants.service.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productIdParamSchema } from "../modules/dto/products.dto.js";
import { attachVariantGroupSchema, detachVariantGroupSchema } from "../modules/dto/products-variant.dto.js";
import { ProductsVariantRepository } from "../modules/repository/products-variants.repository.js";

const repository = new ProductsVariantRepository();
const productRepository = new ProductsRepository();
const service = new ProductVariantsService(repository, productRepository);
const controller = new ProductVariantsController(service);

// mergeParams so :productId from the parent router (mounted at
// /products/:productId/variant-groups) is visible on req.params here.
const router = Router({ mergeParams: true })

router.use(authenticate);

router.get("/", validate(productIdParamSchema), controller.listGroupsForProduct);
router.post("/", authorize("admin", "manager"), validate(attachVariantGroupSchema), controller.attachGroupToProduct);
router.delete("/:variantGroupId", authorize("admin", "manager"), validate(detachVariantGroupSchema), controller.detachGroupFromProduct);

export default router;