import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../shared/errors/app-error.js";
import { hasPermission } from "../modules/role.matrix.js";

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentticatin required"));
    }
    if (!hasPermission(req.user.role, permission)) {
      return next(new ForbiddenError(`Mission permission: ${permission}`));
    }
    next();
  }
}