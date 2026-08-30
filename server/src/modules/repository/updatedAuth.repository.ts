import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, type NewUser } from "../../db/schema/users.schema.js";
import { refreshTokens } from "../../db/schema/refresh-tokens.js";

type TransactionCallback = Parameters<typeof db.transaction>[0];
type Tx = Parameters<TransactionCallback>[0];
type Executor = typeof db | Tx;

export class AuthRepository {
  async findUserByEmail(email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async findUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async createUser(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) throw new Error("Failed to create user: no row returned");
    return user;
  }

  async storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    const [token] = await db
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return token;
  }

  async findActiveRefreshToken(tokenHash: string) {
    return db.query.refreshTokens.findFirst({
      where: and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt))
    });
  }

  async revokeRefreshToken(tokenHash: string) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash));
  }

  async revokeAllUserToken(userId: string, executor: Executor = db) {
    await executor
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  }
}