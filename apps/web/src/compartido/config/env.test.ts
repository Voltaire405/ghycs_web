import { describe, expect, it } from "vitest";
import { leerEnv, leerEnvBd } from "./env";

const google = { GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "secreto", GOOGLE_REFRESH_TOKEN: "refresco" };

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

  it("las migraciones solo exigen la base de datos", () => {
    expect(leerEnvBd({ DATABASE_URL: "file:local.db" }).DATABASE_URL).toBe("file:local.db");
  });
});
