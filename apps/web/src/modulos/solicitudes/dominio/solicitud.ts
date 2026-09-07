/** Enumeraciones del glosario (RS-D-003). */
export const TIPOS_PRESTADOR = ["ips", "profesional_independiente", "objeto_social_diferente"] as const;
export const MOMENTOS = ["habilitacion_inicial", "novedad", "hallazgo", "cierre_servicio"] as const;
export const ESTADOS_CITA = ["agendada", "cancelada", "atendida", "no_asistio"] as const;
export const SINCRONIZACIONES = ["ok", "pendiente"] as const;

/** Estados a los que el gestor cierra una cita agendada (RS-F-021). */
export const CIERRES_DEL_GESTOR = ["atendida", "no_asistio"] as const;

export type TipoPrestador = (typeof TIPOS_PRESTADOR)[number];
export type Momento = (typeof MOMENTOS)[number];
export type EstadoCita = (typeof ESTADOS_CITA)[number];
export type Sincronizacion = (typeof SINCRONIZACIONES)[number];
export type CierreDelGestor = (typeof CIERRES_DEL_GESTOR)[number];

export type SolicitudNueva = {
  nombre: string;
  correo: string;
  telefono: string;
  tipoPrestador: TipoPrestador;
  momento: Momento;
  descripcion: string;
  citaInicio: Date;
  autorizacionDatos: true;
};

export type Solicitud = SolicitudNueva & {
  id: string;
  token: string;
  creadaEn: Date;
  citaEstado: EstadoCita;
  sincronizacion: Sincronizacion;
  notasGestor: string;
};

/**
 * Rango de urgencia del momento: el cierre del servicio es la situación más grave y la
 * habilitación inicial la que más espera (`CONTEXT.md`, RS-F-018).
 */
const URGENCIA: Record<Momento, number> = {
  cierre_servicio: 0,
  hallazgo: 1,
  novedad: 2,
  habilitacion_inicial: 3,
};

/** Orden del listado del gestor: por urgencia y, dentro de cada rango, por hora de cita (RS-F-018). */
export const porUrgencia = (a: Solicitud, b: Solicitud) =>
  URGENCIA[a.momento] - URGENCIA[b.momento] || a.citaInicio.getTime() - b.citaInicio.getTime();

/** Solo se cancela una cita agendada cuyo inicio aún no llega (RS-F-013). */
export const puedeCancelarse = (solicitud: Solicitud, ahora: Date) =>
  solicitud.citaEstado === "agendada" && solicitud.citaInicio > ahora;

/**
 * Única transición que provoca el prospecto: el resto de la solicitud queda igual. Devuelve
 * `null` cuando la regla no la permite, para que ningún llamador la aplique sin evaluarla
 * (RS-F-014, RS-F-039).
 */
export const citaCancelada = (solicitud: Solicitud, ahora: Date): Solicitud | null =>
  puedeCancelarse(solicitud, ahora) ? { ...solicitud, citaEstado: "cancelada" } : null;

/**
 * Cierre que provoca el gestor: solo una cita agendada se marca atendida o no asistió.
 * Devuelve `null` cuando la regla no lo permite (RS-F-021, RS-F-039).
 */
export const citaCerrada = (solicitud: Solicitud, estado: CierreDelGestor): Solicitud | null =>
  solicitud.citaEstado === "agendada" ? { ...solicitud, citaEstado: estado } : null;
