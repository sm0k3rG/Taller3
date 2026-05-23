import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { createApp } from "./app";
import { testConnection } from "./db/connection";
import { config } from "./config/app.config";

async function bootstrap() {
  await testConnection();

  const app = createApp();
  const { port, nodeEnv } = config.server;

  app.listen(port, () => {
    console.log("\n Gestor de Red Eléctrica — API iniciada");
    console.log(`   Entorno : ${nodeEnv}`);
    console.log(`   URL     : http://localhost:${port}/api`);
    console.log("\n Endpoints:");
    console.log("   GET    /api/dispositivos");
    console.log("   GET    /api/dispositivos/:id");
    console.log("   POST   /api/dispositivos");
    console.log("   PUT    /api/dispositivos/:id");
    console.log("   DELETE /api/dispositivos/:id\n");
  });
}

bootstrap().catch((err) => {
  console.error("Error al iniciar la aplicación:", err);
  process.exit(1);
});