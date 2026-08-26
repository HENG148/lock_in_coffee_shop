import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, type NewUser } from "../../db/schema/users.schema.js";
import { refreshTokens } from "../../db/schema/refresh-tokens.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class AuthRepository {
  async findUserByEmail(email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async createUser(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    // A successful insert().returning() always yields exactly one row;
    // if this were ever empty, something is fundamentally wrong with the
    // driver/connection, so failing loudly here is correct.
    if (!user) throw new Error("Failed to create user: no row returned");
    return user;
  }

  async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    const [token] = await db
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning()
    return token;
  }

  async findActiveRefreshtoken(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)),
    })
  }

  async revokeRefreshToken(tokenHash: string) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllUserTokens(userId: string, tx: DbTransaction | typeof db = db) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }

  async rotateRefreshToken(oldTokenHash: string, newToken: {
    tokenHash: string;
    userId: string; 
    expiresAt: Date;
  }) {
    return db.transaction(async (tx) => {
      const [revoked] = await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(refreshTokens.tokenHash, oldTokenHash), isNull(refreshTokens.revokedAt)))
        .returning()
      
      if (!revoked) {
        throw new UnauthorizedError("Refresh token reuse detected");
      }

      const [created] = await tx
        .insert(refreshTokens)
        .values(newToken)
        .returning();
      return created;
    })
  }
}