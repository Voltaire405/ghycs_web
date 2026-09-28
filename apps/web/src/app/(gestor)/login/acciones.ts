"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/modulos/acceso/componer";

/** Lleva a Google; al volver, Better Auth abre la sesión o devuelve aquí con `error` (ADR-0006). */
export async function entrarConGoogle() {
  const { url } = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: "/admin", errorCallbackURL: "/login" },
  });
  if (!url) throw new Error("Better Auth no devolvió la dirección de Google");
  redirect(url);
}

export async function salir() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
