import z from "zod";
import { INVENTORY_TRANSACTION_TYPES, type InventoryTransaction, type InventoryTransactionType } from "../../db/schema/inventory-transactions.schema.js";

const MAX = 999_999_999;

const hasMax3Decimals = (n: number): boolean => Number(n.toFixed(3)) === n;

const quantity = z
  .number()
  .positive()
  .max(MAX)
  .refine(hasMax3Decimals, "At most 3 decimal places");

const signedDelta = z
  .number()
  .min(-MAX)
  .max(MAX)
  .refine((n) => n !== 0, "Delta cannot be zero")
  .refine(hasMax3Decimals, "At most 3 decimal places");

const reason = z.string().trim().min(1).max(500);

export const adjustStockSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.discriminatedUnion("type", [
    z.object({ type: z.literal("restock"), quantity, reason: reason.optional() }),
    z.object({ type: z.literal("waste"), quantity, reason }),
    z.object({ type: z.literal("correction"), delta: signedDelta, reason }),
  ]),
});

export const listTransactionsSchema = z.object({
  query: z
    .object({
      itemId: z.uuid().optional(),
      type: z.enum(INVENTORY_TRANSACTION_TYPES).optional(),
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .refine((q) => !q.from || !q.to || q.from <= q.to, {
      message: "from must be before or equal to to",
      path: ["from"],
    }),
});

export const inventoryTransactionIdParamSchema = z.object({
  params: z.object({ id: z.uuid() }),
});

export type AdjustStockDto = z.infer<typeof adjustStockSchema>["body"];
export type ListTransactionsQuery = z.infer<typeof listTransactionsSchema>["query"];

export interface RecordMovementInput {
  inventoryItemId: string;
  type: InventoryTransactionType;
  delta: string;
  reason?: string | undefined;
  referenceType?: string | undefined;
  referenceId?: string | undefined;
  performedBy: string;
}

export interface InventoryTransactionResponse {
  id: string;
  inventoryItemId: string;
  type: InventoryTransactionType;
  quantityDelta: string;
  stockBefore: string;
  stockAfter: string;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  performedBy: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export function toInventoryTransactionResponse(
  row: InventoryTransaction,
): InventoryTransactionResponse {
  return {
    id: row.id,
    inventoryItemId: row.inventoryItemId,
    type: row.type,
    quantityDelta: row.quantityDelta,
    stockBefore: row.stockBefore,
    stockAfter: row.stockAfter,
    reason: row.reason,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    performedBy: row.performedBy,
    createdAt: row.createdAt.toISOString(),
  };
}