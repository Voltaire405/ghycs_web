"use server";

import { redirect } from "next/navigation";

/**
 * Fase 1: cualquier credencial entra. La comparación contra `ADMIN_EMAIL` y el hash
 * Argon2id, la cookie de sesión y el límite de intentos llegan en fase 2
 * (RS-F-015, RS-F-016, RS-F-017).
 */
export async function iniciarSesion() {
  redirect("/admin");
}
