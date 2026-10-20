import { sql } from 'drizzle-orm';
import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { inventoryItems } from './inventory-items.schema.js';

export const INVENTORY_TRANSACTION_TYPES = [
  'restock',
  'waste',
  'usage',
  'correction',
] as const;
export type InventoryTransactionType = (typeof INVENTORY_TRANSACTION_TYPES)[number];

export const inventoryTransactions = pgTable(
  'inventory_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    inventoryItemId: uuid('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'restrict' }),
    type: varchar('type', { length: 20 }).$type<InventoryTransactionType>().notNull(),
    quantityDelta: numeric('quantity_delta', { precision: 12, scale: 3 }).notNull(),
    stockBefore: numeric('stock_before', { precision: 12, scale: 3 }).notNull(),
    stockAfter: numeric('stock_after', { precision: 12, scale: 3 }).notNull(),
    reason: text('reason'),
    referenceType: varchar('reference_type', { length: 50 }),
    referenceId: uuid('reference_id'),
    performedBy: uuid('performed_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('inv_tx_item_created_idx').on(t.inventoryItemId, t.createdAt.desc()),
    index('inv_tx_type_created_idx').on(t.type, t.createdAt),
    check('inv_tx_type_check', sql`${t.type} IN ('restock','waste','usage','correction')`),
    check('inv_tx_stock_after_nonneg', sql`${t.stockAfter} >= 0`),
    check(
      'inv_tx_delta_sign_check',
      sql`(${t.type} = 'restock' AND ${t.quantityDelta} > 0)
       OR (${t.type} IN ('waste','usage') AND ${t.quantityDelta} < 0)
       OR (${t.type} = 'correction' AND ${t.quantityDelta} <> 0)`,
    ),
    check(
      'inv_tx_reason_required',
      sql`${t.type} NOT IN ('waste','correction') OR length(trim(coalesce(${t.reason}, ''))) > 0`,
    ),
  ],
);

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;