import { z } from "zod";

/**
 * Validation schema for creating an article
 */
export const createArticleSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),

  slug: z
    .string({
      required_error: "Slug is required",
      invalid_type_error: "Slug must be a string",
    })
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must not exceed 200 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase, alphanumeric, and can contain hyphens",
    )
    .trim(),

  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string",
    })
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .trim(),

  markdown: z
    .string({
      required_error: "Markdown content is required",
      invalid_type_error: "Markdown must be a string",
    })
    .min(10, "Markdown content must be at least 10 characters")
    .max(100000, "Markdown content must not exceed 100,000 characters"),

  tags: z
    .array(
      z
        .string()
        .min(1, "Tag must not be empty")
        .max(30, "Tag must not exceed 30 characters")
        .trim(),
    )
    .max(10, "Cannot have more than 10 tags")
    .optional()
    .default([]),

  featured: z.boolean().optional().default(false),
});

/**
 * Validation schema for updating an article
 * All fields are optional, but at least one must be provided
 */
export const updateArticleSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must not exceed 200 characters")
      .trim()
      .optional(),

    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(200, "Slug must not exceed 200 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must be lowercase, alphanumeric, and can contain hyphens",
      )
      .trim()
      .optional(),

    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must not exceed 500 characters")
      .trim()
      .optional(),

    markdown: z
      .string()
      .min(10, "Markdown content must be at least 10 characters")
      .max(100000, "Markdown content must not exceed 100,000 characters")
      .optional(),

    tags: z
      .array(
        z
          .string()
          .min(1, "Tag must not be empty")
          .max(30, "Tag must not exceed 30 characters")
          .trim(),
      )
      .max(10, "Cannot have more than 10 tags")
      .optional(),

    featured: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * Validation schema for article ID parameter
 */
export const articleIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid article ID format"),
});

/**
 * Validation schema for article slug parameter
 */
export const articleSlugSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Invalid slug format. Must be lowercase, alphanumeric, and can contain hyphens",
    ),
});

/**
 * Validation schema for rejecting an article
 */
export const rejectArticleSchema = z.object({
  reason: z
    .string({
      required_error: "Rejection reason is required",
    })
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must not exceed 500 characters")
    .trim(),
});