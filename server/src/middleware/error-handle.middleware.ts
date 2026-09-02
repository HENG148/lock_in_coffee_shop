import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.flatten()
      }
    })
  }

  if (err instanceof AppError) {
    // if (err.statusCode >= 500) {
    //   logger.error({ stack: err.stack, path: req.path }, err.message);
    // }
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code, 
        message: err.message
      }
    })
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  return res.status(500).json({
    success: false, 
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    }
  })
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`
    }
  })
}