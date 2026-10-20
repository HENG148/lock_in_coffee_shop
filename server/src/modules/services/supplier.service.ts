import type { NewSupplier } from "../../db/schema/supplier.schema.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toSupplierResponse, type CreateSupplierDto, type ListSuppliersQuery, type Paginated, type SupplierResponse, type UpdateSupplierDto } from "../dto/supplier.dto.js";
import { SuppliersRepository } from "../repository/supplier.repository.js";

function pickDefined<T extends object>(obj: T): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as { [K in keyof T]?: Exclude<T[K], undefined> };
}

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}

const nameTaken = () =>
  new AppError("A supplier with this name already exists", 409, "SUPPLIER_NAME_TAKEN");
const notFound = () => new AppError("Supplier not found", 404, "SUPPLIER_NOT_FOUND");

export class SuppliersService {
  private readonly repo: SuppliersRepository;

  constructor(repo: SuppliersRepository = new SuppliersRepository()) {
    this.repo = repo;
  }

  async create(dto: CreateSupplierDto): Promise<SupplierResponse> {
    try {
      const row = await this.repo.create(pickDefined(dto) as NewSupplier);
      return toSupplierResponse(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw nameTaken();
      throw error;
    }
  }

  async getById(id: string): Promise<SupplierResponse> {
    const row = await this.repo.findById(id);
    if (!row) throw notFound();
    return toSupplierResponse(row);
  }

  async list(query: ListSuppliersQuery): Promise<Paginated<SupplierResponse>> {
    const { rows, total } = await this.repo.list(query);
    return { data: rows.map(toSupplierResponse), page: query.page, limit: query.limit, total };
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<SupplierResponse> {
    try {
      const row = await this.repo.update(id, pickDefined(dto) as Partial<NewSupplier>);
      if (!row) throw notFound();
      return toSupplierResponse(row);
    } catch (error) {
      if (isUniqueViolation(error)) throw nameTaken();
      throw error;
    }
  }
  
  async deactivate(id: string): Promise<SupplierResponse> {
    return this.setActive(id, false);
  }

  async activate(id: string): Promise<SupplierResponse> {
    return this.setActive(id, true);
  }

  private async setActive(id: string, isActive: boolean): Promise<SupplierResponse> {
    const row = await this.repo.setActive(id, isActive);
    if (row) return toSupplierResponse(row);

    // No row flipped: either it doesn't exist, or it's already in that state.
    const existing = await this.repo.findById(id);
    if (!existing) throw notFound();
    throw new AppError(
      isActive ? "Supplier is already active" : "Supplier is already inactive",
      409,
      isActive ? "SUPPLIER_ALREADY_ACTIVE" : "SUPPLIER_ALREADY_INACTIVE",
    );
  }
}