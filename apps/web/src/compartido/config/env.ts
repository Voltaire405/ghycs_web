import { z } from "zod";

/**
 * Solo se exigen las variables que ya tienen consumidor (RS-NF-014). Cada adaptador nuevo
 * agrega aquí las suyas.
 */
const esquemaBd = z.object({
  DATABASE_URL: z.string().min(1),
  // Vacía en `.env.example`: una base local no lleva token.
  DATABASE_AUTH_TOKEN: z.string().optional().transform((v) => v || undefined),
});

const esquema = esquemaBd.extend({
  // FreeBusy del calendario del gestor (ADR-0004).
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_CALENDAR_ID: z.string().optional().transform((v) => v || "primary"),
  // Acceso del gestor con Google (ADR-0006): el mismo cliente OAuth, solo con permisos de identidad.
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  // Lista de acceso: correos separados por coma. No hay roles (RC-5).
  CORREOS_SOCIOS: z
    .string()
    .transform((v) => v.split(",").map((c) => c.trim()).filter(Boolean))
    .pipe(z.array(z.email()).min(1)),
  // Confirmación al prospecto por Resend (RP-F-021). El remitente admite «Nombre <correo>».
  RESEND_API_KEY: z.string().min(1),
  CORREO_REMITENTE: z.string().min(1),
});

export type Env = z.infer<typeof esquema>;

/** Valida el entorno y lanza con un mensaje que nombra cada variable faltante o inválida (RS-NF-014). */
export function leerEnv(fuente: Record<string, string | undefined> = process.env): Env {
  return validar(esquema, fuente);
}

/** Solo la base de datos: lo que necesitan las migraciones, que no consultan Google. */
export function leerEnvBd(fuente: Record<string, string | undefined> = process.env) {
  return validar(esquemaBd, fuente);
}

function validar<T extends z.ZodType>(esquema: T, fuente: Record<string, string | undefined>): z.infer<T> {
  const r = esquema.safeParse(fuente);
  if (r.success) return r.data;
  const detalle = r.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Variables de entorno faltantes o inválidas (ver .env.example):\n${detalle}`);
}
