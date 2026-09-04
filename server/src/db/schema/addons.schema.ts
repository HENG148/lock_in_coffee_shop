import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { productAddons } from "./products-addons.schema.js";

export const addons = pgTable("addons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  // Non-negative integer cents, same reasoning as variant option pricing.
  priceCents: integer('price_cents').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const addonsRelations = relations(addons, ({ many }) => ({
  productLinks: many(productAddons),
}))

export type Addon = typeof addons.$inferSelect;
export type NewAddon = typeof addons.$inferInsert;