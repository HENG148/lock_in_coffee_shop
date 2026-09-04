import { pgTable, uuid, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { products } from './products.schema.js';
import { variantGroup } from './variant-group.schema.js';

export const productVariantGroups = pgTable(
  'product_variant_groups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantGroupId: uuid('variant_group_id')
      .notNull()
      .references(() => variantGroup.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    productIdIdx: index('pvg_product_id_idx').on(table.productId),
    productGroupUnique: uniqueIndex('pvg_product_group_unique').on(
      table.productId,
      table.variantGroupId,
    ),
  }),
);

export const productVariantGroupsRelations = relations(productVariantGroups, ({ one }) => ({
  product: one(products, {
    fields: [productVariantGroups.productId],
    references: [products.id],
  }),
  variantGroup: one(variantGroup, {
    fields: [productVariantGroups.variantGroupId],
    references: [variantGroup.id],
  }),
}));

export type ProductVariantGroup = typeof productVariantGroups.$inferSelect;
export type NewProductVariantGroup = typeof productVariantGroups.$inferInsert;