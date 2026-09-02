import type { Request, Response, NextFunction } from "express";
import type { RoleService } from "../modules/services/role.service.js";
import { UnauthorizedError } from "../shared/errors/app-error.js";

export class RoleController{
  constructor(private readonly rolesService: RoleService) { }
  
  getMyPermission = (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = this.rolesService.getMyPermission(req.user.role);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  getFullMatrix = (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.rolesService.getFullMatrix();
      res.status(200).json({ sucess: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}