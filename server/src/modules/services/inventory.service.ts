import { ConflictError, NotFoundError, BadRequestError } from '../../shared/errors/app-error.js';
import type { CreateInventoryItemDto, UpdateInventoryItemDto } from '../dto/inventory.dto.js';
import type { InventoryRepository } from '../repository/inventory.repository.js';

export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async list(lowStockOnly?: boolean) {
    return this.inventoryRepository.findAllActive(lowStockOnly);
  }

  async getById(id: string) {
    const item = await this.inventoryRepository.findById(id);
    if (!item) throw new NotFoundError('Inventory item not found');
    return item;
  }

  async create(dto: CreateInventoryItemDto) {
    const existing = await this.inventoryRepository.findByNameCaseInsensitive(dto.name);
    if (existing) throw new ConflictError(`An inventory item named "${dto.name}" already exists`);

    const patch: { name: string; unit: string; currentStock?: number; lowStockThreshold?: number } = {
      name: dto.name,
      unit: dto.unit,
    };
    if (dto.currentStock !== undefined) patch.currentStock = dto.currentStock;
    if (dto.lowStockThreshold !== undefined) patch.lowStockThreshold = dto.lowStockThreshold;

    return this.inventoryRepository.create(patch);
  }

  async update(id: string, dto: UpdateInventoryItemDto) {
    const target = await this.inventoryRepository.findById(id);
    if (!target) throw new NotFoundError('Inventory item not found');

    if (dto.name !== undefined) {
      const collision = await this.inventoryRepository.findByNameCaseInsensitive(dto.name, id);
      if (collision) throw new ConflictError(`An inventory item named "${dto.name}" already exists`);
    }

    const patch: { name?: string; unit?: string; lowStockThreshold?: number } = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.unit !== undefined) patch.unit = dto.unit;
    if (dto.lowStockThreshold !== undefined) patch.lowStockThreshold = dto.lowStockThreshold;

    const item = await this.inventoryRepository.update(id, patch);
    if (!item) throw new NotFoundError('Inventory item not found');
    return item;
  }

  async deactivate(id: string) {
    const target = await this.inventoryRepository.findById(id);
    if (!target) throw new NotFoundError('Inventory item not found');
    const item = await this.inventoryRepository.setActive(id, false);
    if (!item) throw new NotFoundError('Inventory item not found');
    return item;
  }

  async adjust(id: string, delta: number) {
    const target = await this.inventoryRepository.findById(id);
    if (!target) throw new NotFoundError('Inventory item not found');

    const updated = await this.inventoryRepository.adjustStock(id, delta);
    if (!updated) {
      // The repository's WHERE clause rejects the write if the result
      // would go negative — a null return here means exactly that, not a
      // generic "not found" (we already confirmed the item exists above).
      throw new BadRequestError(
        `Adjustment would bring stock below zero (current: ${target.currentStock}, delta: ${delta})`,
      );
    }
    return updated;
  }
}