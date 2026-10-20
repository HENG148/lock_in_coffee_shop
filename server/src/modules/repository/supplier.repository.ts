import { and, asc, count, eq, ilike } from "drizzle-orm";
import { suppliers, type NewSupplier, type Supplier } from "../../db/schema/supplier.schema.js";
import { db } from "../../db/client.js";
import type { ListSuppliersQuery } from "../dto/supplier.dto.js";

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export class SuppliersRepository {
  async create(values: NewSupplier): Promise<Supplier> {
    const [row] = await db.insert(suppliers).values(values).returning();
    if (!row) throw new Error("Failed to insert supplier");
    return row;
  }

  async findById(id: string): Promise<Supplier | undefined> {
    const [row] = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return row;
  }

  async update(id: string, patch: Partial<NewSupplier>): Promise<Supplier | undefined> {
    const [row] = await db
      .update(suppliers)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return row;
  }

  async setActive(id: string, isActive: boolean): Promise<Supplier | undefined> {
    const [row] = await db
      .update(suppliers)
      .set({ isActive, updatedAt: new Date() })
      .where(and(eq(suppliers.id, id), eq(suppliers.isActive, !isActive)))
      .returning();
    return row;
  }

  async list(query: ListSuppliersQuery): Promise<{ rows: Supplier[]; total: number }> {
    const conditions = [
      query.q ? ilike(suppliers.name, `%${escapeLike(query.q)}%`) : undefined,
      query.isActive !== undefined ? eq(suppliers.isActive, query.isActive) : undefined,
    ].filter((c) => c !== undefined);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(suppliers)
        .where(where)
        .orderBy(asc(suppliers.name), asc(suppliers.id))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit),
      db.select({ total: count() }).from(suppliers).where(where),
    ]);

    return { rows, total: totals[0]?.total ?? 0 };
  }
}