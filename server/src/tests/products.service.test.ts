import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductsRepository } from '../modules/repository/products.repository.js';
import { CategoriesRepository } from '../modules/repository/categories.repository.js';
import { ProductsService } from '../modules/services/products.service.js';
import { ConflictError, NotFoundError } from '../shared/errors/app-error.js';

vi.mock('../modules/repository/products.repository.js');
vi.mock('../modules/repository/categories.repository.js');

const baseCategory = {
  id: 'cat-1',
  name: 'Coffee',
  description: null,
  imageUrl: null,
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

describe('ProductsService', () => {
  let productsRepository: ProductsRepository;
  let categoriesRepository: CategoriesRepository;
  let service: ProductsService;

  beforeEach(() => {
    productsRepository = new ProductsRepository();
    categoriesRepository = new CategoriesRepository();
    service = new ProductsService(productsRepository, categoriesRepository);
  });

  describe('create', () => {
    it('throws NotFoundError when the category does not exist', async () => {
      vi.spyOn(categoriesRepository, 'findById').mockResolvedValue(undefined);

      await expect(
        service.create({ categoryId: 'ghost-cat', name: 'Latte', basePrice: 450 }),
      ).rejects.toThrow(NotFoundError);
    });

    it('throws ConflictError for a duplicate name within the same category', async () => {
      vi.spyOn(categoriesRepository, 'findById').mockResolvedValue(baseCategory);
      vi.spyOn(productsRepository, 'findByNameInCategory').mockResolvedValue(baseProduct);

      await expect(
        service.create({ categoryId: 'cat-1', name: 'Latte', basePrice: 450 }),
      ).rejects.toThrow(ConflictError);
    });

    it('creates a product when category exists and name is unique in it', async () => {
      vi.spyOn(categoriesRepository, 'findById').mockResolvedValue(baseCategory);
      vi.spyOn(productsRepository, 'findByNameInCategory').mockResolvedValue(undefined);
      vi.spyOn(productsRepository, 'create').mockResolvedValue(baseProduct);

      const result = await service.create({ categoryId: 'cat-1', name: 'Latte', basePrice: 450 });
      expect(result.basePriceCents).toBe(450);
    });
  });

  describe('update', () => {
    it('throws NotFoundError for a nonexistent product', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(undefined);
      await expect(service.update('ghost', { name: 'X' })).rejects.toThrow(NotFoundError);
    });

    it('validates the new category exists when categoryId changes', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(baseProduct);
      vi.spyOn(categoriesRepository, 'findById').mockResolvedValue(undefined);

      await expect(service.update('prod-1', { categoryId: 'ghost-cat' })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('does not re-check category existence when categoryId is unchanged', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(baseProduct);
      const categoryLookupSpy = vi.spyOn(categoriesRepository, 'findById');
      vi.spyOn(productsRepository, 'findByNameInCategory').mockResolvedValue(undefined);
      vi.spyOn(productsRepository, 'update').mockResolvedValue({
        ...baseProduct,
        basePriceCents: 500,
      });

      await service.update('prod-1', { basePrice: 500 });
      expect(categoryLookupSpy).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('sets isActive to false', async () => {
      vi.spyOn(productsRepository, 'findById').mockResolvedValue(baseProduct);
      vi.spyOn(productsRepository, 'update').mockResolvedValue({
        ...baseProduct,
        isActive: false,
      });

      const result = await service.deactivate('prod-1');
      expect(result.isActive).toBe(false);
    });
  });
});