import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import type { Bd } from "@/compartido/bd/cliente";
import { admitido } from "../dominio/lista-de-acceso";
import * as esquema from "./esquema";

/** Antes de crear el usuario: una cuenta de Google fuera de la lista no llega a existir (ADR-0006). */
export const rechazarAjenos =
  (lista: readonly string[]) =>
  async <U extends { email: string }>(usuario: U) => {
    if (!admitido(usuario.email, lista)) throw new APIError("FORBIDDEN", { message: "Correo fuera de la lista de acceso." });
    return { data: usuario };
  };

/**
 * Acceso del gestor con Google vía Better Auth (ADR-0006). Pide solo identidad: los permisos
 * por defecto del proveedor son `openid`, `email` y `profile`; el calendario tiene su propia credencial.
 */
export function crearAuth(opciones: {
  bd: Bd;
  secret: string;
  baseURL: string;
  google: { clientId: string; clientSecret: string };
  lista: readonly string[];
}) {
  const { bd, secret, baseURL, google, lista } = opciones;
  const rechazar = rechazarAjenos(lista);
  const auth = betterAuth({
    secret,
    baseURL,
    database: drizzleAdapter(bd, { provider: "sqlite", schema: esquema }),
    socialProviders: { google },
    // Siete días desde que entra, sin renovación: una duración fija que el manual puede prometer.
    session: { disableSessionRefresh: true },
    databaseHooks: {
      user: { create: { before: rechazar } },
      // Un correo retirado de la lista ya tiene usuario: tampoco obtiene sesión nueva.
      session: {
        create: {
          before: async (sesion) => {
            const usuario = await (await auth.$context).internalAdapter.findUserById(sesion.userId);
            await rechazar({ email: usuario?.email ?? "" });
            return { data: sesion };
          },
        },
      },
    },
    // Último plugin: fija las cookies cuando un server action llama a la API (inicio y cierre de sesión).
    plugins: [nextCookies()],
  });
  return auth;
}
