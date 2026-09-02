import "dotenv/config"
import express from "express";
import helmet from "helmet";
import cors from 'cors'
import { env } from "./configs/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handle.middleware.js";
import routes from '../src/routes/index.routes.js'

export function App() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1", routes);
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/", (_req, res) => res.json({message: "Hello Backend"}))
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}