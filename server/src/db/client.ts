import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from 'ws';
import * as schema from './schema/index.js'
import { env } from "../configs/env.js";
import { drizzle } from "drizzle-orm/neon-serverless";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });


// import { neon } from "@neondatabase/serverless";
// import { env } from "../configs/env.js";
// import { drizzle } from "drizzle-orm/neon-http";
// import * as schema from './schema/index.js'

// const sql = neon(env.DATABASE_URL);

// export const db = drizzle(sql, { schema });