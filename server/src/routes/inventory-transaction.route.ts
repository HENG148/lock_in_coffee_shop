import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { InventoryTransactionController } from "../controllers/inventory-transaction.controller.js";
import { InventoryTransactionsService } from "../modules/services/inventory-transactions.service.js";
import { adjustStockSchema, inventoryTransactionIdParamSchema, listTransactionsSchema } from "../modules/dto/inventory-transaction.dto.js";
import { validate, validateQuery } from "../middleware/validate.middleware.js";

const controller = new InventoryTransactionController(new InventoryTransactionsService());
const router = Router();

// authenticate is applied per route (not router.use) because this router mounts at /api
// and must not intercept public routes like /api/auth/login.
const staff = [authenticate, authorize("admin", "manager")];

router.post("/inventory/:id/adjust", ...staff, validate(adjustStockSchema), controller.adjust);
router.get("/inventory-transactions", ...staff, validateQuery(listTransactionsSchema), controller.list);
router.get(
  "/inventory-transactions/:id",
  ...staff,
  validate(inventoryTransactionIdParamSchema),
  controller.getById,
);

export default router;