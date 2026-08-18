import { z } from "zod";

const salarySchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  currency: z.string().default("NPR"),
});

const employmentTypeEnum = z.enum([
  "full-time",
  "part-time",
  "contract",
  "internship",
  "remote",
]);

const workplaceEnum = z.enum(["onsite", "remote", "hybrid"]);
const statusEnum = z.enum(["draft", "open", "closed"]);

export const createCareerSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(1).max(100),
      department: z.string().trim().min(1),
      location: z.string().trim().min(1),
      employmentType: employmentTypeEnum,
      workplace: workplaceEnum,
      description: z.string().trim().min(1),
      responsibilities: z.array(z.string().trim()).default([]),
      requirements: z.array(z.string().trim()).default([]),
      preferredQualifications: z.array(z.string().trim()).default([]),
      salary: salarySchema.optional(),
      experience: z.string().min(1),
      vacancies: z.preprocess(
        (val) =>
          val === 0 || val === undefined || val === null || val === ""
            ? 1
            : val,
        z.number().int().min(1),
      ),
      applicationDeadline: z.coerce.date().optional(),
      status: statusEnum.default("draft"),
    })
    .strict(),
});

export const updateCareerSchema = z.object({
  body: createCareerSchema.shape.body.partial(),
});

export const updateCareerStatusSchema = z.object({
  body: z
    .object({
      status: statusEnum,
    })
    .strict(),
});

export type CreateCareerInput = z.infer<typeof createCareerSchema>["body"];
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>["body"];
