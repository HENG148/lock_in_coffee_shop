import type { Request, Response, NextFunction } from "express";
import type { ProductsService } from "../modules/services/products.service.js";

export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }
  
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = req.validatedQuery?.categoryId as string | undefined;
      const result = await this.productsService.list(categoryId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productsService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productsService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productsService.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
 
  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productsService.deactivate(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}