import { Router } from 'express';
import { AddonsRepository } from '../modules/repository/addons.repository.js';
import { ProductsRepository } from '../modules/repository/products.repository.js';
import { AddonsService } from '../modules/services/addons.service.js';
import { AddonsController } from '../controllers/addons.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { addonIdParamSchema, createAddonSchema, updateAddonSchema } from '../modules/dto/addons.dto.js';

const addonsRepository = new AddonsRepository();
const productsRepository = new ProductsRepository();
const addonsService = new AddonsService(addonsRepository, productsRepository);
const addonsController = new AddonsController(addonsService);

const router = Router();

router.use(authenticate);

router.get('/', addonsController.list);
router.post('/', authorize('admin', 'manager'), validate(createAddonSchema), addonsController.create);
router.patch('/:id', authorize('admin', 'manager'), validate(updateAddonSchema), addonsController.update);
router.patch(
  '/:id/deactivate',
  authorize('admin', 'manager'),
  validate(addonIdParamSchema),
  addonsController.deactivate,
);

export default router;