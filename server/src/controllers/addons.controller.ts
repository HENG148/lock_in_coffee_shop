import type { Request, Response, NextFunction } from 'express';
import type { AddonsService } from '../modules/services/addons.service.js';

export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ success: true, data: await this.addonsService.list() });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: await this.addonsService.create(req.body) });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.addonsService.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.addonsService.deactivate(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  listForProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.addonsService.listForProduct(req.params.productId as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  attachToProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.addonsService.attachToProduct(
        req.params.productId as string,
        req.body.addonId,
      );
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  detachFromProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.addonsService.detachFromProduct(
        req.params.productId as string,
        req.params.addonId as string,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}