import { Router } from "express";
import authRoutes from './auth.routes.js'
import usersRoutes from "./user.routes.js"
import roleRoutes from "./roles.routes.js"
import categoriesRoutes from "./categories.routes.js"
import productsRoutes from "./products.routes.js";
import variantGroupRoutes from './variants-group.routes.js'
import productVariantLinkRoutes from './variants-link.routes.js'
// import addonsRoutes from './'

const router = Router();

router.use("/auth", authRoutes);
router.use('/users', usersRoutes);
router.use("/roles", roleRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
router.use("/variant-groups", variantGroupRoutes)
router.use("/products/:productId/variant-groups", productVariantLinkRoutes);

export default router;