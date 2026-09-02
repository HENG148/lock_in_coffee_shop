import { and, asc, eq, ilike, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { categories, type NewCategory } from "../../db/schema/categories.schema.js";

export class CategoriesRepository {
  async findAllActive() {
    return db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: asc(categories.sortOrder)
    })
  }

  async findById(id: string) {
    return db.query.categories.findFirst({ where: eq(categories.id, id) });
  }

  async findByNameCaseInsensitive(name: string, excludeId?: string) {
    const nameMatch = ilike(categories.name, name);
    return db.query.categories.findFirst({
      where: excludeId ? and(nameMatch, ne(categories.id, excludeId)):nameMatch,
    })
  }

  async create(data: NewCategory) {
    const [category] = await db.insert(categories).values(data).returning();
    if (!category) throw new Error("Failed to create category: no row returned");
    return category;
  }

  async update(id: string, data: Partial<NewCategory>) {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }
}