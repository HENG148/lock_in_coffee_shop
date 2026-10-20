import type { AdjustStockDto, ListTransactionsQuery } from "../modules/dto/inventory-transaction.dto.js";
import type { InventoryTransactionsService } from "../modules/services/inventory-transactions.service.js";
import type { Request, Response } from "express";

export class InventoryTransactionController {
  private readonly service: InventoryTransactionsService;
  constructor(service: InventoryTransactionsService) {
    this.service = service;
  }

  adjust = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const body = req.body as AdjustStockDto;
    const result = await this.service.adjust(id, body, req.user!.sub);
    res.status(201).json(result);
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const query = req.validatedQuery as ListTransactionsQuery;
    res.json(await this.service.list(query));
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    res.json(await this.service.getById(id));
  }
}