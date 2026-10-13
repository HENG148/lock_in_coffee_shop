import type { Request, Response, NextFunction } from 'express';
import type { InventoryService } from '../modules/services/inventory.service.js';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lowStock = req.validatedQuery?.lowStock as boolean | undefined;
      const result = await this.inventoryService.list(lowStock);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inventoryService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json({ success: true, data: await this.inventoryService.create(req.body) });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inventoryService.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inventoryService.deactivate(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  adjust = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.inventoryService.adjust(req.params.id as string, req.body.delta);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}