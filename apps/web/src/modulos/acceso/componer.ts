import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { conectar } from "@/compartido/bd/cliente";
import { leerEnv } from "@/compartido/config/env";
import { admitido } from "./dominio/lista-de-acceso";
import { crearAuth } from "./infraestructura/auth";

/** Composición del acceso del gestor: Better Auth sobre Turso con Google (ADR-0006, ADR-0007). */
const env = leerEnv();

export const auth = crearAuth({
  bd: conectar({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
  lista: env.CORREOS_SOCIOS,
});

/**
 * Toda página y acción de `/admin` empieza aquí. La lista se consulta en cada petición: retirar
 * un correo corta su acceso de inmediato, aunque su sesión siga abierta.
 */
export async function exigirSesion() {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion) redirect("/login");
  if (!admitido(sesion.user.email, env.CORREOS_SOCIOS)) redirect("/login?error=cuenta_no_admitida");
  return sesion;
}
