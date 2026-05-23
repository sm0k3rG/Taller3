import express, { Application } from "express";
import cors from "cors";
import { config } from "./config/app.config";
import dispositivoRoutes from "./modules/dispositivos/dispositivo.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "Gestor de Red Eléctrica API",
      environment: config.server.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/dispositivos", dispositivoRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}