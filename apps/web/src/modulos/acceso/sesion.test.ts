// @vitest-environment node
import { beforeAll, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
// Fuera de una petición `connection()` lanza; aquí no hay prerender que evitar.
vi.mock("next/server", async (original) => ({ ...(await original<object>()), connection: async () => {} }));

beforeAll(() => {
  vi.stubEnv("DATABASE_URL", "file::memory:");
  vi.stubEnv("GOOGLE_CLIENT_ID", "id");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "secreto");
  vi.stubEnv("GOOGLE_REFRESH_TOKEN", "refresco");
  vi.stubEnv("BETTER_AUTH_SECRET", "x".repeat(32));
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
  vi.stubEnv("CORREOS_SOCIOS", "socia@ghycs.co");
});

const alLogin = { digest: expect.stringMatching(/^NEXT_REDIRECT;.*;\/login;/) };

it("sin sesión, exigirSesion redirige al inicio de sesión (RP-F-013)", async () => {
  const { exigirSesion } = await import("./componer");
  await expect(exigirSesion()).rejects.toMatchObject(alLogin);
});

it("sin sesión, /admin y el detalle de una solicitud redirigen al inicio de sesión", async () => {
  const { default: Admin } = await import("@/app/(gestor)/admin/page");
  const { default: Detalle } = await import("@/app/(gestor)/admin/solicitudes/[id]/page");
  await expect(Admin()).rejects.toMatchObject(alLogin);
  await expect(
    Detalle({ params: Promise.resolve({ id: "x" }), searchParams: Promise.resolve({}) }),
  ).rejects.toMatchObject(alLogin);
});
