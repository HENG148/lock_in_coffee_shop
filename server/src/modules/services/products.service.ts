import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import type { CreateProductDto, UpdateProductDto } from "../dto/products.dto.js";
import type { CategoriesRepository } from "../repository/categories.repository.js";
import type { ProductsRepository } from "../repository/products.repository.js";

export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoryRepository: CategoriesRepository
  ) { }
  
  async list(categoryId?: string) {
    return this.productsRepository.findAllActive(categoryId)
  }

  async getById(id: string) {
    const product = await this.productsRepository.findById(id)
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async create(dto: CreateProductDto) {
    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) throw new NotFoundError("Category not found")
    
    const exisiting = await this.productsRepository.findByNameInCategory(dto.name, dto.categoryId);
    if (exisiting) {
      throw new ConflictError(`A product name "${dto.name}" already exists in this category`);
    }
    const patch: {
      categoryId: string;
      name: string;
      basePriceCents: number;
      description?: string;
      imageUrl?: string;
      sortOrder?: number;
    } = {
      categoryId: dto.categoryId,
      name: dto.name,
      basePriceCents: dto.basePrice,
    };
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.basePrice !== undefined) patch.basePriceCents = dto.basePrice;
    return this.productsRepository.create(patch);
  }

  async update(id: string, dto: UpdateProductDto) {
    const target = await this.productsRepository.findById(id);
    if (!target) throw new NotFoundError("Product not found");

    const effectiveCategoryId = dto.categoryId ?? target.categoryId;
    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new NotFoundError("Category not found");
    }

    if (dto.name !== undefined) {
      const nameCollision = await this.productsRepository.findByNameInCategory(
        dto.name,
        effectiveCategoryId,
        id,
      );
      if (nameCollision) {
        throw new ConflictError(`A product named "${dto.name}" already exists in this category`);
      }
    }

    const patch: {
      categoryId?: string;
      name?: string;
      basePriceCents?: number;
      description?: string;
      imageUrl?: string;
      sortOrder?: number;
    } = {};
    if (dto.categoryId !== undefined) patch.categoryId = dto.categoryId;
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.basePrice !== undefined) patch.basePriceCents = dto.basePrice;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.imageUrl !== undefined) patch.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    const product = await this.productsRepository.update(id, patch);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async deactivate(id: string) {
    const target = await this.productsRepository.findById(id);
    if (!target) throw new NotFoundError("Product not found");

    const product = await this.productsRepository.update(id, { isActive: false });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }
}