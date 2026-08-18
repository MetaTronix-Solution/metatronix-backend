import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const statusSchema = z.enum(["active", "inactive"], {
  message: "Status must be either active or inactive",
});

// multer puts non-file fields on req.body as strings, so booleans arrive as "true"/"false"
const featuredSchema = z
  .enum(["true", "false"])
  .optional()
  .transform((val) => val === "true");

const stringArraySchema = z
  .union([z.array(z.string()), z.string()])
  .transform((val) => {
    if (Array.isArray(val)) return val.map((v) => v.trim()).filter(Boolean);

    const trimmed = val.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v).trim()).filter(Boolean);
      }
    } catch {
      // not JSON, fall through to comma-split
    }

    return trimmed
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  })
  .refine((arr) => arr.length > 0, {
    message: "At least one value is required",
  });

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name cannot exceed 100 characters"),
    tagline: z
      .string()
      .trim()
      .min(1, "Tagline is required")
      .max(200, "Tagline cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(3000, "Description cannot exceed 3000 characters")
      .optional(),
    problem: z
      .string()
      .trim()
      .min(1, "Problem statement is required")
      .max(2000, "Problem statement cannot exceed 2000 characters"),
    features: stringArraySchema,
    technologies: stringArraySchema,
    productUrl: z
      .string()
      .trim()
      .regex(/^https?:\/\/.+/, "Please provide a valid URL"),
    featured: featuredSchema,
    status: statusSchema.optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name cannot exceed 100 characters")
      .optional(),
    tagline: z
      .string()
      .trim()
      .min(1, "Tagline is required")
      .max(200, "Tagline cannot exceed 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(3000, "Description cannot exceed 3000 characters")
      .optional(),
    problem: z
      .string()
      .trim()
      .min(1, "Problem statement is required")
      .max(2000, "Problem statement cannot exceed 2000 characters")
      .optional(),
    features: stringArraySchema.optional(),
    technologies: stringArraySchema.optional(),
    productUrl: z
      .string()
      .trim()
      .regex(/^https?:\/\/.+/, "Please provide a valid URL")
      .optional(),
    featured: featuredSchema,
    status: statusSchema.optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
