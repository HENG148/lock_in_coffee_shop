import z from "zod";

export const createAddonSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    price: z.number().int().min(0),
    sortOrder: z.number().int().optional()
  })
})

export const updateAddonSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    price: z.number().int().min(0).optional(),
    sortOrder: z.number().int().optional()
  })
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  })
})

export const addonIdParamSchema = z.object({ params: z.object({ id: z.uuid() }) })

export const attachAddonSchema = z.object({
  params: z.object({ productId: z.uuid() }),
  body: z.object({ addonId: z.uuid() }),
})

export const detachAddonSchema = z.object({
  params: z.object({
    productId: z.uuid(),
    addonId: z.uuid()
  })
})

export const productIdParamSchema = z.object({ params: z.object({ productId: z.uuid() }) });

export type CreateAddonDto = z.infer<typeof createAddonSchema>["body"]
export type UpdateAddonDto = z.infer<typeof updateAddonSchema>["body"]