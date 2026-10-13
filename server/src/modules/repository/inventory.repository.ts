import { eq, and, ilike, ne, sql } from 'drizzle-orm';
import { inventoryItems, type NewInventoryItem } from '../../db/schema/index.js';
import { db } from '../../db/client.js';

// Public-facing shape: currentStock/lowStockThreshold as numbers, not the
// raw strings Drizzle's numeric() type returns.
export interface InventoryItemDto {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(row: typeof inventoryItems.$inferSelect): InventoryItemDto {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    currentStock: Number(row.currentStock),
    lowStockThreshold: Number(row.lowStockThreshold),
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class InventoryRepository {
  async findAllActive(lowStockOnly?: boolean) {
    const rows = await db.query.inventoryItems.findMany({
      where: eq(inventoryItems.isActive, true),
      orderBy: (item, { asc }) => asc(item.name),
    });
    const mapped = rows.map(toDto);
    return lowStockOnly ? mapped.filter((item) => item.currentStock <= item.lowStockThreshold) : mapped;
  }

  async findById(id: string) {
    const row = await db.query.inventoryItems.findFirst({ where: eq(inventoryItems.id, id) });
    return row ? toDto(row) : undefined;
  }

  async findByNameCaseInsensitive(name: string, excludeId?: string) {
    const match = ilike(inventoryItems.name, name);
    const row = await db.query.inventoryItems.findFirst({
      where: excludeId ? and(match, ne(inventoryItems.id, excludeId)) : match,
    });
    return row ? toDto(row) : undefined;
  }

  async create(data: { name: string; unit: string; currentStock?: number; lowStockThreshold?: number }) {
    const insertData: NewInventoryItem = { name: data.name, unit: data.unit };
    if (data.currentStock !== undefined) insertData.currentStock = String(data.currentStock);
    if (data.lowStockThreshold !== undefined) insertData.lowStockThreshold = String(data.lowStockThreshold);

    const [row] = await db.insert(inventoryItems).values(insertData).returning();
    if (!row) throw new Error('Failed to create inventory item: no row returned');
    return toDto(row);
  }

  async update(id: string, data: { name?: string; unit?: string; lowStockThreshold?: number }) {
    const updateData: Partial<NewInventoryItem> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = String(data.lowStockThreshold);

    const [row] = await db
      .update(inventoryItems)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return row ? toDto(row) : undefined;
  }

  // Separate from update() deliberately — update()'s DTO/type never
  // exposes isActive (matching the public API's UpdateInventoryItemDto),
  // so deactivation gets its own explicit, narrowly-scoped method rather
  // than smuggling an extra field through the general update path.
  async setActive(id: string, isActive: boolean) {
    const [row] = await db
      .update(inventoryItems)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return row ? toDto(row) : undefined;
  }

  // Atomic increment/decrement at the SQL level (current_stock + delta),
  // not read-then-write in application code — avoids a lost-update race
  // if two adjustments happen concurrently. The WHERE clause additionally
  // enforces the result can't go negative, so this single statement is
  // both the read-check and the write.
  async adjustStock(id: string, delta: number) {
    const [row] = await db
      .update(inventoryItems)
      .set({
        currentStock: sql`${inventoryItems.currentStock} + ${delta}`,
        updatedAt: new Date(),
      })
      .where(and(eq(inventoryItems.id, id), sql`${inventoryItems.currentStock} + ${delta} >= 0`))
      .returning();
    return row ? toDto(row) : undefined;
  }
}