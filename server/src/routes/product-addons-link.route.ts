import { Router } from 'express';
import { AddonsRepository } from '../modules/repository/addons.repository.js';
import { ProductsRepository } from '../modules/repository/products.repository.js';
import { AddonsService } from '../modules/services/addons.service.js';
import { AddonsController } from '../controllers/addons.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { productIdParamSchema } from '../modules/dto/products.dto.js';
import { validate } from '../middleware/validate.middleware.js';
import { attachAddonSchema, detachAddonSchema } from '../modules/dto/addons.dto.js';

const addonsRepository = new AddonsRepository();
const productsRepository = new ProductsRepository();
const addonsService = new AddonsService(addonsRepository, productsRepository);
const addonsController = new AddonsController(addonsService);

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', validate(productIdParamSchema), addonsController.listForProduct);
router.post('/', authorize('admin', 'manager'), validate(attachAddonSchema), addonsController.attachToProduct);
router.delete(
  '/:addonId',
  authorize('admin', 'manager'),
  validate(detachAddonSchema),
  addonsController.detachFromProduct,
);

export default router;