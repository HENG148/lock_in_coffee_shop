import { migrate } from "drizzle-orm/node-postgres/migrator";
import { logger } from "../utils/logger.js";
import { db, pool } from "./client.js";

async function main(){
  logger.info("Running migration...");
  await migrate(db, { migrationsFolder: "./src/database/migrations" });
  logger.info("Migration completed");
  await pool.end();
}

main().catch((err) => {
  logger.error(err, "Migrations failed");
  process.exit(1);
})