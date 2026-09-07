import { z } from "zod";

const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  IP_HASH_SALT: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CORREO_REMITENTE: z.email(),
  CORREO_GESTOR: z.email(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_CALENDAR_ID: z.string().min(1),
});

export type Env = z.infer<typeof esquema>;

/** Valida el entorno y lanza con un mensaje que nombra cada variable faltante o inválida (RS-NF-014). */
export function leerEnv(fuente: Record<string, string | undefined> = process.env): Env {
  const r = esquema.safeParse(fuente);
  if (r.success) return r.data;
  const detalle = r.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Variables de entorno faltantes o inválidas (ver .env.example):\n${detalle}`);
}
