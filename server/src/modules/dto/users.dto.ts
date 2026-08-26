import z from "zod";

const roleSchema = z.enum(["admin", "manager", "cashier"]);

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(150),
    email: z.email().max(255),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    role: roleSchema,
  })
});

export const updateOwnProfileSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2).max(150).optional(),
      password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[0-9]/, "Password must contain a number")
      .optional(),
    })
    // role/isActive are structurally impossible to send here, not just
    // ignored — Zod's default behavior strips unknown keys anyway, but
    // being explicit about the shape documents the security boundary.
  .strict()
})

export const updateUserSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    fullName: z.string().min(2).max(150).optional(),
    role: roleSchema.optional(),
    isActive: z.boolean().optional(),
  })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided"
  })
})

export const userIdParamSchema = z.object({
  params: z.object({ id: z.uuid() })
});

export type CreateUserDto = z.infer<typeof createUserSchema>["body"];
export type UpdateOwnProfileDto = z.infer<typeof updateOwnProfileSchema>["body"];
export type UpdateUserDto = z.infer<typeof updateUserSchema>["body"];