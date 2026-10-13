import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150),
    unit: z.string().min(1).max(30),
    currentStock: z.number().min(0).optional(),
    lowStockThreshold: z.number().min(0).optional(),
  }),
});

export const updateInventoryItemSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z
    .object({
      name: z.string().min(2).max(150).optional(),
      unit: z.string().min(1).max(30).optional(),
      lowStockThreshold: z.number().min(0).optional(),
      // currentStock is intentionally NOT accepted here — direct
      // overwrites bypass the audit trail. Use POST /:id/adjust instead.
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const adjustStockSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    // Positive to add stock, negative to consume it. Zero is rejected —
    // an adjustment that changes nothing isn't a real adjustment.
    delta: z.number().refine((n) => n !== 0, 'delta cannot be zero'),
    reason: z.string().max(255).optional(),
  }),
});

export const inventoryItemIdParamSchema = z.object({ params: z.object({ id: z.uuid() }) });

export const listInventoryQuerySchema = z.object({
  query: z.object({
    lowStock: z
      .string()
      .optional()
      .transform((v) => v === 'true'),
  }),
});

export type CreateInventoryItemDto = z.infer<typeof createInventoryItemSchema>['body'];
export type UpdateInventoryItemDto = z.infer<typeof updateInventoryItemSchema>['body'];
export type AdjustStockDto = z.infer<typeof adjustStockSchema>['body'];