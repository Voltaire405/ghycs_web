import { expect, it } from "vitest";
import config from "../../../next.config";

it("toda respuesta lleva las cuatro cabeceras de RS-NF-008", async () => {
  const reglas = await config.headers!();
  const global = reglas.find((r) => r.source === "/(.*)")!;
  const claves = Object.fromEntries(global.headers.map((h) => [h.key, h.value]));
  expect(claves["Content-Security-Policy"]).toContain("default-src 'self'");
  expect(claves["Strict-Transport-Security"]).toMatch(/max-age=\d+/);
  expect(claves["X-Content-Type-Options"]).toBe("nosniff");
  expect(claves["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
});
