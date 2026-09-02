import { boolean, index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { categories } from "./categories.schema.js";
import { relations } from "drizzle-orm";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 150 }).notNull(),
  description: varchar("description", { length: 500 }),
  basePriceCents: integer("base_price_cents").notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
},
  (table) => ({
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
  })
);

export const productsRelations = relations(products, ({ one }) => ({
  categories: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  })
}))

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;