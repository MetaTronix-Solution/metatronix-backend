import { Request, Response, NextFunction } from "express";
import { z, ZodType } from "zod";
import AppError from "../util/AppError";

export const validate =
  <T extends ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return next(new AppError(message, 400));
    }

    const data = result.data as z.infer<T>;

    // Overwrite req.body with the parsed/coerced data
    if (typeof data === "object" && data !== null && "body" in data) {
      req.body = (data as { body: unknown }).body ?? req.body;
    }

    next();
  };
