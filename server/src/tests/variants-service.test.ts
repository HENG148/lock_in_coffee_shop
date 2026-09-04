import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProductsRepository } from '../modules/repository/products.repository.js';
import { ProductVariantsService } from '../modules/services/product-variants.service.js';
import { ConflictError, NotFoundError } from '../shared/errors/app-error.js';
import { ProductsVariantRepository } from '../modules/repository/products-variants.repository.js';

vi.mock('../modules/repository/products-variants.repository.js');
vi.mock('../modules/repository/products.repository.js');

const baseGroup = {
  id: 'group-1',
  name: 'Size',
  isRequired: true,
  sortOrder: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseOption = {
  id: 'option-1',
  variantGroupId: 'group-1',
  name: 'Large',
  priceModifierCents: 50,
  sortOrder: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseProduct = {
  id: 'prod-1',
  categoryId: 'cat-1',
  name: 'Latte',
  description: null,
  basePriceCents: 450,
  imageUrl: null,
  sortOrder: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductVariantsService', () => {
  let repository: ProductsVariantRepository;
  let productsRepository: ProductsRepository;
  let service: ProductVariantsService;

  beforeEach(() => {
    repository = new ProductsVariantRepository();
    productsRepository = new ProductsRepository();
    service = new ProductVariantsService(repository, productsRepository);
  });

  describe('createGroup', () => {
    it('throws ConflictError on a duplicate group name', async () => {
      vi.spyOn(repository, 'findGroupByName').mockResolvedValue(baseGroup);
      await expect(service.createGroup({ name: 'Size' })).rejects.toThrow(ConflictError);
    });
  });

  describe('createOption', () => {
    it('throws NotFoundError when the group does not exist', async () => {
      vi.spyOn(repository, 'findGroupById').mockResolvedValue(undefined);
      await expect(service.createOption('ghost-group', { name: 'Large' })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws ConflictError on a duplicate option name within the group', async () => {
      vi.spyOn(repository, 'findGroupById').mockResolvedValue(baseGroup);
      vi.spyOn(repository, 'findOptionByNameInGroup').mockResolvedValue(baseOption);
      await expect(service.createOption('group-1', { name: 'Large' })).rejects.toThrow(
        ConflictError,
      );
    });

    it('creates an option with a price modifier', async () => {
      vi.spyOn(repository, 'findGroupById').mockResolvedValue(baseGroup);
      vi.spyOn(repository, 'findOptionByNameInGroup').mockResolvedValue(undefined);
      vi.spyOn(repository, 'createOption').mockResolvedValue(baseOption);

      const result = await service.createOption('group-1', { name: 'Large', priceModifier: 50 });
      expect(result.priceModifierCents).toBe(50);
    });
  });

  describe('updateOption', () => {
    it('throws NotFoundError if the option belongs to a DIFFERENT group than the URL implies', async () => {
      vi.spyOn(repository, 'findOptionById').mockResolvedValue({
        ...baseOption,
        variantGroupId: 'some-other-group',
      });

      await expect(service.updateOption('group-1', 'option-1', { name: 'X' })).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('attachGroupToProduct', () => {
    it('throws NotFoundError when the product does not exist', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(undefined);
      await expect(service.attachGroupToProduct('ghost-prod', 'group-1')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws NotFoundError when the variant group does not exist', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(baseProduct);
      vi.spyOn(repository, 'findGroupById').mockResolvedValue(undefined);
      await expect(service.attachGroupToProduct('prod-1', 'ghost-group')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('throws ConflictError when the link already exists', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(baseProduct);
      vi.spyOn(repository, 'findGroupById').mockResolvedValue(baseGroup);
      vi.spyOn(repository, 'findLink').mockResolvedValue({
        id: 'link-1',
        productId: 'prod-1',
        variantGroupId: 'group-1',
        createdAt: new Date(),
      });

      await expect(service.attachGroupToProduct('prod-1', 'group-1')).rejects.toThrow(
        ConflictError,
      );
    });

    it('creates the link when both exist and no duplicate link exists', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(baseProduct);
      vi.spyOn(repository, 'findGroupById').mockResolvedValue(baseGroup);
      vi.spyOn(repository, 'findLink').mockResolvedValue(undefined);
      vi.spyOn(repository, 'createLink').mockResolvedValue({
        id: 'link-1',
        productId: 'prod-1',
        variantGroupId: 'group-1',
        createdAt: new Date(),
      });

      const result = await service.attachGroupToProduct('prod-1', 'group-1');
      expect(result.productId).toBe('prod-1');
    });
  });

  describe('detachGroupFromProduct', () => {
    it('throws NotFoundError when no link exists to remove', async () => {
      vi.spyOn(repository, 'findLink').mockResolvedValue(undefined);
      await expect(service.detachGroupFromProduct('prod-1', 'group-1')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('deletes the link when it exists (real hard delete)', async () => {
      vi.spyOn(repository, 'findLink').mockResolvedValue({
        id: 'link-1',
        productId: 'prod-1',
        variantGroupId: 'group-1',
        createdAt: new Date(),
      });
      const deleteSpy = vi.spyOn(repository, 'deleteLink').mockResolvedValue(undefined);

      await service.detachGroupFromProduct('prod-1', 'group-1');
      expect(deleteSpy).toHaveBeenCalledWith('prod-1', 'group-1');
    });
  });
});