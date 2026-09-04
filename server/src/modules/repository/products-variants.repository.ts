import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../../db/client.js";
import { variantGroup, type NewVariantGroup } from "../../db/schema/variant-group.schema.js";
import { variantOptions, type NewVariantOption } from "../../db/schema/variant-options.schema.js";
import { productVariantGroups } from "../../db/schema/products-variant-group.schema.js";

export class ProductsVariantRepository {
  async findAllGroupActive() {
    return db.query.variantGroup.findMany({
      where: eq(variantGroup.isActive, true),
      orderBy: asc(variantGroup.sortOrder),
      with: {
        options: {
          where: eq(variantOptions.isActive, true),
          orderBy: asc(variantOptions.sortOrder)
        }
      }
    })
  }

  async findGroupById(id: string) {
    return db.query.variantGroup.findFirst({
      where: eq(variantGroup.id, id)
    })
  }

  async findGroupByName(name: string, excludeId?: string) {
    const match = eq(variantGroup.name, name);
    return db.query.variantGroup.findFirst({
      where: excludeId
        ? and(match, ne(variantGroup.id, excludeId))
        : match,
    })
  }

  async createGroup(data: NewVariantGroup) {
    const [group] = await db.insert(variantGroup).values(data).returning();
    if (!group) throw new Error("Failed to create variant group: no row returned");
    return group;
  }

  async updateGroup(id: string, data: Partial<NewVariantGroup>) {
    const [group] = await db
      .update(variantGroup)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(variantGroup.id, id))
      .returning();
    return group;
  }


  // Variant Option 

  async findOptionById(id: string) {
    return db.query.variantOptions.findFirst({
      where: eq(variantOptions.id, id)
    })
  }

  async findOptionByNameInGroup(name: string, groupId: string, excludeId?: string) {
    const match = and(eq(variantOptions.name, name), eq(variantOptions.variantGroupId, groupId));
    return db.query.variantOptions.findFirst({
      where: excludeId 
        ? and(match, ne(variantOptions.id, excludeId))
        : match,
    })
  }

  async createOption(data: NewVariantOption) {
    const [option] = await db.insert(variantOptions).values(data).returning();
    if (!option) throw new Error("Failed to create variant option: no row returned");
    return option;
  }

  async updateOption(id: string, data: Partial<NewVariantOption>) {
    const [option] = await db
      .update(variantOptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(variantOptions.id, id))
      .returning();
    return option;
  }


  // Product Variant Group links

  async findLinkForProduct(productId: string) {
    return db.query.productVariantGroups.findMany({
      where: eq(productVariantGroups.productId, productId),
      with: { variantGroup: true },
    })
  }

  async findLink(productId: string, variantGroupId: string) {
    return db.query.productVariantGroups.findFirst({
      where: and(
        eq(productVariantGroups.productId, productId),
        eq(productVariantGroups.variantGroupId, variantGroupId),
      )
    })
  }

  async createLink(productId: string, variantGroupId: string) {
    const [link] = await db
      .insert(productVariantGroups)
      .values({ productId, variantGroupId })
      .returning();
    if (!link) throw new Error("Failed to attach variant group: now row returned");
    return link;
  }

  async deleteLink(productId: string, variantGroupId: string) {
    await db
      .delete(productVariantGroups)
      .where(
        and(
          eq(productVariantGroups.productId, productId),
          eq(productVariantGroups.variantGroupId, variantGroupId),
      )
    )
  }
}