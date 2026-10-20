import { db } from "../../db/client.js";
import type { InventoryTransactionType } from "../../db/schema/inventory-transactions.schema.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toInventoryTransactionResponse, type AdjustStockDto, type InventoryTransactionResponse, type ListTransactionsQuery, type Paginated, type RecordMovementInput } from "../dto/inventory-transaction.dto.js";
import { InventoryTransactionsRepository, type DbTx } from "../repository/inventory-transaction.repository.js";


function assertDeltaMatchesType(type: InventoryTransactionType, delta: string): void {
  const n = Number(delta);
  const valid =
    n !== 0 &&
    (type === 'restock' ? n > 0 : type === 'correction' ? true : n < 0);
  if (!valid) {
    throw new AppError(`Invalid delta ${delta} for movement type "${type}"`, 422, 'INVALID_DELTA');
  }
}

/** HTTP body -> signed decimal string. The client never sends a signed number except for corrections. */
function toSignedDelta(body: AdjustStockDto): string {
  switch (body.type) {
    case 'restock':
      return body.quantity.toFixed(3);
    case 'waste':
      return `-${body.quantity.toFixed(3)}`;
    case 'correction':
      return body.delta.toFixed(3);
  }
}

export class InventoryTransactionsService {
  private readonly repo: InventoryTransactionsRepository;

  constructor(repo: InventoryTransactionsRepository = new InventoryTransactionsRepository()) {
    this.repo = repo;
  }

  async adjust(
    inventoryItemId: string,
    body: AdjustStockDto,
    actorId: string,
  ): Promise<InventoryTransactionResponse> {
    const input: RecordMovementInput = {
      inventoryItemId,
      type: body.type,
      delta: toSignedDelta(body),
      reason: body.reason,
      performedBy: actorId,
    };
    return toInventoryTransactionResponse(await this.record(input));
  }

  async record(input: RecordMovementInput, tx?: DbTx) {
    assertDeltaMatchesType(input.type, input.delta);

    const run = async (executor: DbTx) => {
      const result = await this.repo.applyMovement(executor, input);
      if (!result.ok) {
        switch (result.reason) {
          case 'not_found':
            throw new AppError('Inventory item not found', 404, 'INVENTORY_ITEM_NOT_FOUND');
          case 'inactive':
            throw new AppError('Inventory item is inactive', 409, 'INVENTORY_ITEM_INACTIVE');
          case 'insufficient_stock':
            throw new AppError('Insufficient stock', 409, 'INSUFFICIENT_STOCK');
        }
      }
      return result.row;
    };

    return tx ? run(tx) : db.transaction(run);
  }

  async getById(id: string): Promise<InventoryTransactionResponse> {
    const row = await this.repo.findById(id);
    if (!row) {
      throw new AppError('Inventory transaction not found', 404, 'INVENTORY_TRANSACTION_NOT_FOUND');
    }
    return toInventoryTransactionResponse(row);
  }

  async list(query: ListTransactionsQuery): Promise<Paginated<InventoryTransactionResponse>> {
    const { rows, total } = await this.repo.list(query);
    return {
      data: rows.map(toInventoryTransactionResponse),
      page: query.page,
      limit: query.limit,
      total,
    };
  }
}