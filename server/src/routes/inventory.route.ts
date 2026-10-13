import { Router } from 'express';
import { InventoryRepository } from '../modules/repository/inventory.repository.js';
import { InventoryService } from '../modules/services/inventory.service.js';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate, validateQuery } from '../middleware/validate.middleware.js';
import { adjustStockSchema, createInventoryItemSchema, inventoryItemIdParamSchema, listInventoryQuerySchema, updateInventoryItemSchema } from '../modules/dto/inventory.dto.js';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);
const inventoryController = new InventoryController(inventoryService);

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listInventoryQuerySchema), inventoryController.list);
router.get('/:id', validate(inventoryItemIdParamSchema), inventoryController.getById);

router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createInventoryItemSchema),
  inventoryController.create,
);
router.patch(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateInventoryItemSchema),
  inventoryController.update,
);
router.post(
  '/:id/adjust',
  authorize('admin', 'manager'),
  validate(adjustStockSchema),
  inventoryController.adjust,
);
router.patch(
  '/:id/deactivate',
  authorize('admin', 'manager'),
  validate(inventoryItemIdParamSchema),
  inventoryController.deactivate,
);

export default router;