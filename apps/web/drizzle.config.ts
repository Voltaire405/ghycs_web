import { defineConfig } from "drizzle-kit";
import { leerEnv } from "./src/compartido/config/env";

const env = leerEnv();

export default defineConfig({
  dialect: "turso",
  schema: "./src/modulos/*/infraestructura/esquema.ts",
  out: "./drizzle",
  dbCredentials: { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN },
});
