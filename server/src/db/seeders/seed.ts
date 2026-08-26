import bcrypt from "bcryptjs";
import { db, pool } from "../client.js";
import { users } from "../schema/users.schema.js";
import { logger } from "../../utils/logger.js";

async function seed() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  await db
    .insert(users)
    .values({
      fullName: "System Admin",
      email: "admin@coffeeshop.local",
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing();
  logger.info("Seed admin user: admin@coffeeshop.local / ChangeMe123!");
  logger.warn("CHANGE THIS PASSWORD IMMEDATELY IN ANY NON-LOCAL ENVIRONMENT");
  await pool.end();
}

seed().catch((err) => {
  logger.error(err, "Seeding failed");
  process.exit(1);
})