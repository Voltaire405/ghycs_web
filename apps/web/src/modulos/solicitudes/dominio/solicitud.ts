/** Enumeraciones del glosario (RS-D-003). */
export const TIPOS_PRESTADOR = ["ips", "profesional_independiente", "objeto_social_diferente"] as const;
export const MOMENTOS = ["habilitacion_inicial", "novedad", "hallazgo", "cierre_servicio"] as const;

export type TipoPrestador = (typeof TIPOS_PRESTADOR)[number];
export type Momento = (typeof MOMENTOS)[number];

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

export type Solicitud = SolicitudNueva & { token: string; creadaEn: Date };
