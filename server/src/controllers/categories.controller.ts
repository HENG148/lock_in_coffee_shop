import type { Request, Response, NextFunction } from "express";
import type { CategoriesService } from "../modules/services/categories.service.js";

export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
 
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoriesService.list();
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
 
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoriesService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
 
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoriesService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
 
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoriesService.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
 
  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.categoriesService.deactivate(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}