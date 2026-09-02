import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// config({ path: path.resolve(__dirname, "../.env.test") });
const result = config({ path: path.resolve(__dirname, "../.env.test") });

console.log("DOTENV RESULT:", result);
console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "yes" : "NO");