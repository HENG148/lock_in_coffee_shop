import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { inventoryTransactions, type InventoryTransaction } from "../../db/schema/inventory-transactions.schema.js";
import type { ListTransactionsQuery, RecordMovementInput } from "../dto/inventory-transaction.dto.js";
import { inventoryItems } from "../../db/schema/inventory-items.schema.js";

export type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbExecutor = typeof db | DbTx;

export type ApplyMovementResult =
  | { ok: true; row: InventoryTransaction }
  | { ok: false; reason: 'not_found' | 'inactive' | 'insufficient_stock' };

export class InventoryTransactionsRepository {
  async applyMovement(tx: DbExecutor, input: RecordMovementInput): Promise<ApplyMovementResult> {
    const delta = sql`${input.delta}::numeric`;

    const updated = await tx
      .update(inventoryItems)
      .set({
        currentStock: sql`${inventoryItems.currentStock} + ${delta}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inventoryItems.id, input.inventoryItemId),
          eq(inventoryItems.isActive, true),
          sql`${inventoryItems.currentStock} + ${delta} >= 0`,
        ),
      )
      .returning({
        stockAfter: inventoryItems.currentStock,
        stockBefore: sql<string>`${inventoryItems.currentStock} - ${delta}`.as('stock_before'),
      });

    const result = updated[0];
    if (!result) {
      return { ok: false, reason: await this.diagnoseFailure(tx, input.inventoryItemId) };
    }

    const [row] = await tx
      .insert(inventoryTransactions)
      .values({
        inventoryItemId: input.inventoryItemId,
        type: input.type,
        quantityDelta: input.delta,
        stockBefore: result.stockBefore,
        stockAfter: result.stockAfter,
        reason: input.reason ?? null,
        referenceType: input.referenceType ?? null,
        referenceId: input.referenceId ?? null,
        performedBy: input.performedBy,
      })
      .returning();

    if (!row) throw new Error('Failed to insert inventory transaction');
    return { ok: true, row };
  }

  private async diagnoseFailure(
    tx: DbExecutor,
    itemId: string,
  ): Promise<'not_found' | 'inactive' | 'insufficient_stock'> {
    const [item] = await tx
      .select({ isActive: inventoryItems.isActive })
      .from(inventoryItems)
      .where(eq(inventoryItems.id, itemId))
      .limit(1);

    if (!item) return 'not_found';
    if (!item.isActive) return 'inactive';
    return 'insufficient_stock';
  }

  async findById(id: string): Promise<InventoryTransaction | undefined> {
    const [row] = await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.id, id))
      .limit(1);
    return row;
  }

  async list(query: ListTransactionsQuery): Promise<{ rows: InventoryTransaction[]; total: number }> {
    const conditions = [
      query.itemId ? eq(inventoryTransactions.inventoryItemId, query.itemId) : undefined,
      query.type ? eq(inventoryTransactions.type, query.type) : undefined,
      query.from ? gte(inventoryTransactions.createdAt, query.from) : undefined,
      query.to ? lte(inventoryTransactions.createdAt, query.to) : undefined,
    ].filter((c) => c !== undefined);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(inventoryTransactions)
        .where(where)
        .orderBy(desc(inventoryTransactions.createdAt), desc(inventoryTransactions.id))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit),
      db.select({ total: count() }).from(inventoryTransactions).where(where),
    ]);

    return { rows, total: totals[0]?.total ?? 0 };
  }
}