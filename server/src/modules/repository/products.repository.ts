import { and, asc, eq, ilike, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { products, type NewProduct } from "../../db/schema/products.schema.js";

export class ProductsRepository {
  async findAllActive(categoryId?: string) {
    return db.query.products.findMany({
      where: categoryId
        ? and(eq(products.isActive, true), eq(products.categoryId, categoryId))
        : eq(products.isActive, true),
      orderBy: asc(products.sortOrder)
    })
  }

  async findById(id: string) {
    return db.query.products.findFirst({ where: eq(products.id, id) })
  }

  async findByNameInCategory(name: string, categoryId: string, excludeId?: string) {
    const match = and(ilike(products.name, name), eq(products.categoryId, categoryId));
    return db.query.products.findFirst({
      where: excludeId ? and(match, ne(products.id, excludeId)) : match,
    })
  }

  async create(data: NewProduct) {
    const [product] = await db.insert(products).values(data).returning();
    if (!product) throw new Error("Failed to create product: no row returned");
    return product;
  }

  async update(id: string, data: Partial<NewProduct>) {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }
}