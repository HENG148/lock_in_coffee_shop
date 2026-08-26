import { and, count, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, type NewUser } from "../../db/schema/users.schema.js";

type TransacetionCallBack = Parameters<typeof db.transaction>[0];
type Tx = Parameters<TransacetionCallBack>[0];
type Executor = typeof db | Tx;

export class UserRepository {
  async findAll() {
    return db.query.users.findMany({ orderBy: (u, { asc }) => asc(u.createdAt) });
  }

  async findById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async findByEmail(email: string) {
    return db.query.users.findFirst({ where: eq(users.email, email) });
  }

  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) throw new Error("Failed to created user: no row returned");
    return user;
  }

  async update(id: string, data: Partial<NewUser>, executor: Executor = db) {
    const [user] = await executor
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Counts active admins — used to enforce "there must always be at least
  // one active Admin" before allowing a demotion or deactivation.
  async countActiveAdmins() {
    const [row] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.role, "admin"), eq(users.isActive, true)));
    return row?.value ?? 0;
  }
}