import { describe, expect, it } from "vitest";
import { leerEnv } from "./env";

const completo = {
  DATABASE_URL: "postgres://u:p@localhost/ghycs",
  ADMIN_EMAIL: "gestor@ghycs.co",
  ADMIN_PASSWORD_HASH: "$2b$10$abc",
  IP_HASH_SALT: "sal",
  RESEND_API_KEY: "re_123",
  CORREO_REMITENTE: "citas@ghycs.co",
  CORREO_GESTOR: "gestor@ghycs.co",
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secreto",
  GOOGLE_REFRESH_TOKEN: "token",
  GOOGLE_CALENDAR_ID: "primary",
};

describe("leerEnv", () => {
  it("acepta un entorno completo", () => {
    expect(leerEnv(completo).ADMIN_EMAIL).toBe("gestor@ghycs.co");
  });

  it("aborta con un mensaje que nombra la variable faltante", () => {
    const incompleto = { ...completo, RESEND_API_KEY: undefined };
    expect(() => leerEnv(incompleto)).toThrow(/RESEND_API_KEY/);
  });
});
