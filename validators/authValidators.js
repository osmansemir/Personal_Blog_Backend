import { z } from "zod";

/**
 * Validation schema for user registration
 */
export const registerSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .trim(),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),

  role: z
    .enum(["user", "author"], {
      errorMap: () => ({ message: "Role must be either 'user' or 'author'" }),
    })
    .optional(),
});

/**
 * Validation schema for user login
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(1, "Password is required"),
});