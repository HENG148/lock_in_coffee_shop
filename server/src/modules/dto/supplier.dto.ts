import z from "zod";
import type { Supplier } from "../../db/schema/supplier.schema.js";

const text = (max: number) => z.string().trim().min(1).max(max);
const email = z
  .email()
  .max(255)
  .transform((v) => v.toLowerCase());

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150),
    contactName: text(100).optional(),
    email: email.optional(),
    phone: z.string().trim().min(3).max(30).optional(),
    address: text(500).optional(),
    notes: text(1000).optional(),
  }),
});

export const updateSupplierSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      name: z.string().trim().min(2).max(150).optional(),
      contactName: text(100).nullable().optional(),
      email: email.nullable().optional(),
      phone: z.string().trim().min(3).max(30).nullable().optional(),
      address: text(500).nullable().optional(),
      notes: text(1000).nullable().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const supplierIdParamSchema = z.object({
  params: z.object({ id: z.uuid() }),
});

export const listSuppliersSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).max(100).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateSupplierDto = z.infer<typeof createSupplierSchema>["body"];
export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>["body"];
export type ListSuppliersQuery = z.infer<typeof listSuppliersSchema>["query"];

export interface SupplierResponse {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export function toSupplierResponse(row: Supplier): SupplierResponse {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contactName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}