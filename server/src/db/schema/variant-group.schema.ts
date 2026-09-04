import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const variantGroup = pgTable("product_variants", {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  isRequired: boolean('is_required').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const productsVariantRelations = relations(variantGroup, ({ many }) => ({
  options: many(variantGroup),
}));

export type VariantGroup = typeof variantGroup.$inferSelect;
export type NewVariantGroup = typeof variantGroup.$inferInsert;