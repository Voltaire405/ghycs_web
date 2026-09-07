/** Cálculo de disponibilidad: función pura, sin red ni base de datos (RS-F-003). */

export type Intervalo = { inicio: Date; fin: Date };

export type HorarioBase = {
  /** Días de atención en numeración ISO: 1 lunes … 7 domingo (RS-F-001). */
  dias: number[];
  /** Franjas `[inicio, fin]` en hora de `America/Bogota`, formato `HH:MM`. */
  franjas: [string, string][];
  duracionMinutos: number;
  anticipacionHoras: number;
  horizonteDias: number;
};

const MINUTO = 60_000;

/** Colombia no observa horario de verano: `America/Bogota` es UTC−05:00 todo el año. */
const instante = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00-05:00`);

/** Fecha `YYYY-MM-DD` a la que pertenece un instante en `America/Bogota`. */
export const diaEnBogota = (d: Date) => new Date(d.getTime() - 5 * 3600_000).toISOString().slice(0, 10);

/** Primer y último instante de un día de `America/Bogota`. */
export const limitesDelDia = (fecha: string) => ({
  desde: instante(fecha, "00:00"),
  hasta: instante(fecha, "23:59"),
});

const diaIso = (fecha: string) => {
  const d = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
};

/**
 * Horas de inicio de una fecha que caben en el horario base, no se solapan con la
 * ocupación y respetan anticipación mínima y horizonte (RS-F-002).
 */
export function calcularDisponibilidad(
  fecha: string,
  horario: HorarioBase,
  ocupados: Intervalo[],
  ahora: Date,
): Date[] {
  if (!horario.dias.includes(diaIso(fecha))) return [];

  const duracion = horario.duracionMinutos * MINUTO;
  const desde = ahora.getTime() + horario.anticipacionHoras * 60 * MINUTO;
  const hasta = ahora.getTime() + horario.horizonteDias * 24 * 60 * MINUTO;
  const libre = (inicio: number) =>
    ocupados.every((o) => inicio + duracion <= o.inicio.getTime() || inicio >= o.fin.getTime());

  const disponibles: Date[] = [];
  for (const [abre, cierra] of horario.franjas) {
    const fin = instante(fecha, cierra).getTime();
    for (let t = instante(fecha, abre).getTime(); t + duracion <= fin; t += duracion) {
      if (t >= desde && t <= hasta && libre(t)) disponibles.push(new Date(t));
    }
  }
  return disponibles;
}
