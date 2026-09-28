import { describe, expect, it } from "vitest";
import { leerEnv, leerEnvBd } from "./env";

const google = {
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secreto",
  GOOGLE_REFRESH_TOKEN: "refresco",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  CORREOS_SOCIOS: "socia@ghycs.co",
};

describe("leerEnv", () => {
  it("acepta la base local sin token y la de Turso con token", () => {
    expect(leerEnv({ ...google, DATABASE_URL: "file:local.db", DATABASE_AUTH_TOKEN: "" }).DATABASE_AUTH_TOKEN).toBeUndefined();
    expect(leerEnv({ ...google, DATABASE_URL: "libsql://ghycs.turso.io", DATABASE_AUTH_TOKEN: "t" }).DATABASE_AUTH_TOKEN).toBe("t");
  });

  it("aborta con un mensaje que nombra la variable faltante", () => {
    expect(() => leerEnv({})).toThrow(/DATABASE_URL/);
    expect(() => leerEnv({})).toThrow(/GOOGLE_REFRESH_TOKEN/);
  });

  it("consulta el calendario principal si no se configura otro", () => {
    expect(leerEnv({ ...google, DATABASE_URL: "file:local.db", GOOGLE_CALENDAR_ID: "" }).GOOGLE_CALENDAR_ID).toBe("primary");
  });

  it("lee la lista de acceso separada por comas y exige al menos un correo válido", () => {
    const base = { ...google, DATABASE_URL: "file:local.db" };
    expect(leerEnv({ ...base, CORREOS_SOCIOS: "a@ghycs.co, b@ghycs.co," }).CORREOS_SOCIOS).toEqual(["a@ghycs.co", "b@ghycs.co"]);
    expect(() => leerEnv({ ...base, CORREOS_SOCIOS: "" })).toThrow(/CORREOS_SOCIOS/);
    expect(() => leerEnv({ ...base, CORREOS_SOCIOS: "no-es-correo" })).toThrow(/CORREOS_SOCIOS/);
  });

  it("las migraciones solo exigen la base de datos", () => {
    expect(leerEnvBd({ DATABASE_URL: "file:local.db" }).DATABASE_URL).toBe("file:local.db");
  });
});
