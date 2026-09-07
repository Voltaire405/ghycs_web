/** Enumeraciones del glosario (RS-D-003). */
export const TIPOS_PRESTADOR = ["ips", "profesional_independiente", "objeto_social_diferente"] as const;
export const MOMENTOS = ["habilitacion_inicial", "novedad", "hallazgo", "cierre_servicio"] as const;
export const ESTADOS_CITA = ["agendada", "cancelada", "atendida", "no_asistio"] as const;

export type TipoPrestador = (typeof TIPOS_PRESTADOR)[number];
export type Momento = (typeof MOMENTOS)[number];
export type EstadoCita = (typeof ESTADOS_CITA)[number];

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

export type Solicitud = SolicitudNueva & { token: string; creadaEn: Date; citaEstado: EstadoCita };

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
