import { describe, expect, it } from "vitest";
import { leerEnv } from "./env";

describe("leerEnv", () => {
  it("acepta la base local sin token y la de Turso con token", () => {
    expect(leerEnv({ DATABASE_URL: "file:local.db", DATABASE_AUTH_TOKEN: "" }).DATABASE_AUTH_TOKEN).toBeUndefined();
    expect(leerEnv({ DATABASE_URL: "libsql://ghycs.turso.io", DATABASE_AUTH_TOKEN: "t" }).DATABASE_AUTH_TOKEN).toBe("t");
  });

  it("aborta con un mensaje que nombra la variable faltante", () => {
    expect(() => leerEnv({})).toThrow(/DATABASE_URL/);
  });
});
