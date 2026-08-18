import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const categorySchema = z.enum(["Tech", "Startup", "AI", "Design", "IOT"], {
  message: "Category must be one of Tech, Startup, AI, Design, IOT",
});

// multer puts non-file fields on req.body as strings, so booleans arrive as "true"/"false"
const publishedSchema = z
  .enum(["true", "false"])
  .optional()
  .transform((val) => val === "true");

export const createBlogSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(150, "Title cannot exceed 150 characters"),
    content: z
      .string()
      .trim()
      .min(20, "Content must be at least 20 characters"),
    author: z
      .string()
      .trim()
      .min(2, "Author name must be at least 2 characters")
      .max(50, "Author name cannot exceed 50 characters"),
    category: categorySchema,
    published: publishedSchema,
  }),
});

export const updateBlogSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(150, "Title cannot exceed 150 characters")
      .optional(),
    content: z
      .string()
      .trim()
      .min(20, "Content must be at least 20 characters")
      .optional(),
    author: z
      .string()
      .trim()
      .min(2, "Author name must be at least 2 characters")
      .max(50, "Author name cannot exceed 50 characters")
      .optional(),
    category: categorySchema.optional(),
    published: publishedSchema,
  }),
});

export const blogIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const blogSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, "Slug is required"),
  }),
});

export const getPublishedBlogsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>["body"];
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>["body"];
export type GetPublishedBlogsInput = z.infer<
  typeof getPublishedBlogsSchema
>["query"];
