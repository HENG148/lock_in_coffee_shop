import 'dotenv/config'
import { App } from "./app.js";
import { env } from "./configs/env.js";
import { logger } from "./utils/logger.js";

const app = App();

app.listen(env.PORT, () => {
  logger.info(`🚀 Coffee POS API running on port ${env.PORT} [${env.NODE_ENV}]`);
})