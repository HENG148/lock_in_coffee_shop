import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";
import { createSupplierSchema, listSuppliersSchema, supplierIdParamSchema, updateSupplierSchema } from "../modules/dto/supplier.dto.js";
import { SuppliersController } from "../controllers/suppliers.controller.js";
import { SuppliersService } from "../modules/services/supplier.service.js";

const controller = new SuppliersController(new SuppliersService());
const router = Router();

// authenticate per route (not router.use): this router mounts at /api alongside public routes.
const staff = [authenticate, authorize("admin", "manager")];

router.post("/suppliers", ...staff, validate(createSupplierSchema), controller.create);
router.get("/suppliers", ...staff, validateQuery(listSuppliersSchema), controller.list);
router.get("/suppliers/:id", ...staff, validate(supplierIdParamSchema), controller.getById);
router.patch("/suppliers/:id", ...staff, validate(updateSupplierSchema), controller.update);
router.patch(
  "/suppliers/:id/activate",
  ...staff,
  validate(supplierIdParamSchema),
  controller.activate,
);
router.delete("/suppliers/:id", ...staff, validate(supplierIdParamSchema), controller.deactivate);

export default router;