import type { AccessTokenPayload } from "../utils/jwt.util.ts";

declare global{
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      validatedQuery?: Record<string, unknown>
    }
  }
}

export { };