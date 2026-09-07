import { z } from "zod";
import type { HorarioBase } from "../dominio/disponibilidad";

const esquema = z.object({
  HORARIO_DIAS: z.string().default("1,2,3,4,5"),
  HORARIO_FRANJAS: z.string().default("08:00-12:00,14:00-17:00"),
  CITA_DURACION_MINUTOS: z.coerce.number().int().positive().default(45),
  ANTICIPACION_MINIMA_HORAS: z.coerce.number().int().nonnegative().default(24),
  HORIZONTE_MAXIMO_DIAS: z.coerce.number().int().positive().default(30),
});

/**
 * Horario base leído de variables de entorno; no es dato administrado (RS-F-001, ADR-0004).
 * ponytail: los valores por defecto dejan correr la fase 1 sin `.env.local`; quítalos
 * cuando el despliegue real exista, para que un horario sin configurar falle al arrancar.
 */
export function leerHorarioBase(fuente: Record<string, string | undefined> = process.env): HorarioBase {
  const v = esquema.parse(fuente);
  return {
    dias: v.HORARIO_DIAS.split(",").map(Number),
    franjas: v.HORARIO_FRANJAS.split(",").map((f) => f.split("-") as [string, string]),
    duracionMinutos: v.CITA_DURACION_MINUTOS,
    anticipacionHoras: v.ANTICIPACION_MINIMA_HORAS,
    horizonteDias: v.HORIZONTE_MAXIMO_DIAS,
  };
}
