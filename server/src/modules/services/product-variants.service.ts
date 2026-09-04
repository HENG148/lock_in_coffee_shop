import { ConflictError, NotFoundError } from '../../shared/errors/app-error.js';
import type { CreateVariantGroupDto, CreateVariantOptionDto, UpdateVariantGroupDto, UpdateVariantOptionDto } from '../dto/products-variant.dto.js';
import type { ProductsVariantRepository } from '../repository/products-variants.repository.js';
import type { ProductsRepository } from '../repository/products.repository.js';

export class ProductVariantsService {
  constructor(
    private readonly repository: ProductsVariantRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  // --- Variant Groups ---

  async listGroups() {
    return this.repository.findAllGroupActive();
  }

  async createGroup(dto: CreateVariantGroupDto) {
    const existing = await this.repository.findGroupByName(dto.name);
    if (existing) throw new ConflictError(`A variant group named "${dto.name}" already exists`);

    const patch: { name: string; isRequired?: boolean; sortOrder?: number } = { name: dto.name };
    if (dto.isRequired !== undefined) patch.isRequired = dto.isRequired;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    return this.repository.createGroup(patch);
  }

  async updateGroup(id: string, dto: UpdateVariantGroupDto) {
    const target = await this.repository.findGroupById(id);
    if (!target) throw new NotFoundError('Variant group not found');

    if (dto.name !== undefined) {
      const collision = await this.repository.findGroupByName(dto.name, id);
      if (collision) throw new ConflictError(`A variant group named "${dto.name}" already exists`);
    }

    const patch: { name?: string; isRequired?: boolean; sortOrder?: number } = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.isRequired !== undefined) patch.isRequired = dto.isRequired;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    const group = await this.repository.updateGroup(id, patch);
    if (!group) throw new NotFoundError('Variant group not found');
    return group;
  }

  async deactivateGroup(id: string) {
    const target = await this.repository.findGroupById(id);
    if (!target) throw new NotFoundError('Variant group not found');
    const group = await this.repository.updateGroup(id, { isActive: false });
    if (!group) throw new NotFoundError('Variant group not found');
    return group;
  }

  // --- Variant Options ---

  async createOption(groupId: string, dto: CreateVariantOptionDto) {
    const group = await this.repository.findGroupById(groupId);
    if (!group) throw new NotFoundError('Variant group not found');

    const existing = await this.repository.findOptionByNameInGroup(dto.name, groupId);
    if (existing) {
      throw new ConflictError(`An option named "${dto.name}" already exists in this group`);
    }

    const patch: { variantGroupId: string; name: string; priceModifierCents?: number; sortOrder?: number } = {
      variantGroupId: groupId,
      name: dto.name,
    };
    if (dto.priceModifier !== undefined) patch.priceModifierCents = dto.priceModifier;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    return this.repository.createOption(patch);
  }

  async updateOption(groupId: string, optionId: string, dto: UpdateVariantOptionDto) {
    const target = await this.repository.findOptionById(optionId);
    if (!target || target.variantGroupId !== groupId) {
      throw new NotFoundError('Variant option not found');
    }

    if (dto.name !== undefined) {
      const collision = await this.repository.findOptionByNameInGroup(dto.name, groupId, optionId);
      if (collision) throw new ConflictError(`An option named "${dto.name}" already exists in this group`);
    }

    const patch: { name?: string; priceModifierCents?: number; sortOrder?: number } = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.priceModifier !== undefined) patch.priceModifierCents = dto.priceModifier;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    const option = await this.repository.updateOption(optionId, patch);
    if (!option) throw new NotFoundError('Variant option not found');
    return option;
  }

  async deactivateOption(groupId: string, optionId: string) {
    const target = await this.repository.findOptionById(optionId);
    if (!target || target.variantGroupId !== groupId) {
      throw new NotFoundError('Variant option not found');
    }
    const option = await this.repository.updateOption(optionId, { isActive: false });
    if (!option) throw new NotFoundError('Variant option not found');
    return option;
  }

  // --- Product <-> Variant Group links ---

  async listGroupsForProduct(productId: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    return this.repository.findLinkForProduct(productId);
  }

  async attachGroupToProduct(productId: string, variantGroupId: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const group = await this.repository.findGroupById(variantGroupId);
    if (!group) throw new NotFoundError('Variant group not found');

    const existingLink = await this.repository.findLink(productId, variantGroupId);
    if (existingLink) throw new ConflictError('This variant group is already attached to this product');

    return this.repository.createLink(productId, variantGroupId);
  }

  async detachGroupFromProduct(productId: string, variantGroupId: string) {
    const existingLink = await this.repository.findLink(productId, variantGroupId);
    if (!existingLink) throw new NotFoundError('This variant group is not attached to this product');
    await this.repository.deleteLink(productId, variantGroupId);
  }
}