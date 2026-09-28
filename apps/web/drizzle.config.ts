import { defineConfig } from "drizzle-kit";
import { leerEnvBd } from "./src/compartido/config/env";

const env = leerEnvBd();

export default defineConfig({
  dialect: "turso",
  schema: "./src/modulos/*/infraestructura/esquema.ts",
  out: "./drizzle",
  dbCredentials: { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN },
});
