import { pgTable, uuid, varchar, integer, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { variantGroup } from './variant-group.schema.js';

export const variantOptions = pgTable(
  'variant_options',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    variantGroupId: uuid('variant_group_id')
      .notNull()
      .references(() => variantGroup.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    // Non-negative only — see business rules. $0.50 upcharge = 50.
    priceModifierCents: integer('price_modifier_cents').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    groupIdIdx: index('variant_options_group_id_idx').on(table.variantGroupId),
    // Enforces "Large" can't exist twice under the same group, at the DB
    // level — not just in application code.
    nameWithinGroupUnique: uniqueIndex('variant_options_name_group_unique').on(
      table.variantGroupId,
      table.name,
    ),
  }),
);

export const variantOptionsRelations = relations(variantOptions, ({ one }) => ({
  group: one(variantGroup, {
    fields: [variantOptions.variantGroupId],
    references: [variantGroup.id],
  }),
}));

export type VariantOption = typeof variantOptions.$inferSelect;
export type NewVariantOption = typeof variantOptions.$inferInsert;