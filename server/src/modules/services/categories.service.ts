import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "../dto/categories.dto.js";
import type { CategoriesRepository } from "../repository/categories.repository.js";

export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) { }
  
  async list() {
    return this.categoriesRepository.findAllActive();
  }

  async getById(id: string) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) throw new NotFoundError("Category not found");
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoriesRepository.findByNameCaseInsensitive(dto.name);
    if (existing) {
      throw new ConflictError(`A category named "${dto.name}" already exists`);
    }
    const patch: {
      name: string; 
      description?: string;
      imageUrl?: string;
      sortOrder?: number
    } = {
      name: dto.name
    }
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.imageUrl !== undefined) patch.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    return this.categoriesRepository.create(patch);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const target = await this.categoriesRepository.findById(id);
    if (!target) throw new NotFoundError('Category not found');
    if (dto.name !== undefined) {
      const nameCollision = await this.categoriesRepository.findByNameCaseInsensitive(
        dto.name,
        id
      );
      if (nameCollision) {
        throw new ConflictError(`A category named "${dto.name}" already exists`);
      }
    }

    const patch: {
      name?: string;
      description?: string;
      imageUrl?: string;
      sortOrder?: number;
    } = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.imageUrl !== undefined) patch.imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;

    const category = await this.categoriesRepository.update(id, patch);
    if (!category) throw new NotFoundError("Category not found");
    return category;
  }

  async deactivate(id: string) {
    const target = await this.categoriesRepository.findById(id);
    if (!target) throw new NotFoundError("Category not found");

    const category = await this.categoriesRepository.update(id, { isActive: false });
    if (!category) throw new NotFoundError("Category not found");
    return category;
  }
}