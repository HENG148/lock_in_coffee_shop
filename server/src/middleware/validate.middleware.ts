import type { Request, Response, NextFunction } from "express";
import type { ZodType, infer as ZodInfer } from "zod";

export function validate<T extends ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // req.body = parsed.body ?? req.body;
    req.body = (parsed as { body?: unknown }).body ?? req.body;
    next();
  };
}