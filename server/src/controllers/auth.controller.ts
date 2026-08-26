import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "../modules/auth/auth.service.js";

interface RefreshRequestBody {
  refreshToken: string;
}

export class AuthController {
  constructor(private readonly authService: AuthService) { }
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err)
    }
  }

  refresh = async (
    req: Request<{}, {}, RefreshRequestBody>,
    res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.refresh(req.body.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request<{},{}, RefreshRequestBody>, res: Response, next: NextFunction) => {
    try {
      await this.authService.logout(req.body.refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}