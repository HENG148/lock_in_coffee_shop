import { pgTable, uuid, varchar, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull().unique(),
  unit: varchar('unit', { length: 30 }).notNull(),
  currentStock: numeric('current_stock', { precision: 12, scale: 3 }).notNull().default('0'),
  lowStockThreshold: numeric('low_stock_threshold', { precision: 12, scale: 3 })
    .notNull()
    .default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;