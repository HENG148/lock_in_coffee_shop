import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { products } from './products.schema.js';
import { addons } from './addons.schema.js';

export const productAddons = pgTable(
  'product_addons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    addonId: uuid('addon_id')
      .notNull()
      .references(() => addons.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // No updatedAt/isActive — pure link record, same as product_variant_groups.
  },
  (table) => ({
    productIdIdx: index('product_addons_product_id_idx').on(table.productId),
    productAddonUnique: uniqueIndex('product_addons_product_addon_unique').on(
      table.productId,
      table.addonId,
    ),
  }),
);

export const productAddonsRelations = relations(productAddons, ({ one }) => ({
  product: one(products, { fields: [productAddons.productId], references: [products.id] }),
  addon: one(addons, { fields: [productAddons.addonId], references: [addons.id] }),
}));

export type ProductAddon = typeof productAddons.$inferSelect;
export type NewProductAddon = typeof productAddons.$inferInsert;