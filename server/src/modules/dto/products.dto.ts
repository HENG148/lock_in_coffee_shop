import z from "zod";

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.uuid(),
    name: z.string().min(2).max(150),
    description: z.string().max(500).optional(),
    basePrice: z.number().int().positive("basePrice must be a positive integer (cents)"),
    imageUrl: z.url().max(500).optional(),
    sortOrder: z.number().int().optional(),
  })
})

export const updateProductSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    categoryId: z.uuid().optional(),
    name: z.string().min(2).max(150).optional(),
    description: z.string().max(500).optional(),
    basePrice: z.number().int().positive().optional(),
    imageUrl: z.url().max(500).optional(),
    sortOrder: z.number().int().optional(),
  })
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
})

export const productIdParamSchema = z.object({
  params: z.object({ id: z.uuid()})
})

export const listProductsQuerySchema = z.object({
  query: z.object({
    categoryId: z.uuid().optional(),
  })
})


export type CreateProductDto = z.infer<typeof createProductSchema>["body"];
export type UpdateProductDto = z.infer<typeof updateProductSchema>["body"];