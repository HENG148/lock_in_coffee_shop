import z from "zod";

export const createVariantGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    isRequired: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
})

export const updateVariantGroupSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    isRequired: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    })
})

export const variantGroupIdParamSchema = z.object({ params: z.object({ id: z.uuid() }) });
 
export const createVariantOptionSchema = z.object({
  params: z.object({ groupId: z.uuid() }),
  body: z.object({
    name: z.string().min(1).max(100),
    // Cents. Non-negative only — see business rules.
    priceModifier: z.number().int().min(0).optional(),
    sortOrder: z.number().int().optional(),
  }),
});
 
export const updateVariantOptionSchema = z.object({
  params: z.object({ groupId: z.uuid(), optionId: z.uuid() }),
  body: z
    .object({
      name: z.string().min(1).max(100).optional(),
      priceModifier: z.number().int().min(0).optional(),
      sortOrder: z.number().int().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});
 
export const variantOptionIdParamSchema = z.object({
  params: z.object({ groupId: z.uuid(), optionId: z.uuid() }),
});
 
export const attachVariantGroupSchema = z.object({
  params: z.object({ productId: z.uuid() }),
  body: z.object({ variantGroupId: z.uuid() }),
});
 
export const detachVariantGroupSchema = z.object({
  params: z.object({ productId: z.uuid(), variantGroupId: z.uuid() }),
});
 
export const productIdParamSchema = z.object({ params: z.object({ productId: z.uuid() }) });
 
export type CreateVariantGroupDto = z.infer<typeof createVariantGroupSchema>['body'];
export type UpdateVariantGroupDto = z.infer<typeof updateVariantGroupSchema>['body'];
export type CreateVariantOptionDto = z.infer<typeof createVariantOptionSchema>['body'];
export type UpdateVariantOptionDto = z.infer<typeof updateVariantOptionSchema>['body'];
export type AttachVariantGroupDto = z.infer<typeof attachVariantGroupSchema>['body'];
 