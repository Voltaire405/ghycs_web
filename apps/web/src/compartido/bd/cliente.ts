import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

export type Bd = LibSQLDatabase;

/** Base Turso (libSQL): `libsql://…` con token en producción, `file:…` en local y en pruebas (ADR-0007). */
export const conectar = (opciones: { url: string; authToken?: string }): Bd => drizzle(createClient(opciones));

/** Aplica las migraciones versionadas de `drizzle/`. */
export const migrar = (bd: Bd) => migrate(bd, { migrationsFolder: `${process.cwd()}/drizzle` });
