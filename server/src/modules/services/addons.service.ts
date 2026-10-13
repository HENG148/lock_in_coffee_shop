import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import type { CreateAddonDto, UpdateAddonDto } from "../dto/addons.dto.js";
import type { AddonsRepository } from "../repository/addons.repository.js";
import type { ProductsRepository } from "../repository/products.repository.js";

export class AddonsService {
  constructor(
    private readonly addonsRepository: AddonsRepository,
    private readonly productsRepository: ProductsRepository,
  ) { }
  
  async list() {
    return this.addonsRepository.findAllActive();
  }

  async create(dto: CreateAddonDto) {
    const existing = await this.addonsRepository.findByNameCaseInsensitive(dto.name);
    if (existing) throw new ConflictError(`An add-on named "${dto.name}" already exists`);
    const patch: {
      name: string;
      priceCents: number;
      sortOrder?: number
    } = {
      name: dto.name,
      priceCents: dto.price
    };
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    return this.addonsRepository.create(patch);
  }

  async update(id: string, dto: UpdateAddonDto) {
    const target = await this.addonsRepository.findById(id);
    if (!target) throw new NotFoundError("Add-on not found");
    if (dto.name !== undefined) {
      const collision = await this.addonsRepository.findByNameCaseInsensitive(dto.name, id);
      if (collision) throw new ConflictError(`An add-on named "${dto.name}" already exists`);
    }

    const patch: {
      name?: string;
      priceCents?: number;
      sortOrder?: number
    } = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.price !== undefined) patch.priceCents = dto.price;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    const addon = await this.addonsRepository.update(id, patch);
    if (!addon) throw new NotFoundError("Add-on not found");
    return addon;
  }

  async deactivate(id: string) {
    const target = await this.addonsRepository.findById(id);
    if (!target) throw new NotFoundError("Add-on not found");
    const addon = await this.addonsRepository.update(id, { isActive: false });
    if (!addon) throw new NotFoundError("Add-on not found");
    return addon;
  }

  async listForProduct(productId: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    // const addon = await this.addonsRepository.findById(addonId)
    return this.addonsRepository.findLinksForProducts(productId)
  }

  async attachToProduct(productId: string, addonId: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const addon = await this.addonsRepository.findById(addonId);
    if (!addon) throw new NotFoundError("Add-on not found")
    const existingLink = await this.addonsRepository.findLink(productId, addonId);
    if (existingLink) throw new ConflictError("This add-on is already attached to this product");
    return this.addonsRepository.createLink(productId, addonId);
  }

  async detachFromProduct(productId: string, addonId: string) {
    const existingLink = await this.addonsRepository.findLink(productId, addonId);
    if (!existingLink) throw new NotFoundError("This add-on not attached to this product");
    await this.addonsRepository.deleteLink(productId, addonId);
  }
}