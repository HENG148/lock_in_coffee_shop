import jwt from "jsonwebtoken"
import { env } from "../configs/env.js";
import crypto from "node:crypto"

export interface AccessTokenPayload {
  sub: string;
  role: "admin" | "manager" | "cashier" | "barista";
}

export function signAccessToken(payload: AccessTokenPayload): string{
  const options: jwt.SignOptions = {
  expiresIn: (env.ACCESS_TOKEN_TTL ?? "15m") as NonNullable<jwt.SignOptions["expiresIn"]>,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload{
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string): string{
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiryDate(): Date{
  const days = env.REFRESH_TOKEN_TTL_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}