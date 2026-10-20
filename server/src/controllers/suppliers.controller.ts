import type { Request, Response } from "express";
import type { SuppliersService } from "../modules/services/supplier.service.js";
import type { CreateSupplierDto, ListSuppliersQuery, UpdateSupplierDto } from "../modules/dto/supplier.dto.js";

export class SuppliersController {
  private readonly service: SuppliersService;

  constructor(service: SuppliersService) {
    this.service = service;
  }

  create = async (req: Request, res: Response): Promise<void> => {
    res.status(201).json(await this.service.create(req.body as CreateSupplierDto));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.service.list(req.validatedQuery as ListSuppliersQuery));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    res.json(await this.service.getById(id));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    res.json(await this.service.update(id, req.body as UpdateSupplierDto));
  };

  deactivate = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    res.json(await this.service.deactivate(id));
  };

  activate = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    res.json(await this.service.activate(id));
  };
}