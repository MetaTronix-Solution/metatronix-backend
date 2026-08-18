import { z } from "zod";

const periodSchema = z
  .enum(["day", "week", "month", "year"], {
    message: "Period must be one of day, week, month, year",
  })
  .optional();

export const getVisitsSchema = z.object({
  query: z.object({
    period: periodSchema,
  }),
});

export const getSummarySchema = z.object({
  query: z.object({
    period: periodSchema,
  }),
});

export type GetVisitsInput = z.infer<typeof getVisitsSchema>["query"];
export type GetSummaryInput = z.infer<typeof getSummarySchema>["query"];
