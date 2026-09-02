import z from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    imageUrl: z.url().max(500).optional(),
    sortOrder: z.number().int().optional()
  })
});

export const updateCategorySchema = z.object({
  param: z.object({ id: z.uuid() }),
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      imageUrl: z.url().max(500).optional(),
      sortOrder: z.number().int().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
})

export const categoryIdParamSchema = z.object({
  params: z.object({ id: z.uuid() }),
})

export type CreateCategoryDto = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>["body"];