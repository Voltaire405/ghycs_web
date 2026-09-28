// @vitest-environment node
import { expect, it } from "vitest";
import { rechazarAjenos } from "./auth";

const usuario = (email: string) => ({
  id: "u1",
  name: "Socia",
  email,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

it("un correo de la lista entra: Better Auth crea su usuario", async () => {
  const antes = rechazarAjenos(["socia@ghycs.co"]);
  const socia = usuario("socia@ghycs.co");
  expect(await antes(socia)).toEqual({ data: socia });
});

it("una cuenta de Google ajena se rechaza aunque se autentique", async () => {
  const antes = rechazarAjenos(["socia@ghycs.co"]);
  await expect(antes(usuario("personal@gmail.com"))).rejects.toThrow(/lista de acceso/);
});

const SECRETO = "x".repeat(32);

async function authReal(lista = ["socia@ghycs.co"], url?: string) {
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { conectar, migrar } = await import("@/compartido/bd/cliente");
  const { crearAuth } = await import("./auth");
  const archivo = url ?? `file:${join(mkdtempSync(join(tmpdir(), "ghycs-acceso-")), "bd.sqlite")}`;
  const bd = conectar({ url: archivo });
  if (!url) await migrar(bd);
  const auth = crearAuth({
    bd,
    secret: SECRETO,
    baseURL: "http://localhost:3000",
    google: { clientId: "id", clientSecret: "secreto" },
    lista,
  });
  return { auth, url: archivo };
}

it("sobre libSQL: el esquema sirve a Better Auth, la lista se aplica y la sesión se lee de la cookie", async () => {
  const { auth } = await authReal();
  const ctx = await auth.$context;
  await expect(
    ctx.internalAdapter.createUser({ email: "personal@gmail.com", name: "Otra", emailVerified: true }, { method: "oauth" }),
  ).rejects.toThrow();

  const socia = await ctx.internalAdapter.createUser({ email: "socia@ghycs.co", name: "Socia", emailVerified: true }, { method: "oauth" });
  const sesion = await ctx.internalAdapter.createSession(socia.id);
  const cookie = `${ctx.authCookies.sessionToken.name}=${await firmar(sesion.token, SECRETO)}`;
  const leida = await auth.api.getSession({ headers: new Headers({ cookie }) });
  expect(leida?.user.email).toBe("socia@ghycs.co");
});

it("un correo retirado de la lista no obtiene sesión nueva aunque ya tenga usuario", async () => {
  const { auth, url } = await authReal(["socia@ghycs.co"]);
  const socia = await (await auth.$context).internalAdapter.createUser(
    { email: "socia@ghycs.co", name: "Socia", emailVerified: true },
    { method: "oauth" },
  );
  const { auth: sinElla } = await authReal(["otro@ghycs.co"], url);
  await expect((await sinElla.$context).internalAdapter.createSession(socia.id)).rejects.toThrow();
});

/** Firma el token como lo hace Better Auth (HMAC-SHA256, base64) para armar la cookie. */
async function firmar(valor: string, secreto: string) {
  const { createHmac } = await import("node:crypto");
  return encodeURIComponent(`${valor}.${createHmac("sha256", secreto).update(valor).digest("base64")}`);
}
