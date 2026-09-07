/** Los tiempos se guardan en UTC y se presentan en `America/Bogota` (SRD §3.3, RS-F-011). */
const opciones = { timeZone: "America/Bogota" } as const;

export const fechaLarga = (d: Date) =>
  new Intl.DateTimeFormat("es-CO", { ...opciones, dateStyle: "full" }).format(d);

export const horaCorta = (d: Date) =>
  new Intl.DateTimeFormat("es-CO", { ...opciones, hour: "2-digit", minute: "2-digit", hour12: true }).format(d);

/** Fecha `YYYY-MM-DD` de un instante en `America/Bogota` (UTC−05:00 todo el año). */
export const diaEnBogota = (d: Date) => new Date(d.getTime() - 5 * 3600_000).toISOString().slice(0, 10);
