// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

afterEach(() => vi.unstubAllEnvs());

it("en producción la administración responde 404, también a las server actions", () => {
  vi.stubEnv("VERCEL_ENV", "production");
  expect(proxy(new NextRequest("https://ghycs.vercel.app/admin")).status).toBe(404);
  expect(proxy(new NextRequest("https://ghycs.vercel.app/admin/solicitudes/1", { method: "POST" })).status).toBe(404);
});

it("fuera de producción la deja pasar", () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  expect(proxy(new NextRequest("https://ghycs.vercel.app/admin")).headers.get("x-middleware-next")).toBe("1");
});
