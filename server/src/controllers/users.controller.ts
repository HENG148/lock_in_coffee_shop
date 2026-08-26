import type { Request, Response, NextFunction } from "express";
import type { UserService } from "../modules/services/users.service.js";
import { UnauthorizedError } from "../shared/errors/app-error.js";

export class UsersController{
  constructor(private readonly usersService: UserService) { }
  
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.usersService.list();
      res.status(200).json({ success: true, data: result });
    } catch(err) {
      next(err)
    }
  }

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.usersService.getById(req.user.sub);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}