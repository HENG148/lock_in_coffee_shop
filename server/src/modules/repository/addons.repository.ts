import { and, asc, eq, ilike, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { addons, type NewAddon } from "../../db/schema/addons.schema.js";
import { productAddons } from "../../db/schema/products-addons.schema.js";

export class AddonsRepository {
  async findAllActive() {
    return db.query.addons.findMany({
      where: eq(addons.isActive, true),
      orderBy: asc(addons.sortOrder)
    })
  };

  async findById(id: string) {
    return db.query.addons.findFirst({
      where: eq(addons.id, id)
    })
  }

  async findByNameCaseInsensitive(name: string, excludeId?: string) {
    const match = ilike(addons.name, name);
    return db.query.addons.findFirst({
      where: excludeId ? and(match, ne(addons.id, excludeId)) : match,
    })
  }

  async create(data: NewAddon) {
    const [addon] = await db.insert(addons).values(data).returning();
    if (!addon) throw new Error('Failed to create addon: no row returned');
    return addon;
  }

  async update(id: string, data: Partial<NewAddon>) {
    const [addon] = await db
      .update(addons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(addons.id, id))
      .returning();
    return addon;
  }

  async findLinksForProducts(productId: string) {
    return db.query.productAddons.findMany({
      where: eq(productAddons.productId, productId),
      with: { addon: true },
    })
  }

  async findLink(productId: string, addonId: string) {
    return db.query.productAddons.findFirst({
      where: and(eq(productAddons.productId, productId),
        eq(productAddons.addonId, addonId)
      )
    })
  }

  async createLink(productId: string, addonId: string) {
    const [link] = await db.insert(productAddons).values({ productId, addonId }).returning();
    if (!link) throw new Error("Failed to attach addon: no row returned");
    return link;
  }

  async deleteLink(productId: string, addonId: string) {
    await db
      .delete(productAddons)
      .where(and(eq(productAddons.productId, productId), eq(productAddons.addonId, addonId)));
  }
}