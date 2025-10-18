import { z } from "zod";

/**
 * Validation schema for updating user role (admin only)
 */
export const updateRoleSchema = z.object({
  role: z.enum(["user", "author", "admin"], {
    errorMap: () => ({
      message: "Role must be either 'user', 'author', or 'admin'",
    }),
  }),
});

/**
 * Validation schema for user ID parameter
 */
export const userIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID format"),
});