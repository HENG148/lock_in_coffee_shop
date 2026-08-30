import type { Request, Response, NextFunction } from "express";
import type { UserService } from "../modules/services/users.service.js";
import { UnauthorizedError } from "../shared/errors/app-error.js";

export class UsersController{
  constructor(private readonly usersService: UserService) { }
  
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.usersService.list();
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err)
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.usersService.getById(req.user.sub);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.usersService.getById(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.usersService.create(req.body, req.user);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.usersService.updateOwnProfile(req.user.sub, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.usersService.update(req.params.id as string, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.usersService.deactivate(req.params.id as string, req.user);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}