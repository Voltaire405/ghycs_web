import { z } from "zod";

/**
 * Solo se exigen las variables que ya tienen consumidor (RS-NF-014). Cada adaptador nuevo
 * agrega aquí las suyas: Google, Resend y el acceso del gestor aún no las leen.
 */
const esquema = z.object({
  DATABASE_URL: z.string().min(1),
  // Vacía en `.env.example`: una base local no lleva token.
  DATABASE_AUTH_TOKEN: z.string().optional().transform((v) => v || undefined),
});

export type Env = z.infer<typeof esquema>;

/** Valida el entorno y lanza con un mensaje que nombra cada variable faltante o inválida (RS-NF-014). */
export function leerEnv(fuente: Record<string, string | undefined> = process.env): Env {
  const r = esquema.safeParse(fuente);
  if (r.success) return r.data;
  const detalle = r.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`Variables de entorno faltantes o inválidas (ver .env.example):\n${detalle}`);
}
