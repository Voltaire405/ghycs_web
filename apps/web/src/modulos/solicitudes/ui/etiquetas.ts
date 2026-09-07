import type { EstadoCita, Momento, TipoPrestador } from "../aplicacion/vistas";

/**
 * Etiquetas visibles de las enumeraciones del glosario. El vocabulario de `CONTEXT.md`
 * manda en el código; la etiqueta puede apartarse de él para que el visitante la entienda
 * (`docs/agents/interfaz.md`).
 */

export const TIPOS_PRESTADOR: Record<TipoPrestador, string> = {
  ips: "IPS",
  profesional_independiente: "Profesional independiente",
  objeto_social_diferente: "Entidad con objeto social diferente",
};

export const MOMENTOS: Record<Momento, string> = {
  habilitacion_inicial: "Habilitación inicial",
  novedad: "Novedad en un servicio ya habilitado",
  hallazgo: "Hallazgo de una visita de verificación",
  cierre_servicio: "Cierre de un servicio",
};

/** Insignia por estado; las variantes son las del sistema visual (`ds-bundle/README.md`). */
export const ESTADOS_CITA: Record<EstadoCita, { etiqueta: string; variante: string }> = {
  agendada: { etiqueta: "Agendada", variante: "insignia-agendada" },
  cancelada: { etiqueta: "Cancelada", variante: "insignia-cancelada" },
  atendida: { etiqueta: "Atendida", variante: "insignia-agendada" },
  no_asistio: { etiqueta: "No asistió", variante: "insignia-pendiente" },
};

/** Opciones de un `<select>` a partir de un mapa de etiquetas. */
export const opciones = <T extends string>(etiquetas: Record<T, string>) =>
  (Object.entries(etiquetas) as [T, string][]).map(([valor, etiqueta]) => ({ valor, etiqueta }));
