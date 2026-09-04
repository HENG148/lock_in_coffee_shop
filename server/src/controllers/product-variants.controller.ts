import type { Request, Response, NextFunction } from 'express';
import type { ProductVariantsService } from '../modules/services/product-variants.service.js';

export class ProductVariantsController {
  constructor(private readonly service: ProductVariantsService) {}

  listGroups = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ success: true, data: await this.service.listGroups() });
    } catch (err) {
      next(err);
    }
  };

  createGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: await this.service.createGroup(req.body) });
    } catch (err) {
      next(err);
    }
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(200)
        .json({ success: true, data: await this.service.updateGroup(req.params.id as string, req.body) });
    } catch (err) {
      next(err);
    }
  };

  deactivateGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(200)
        .json({ success: true, data: await this.service.deactivateGroup(req.params.id as string) });
    } catch (err) {
      next(err);
    }
  };

  createOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({
        success: true,
        data: await this.service.createOption(req.params.groupId as string, req.body),
      });
    } catch (err) {
      next(err);
    }
  };

  updateOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        data: await this.service.updateOption(
          req.params.groupId as string,
          req.params.optionId as string,
          req.body,
        ),
      });
    } catch (err) {
      next(err);
    }
  };

  deactivateOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        data: await this.service.deactivateOption(
          req.params.groupId as string,
          req.params.optionId as string,
        ),
      });
    } catch (err) {
      next(err);
    }
  };

  listGroupsForProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.listGroupsForProduct(req.params.productId as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  attachGroupToProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.attachGroupToProduct(
        req.params.productId as string,
        req.body.variantGroupId,
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  detachGroupFromProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.detachGroupFromProduct(
        req.params.productId as string,
        req.params.variantGroupId as string,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}