import { diaEnBogota } from "../dominio/disponibilidad";
import type { Solicitud } from "../dominio/solicitud";

/**
 * Solicitudes de muestra de la fase 1: una por estado de la cita más una cita pasada para
 * recorrer `/solicitud/{token}`, y los cuatro momentos con y sin sincronización pendiente
 * para el listado del gestor. Desaparecen con el repositorio de PostgreSQL.
 */
type Muestra = Pick<Solicitud, "token" | "citaEstado" | "momento" | "sincronizacion" | "nombre" | "tipoPrestador"> & {
  diasDesdeHoy: number;
};

const MUESTRAS: Muestra[] = [
  { token: "muestra-agendada", citaEstado: "agendada", diasDesdeHoy: 7, momento: "habilitacion_inicial", sincronizacion: "ok", nombre: "Clínica San Rafael", tipoPrestador: "ips" },
  { token: "muestra-cancelada", citaEstado: "cancelada", diasDesdeHoy: 7, momento: "novedad", sincronizacion: "ok", nombre: "Centro Médico La Palma", tipoPrestador: "ips" },
  { token: "muestra-atendida", citaEstado: "atendida", diasDesdeHoy: -7, momento: "hallazgo", sincronizacion: "pendiente", nombre: "Laura Restrepo Vélez", tipoPrestador: "profesional_independiente" },
  { token: "muestra-no-asistio", citaEstado: "no_asistio", diasDesdeHoy: -7, momento: "novedad", sincronizacion: "ok", nombre: "Unidad Renal del Norte", tipoPrestador: "ips" },
  { token: "muestra-pasada", citaEstado: "agendada", diasDesdeHoy: -1, momento: "cierre_servicio", sincronizacion: "pendiente", nombre: "IPS Salud Integral", tipoPrestador: "ips" },
  { token: "muestra-cierre", citaEstado: "agendada", diasDesdeHoy: 3, momento: "cierre_servicio", sincronizacion: "ok", nombre: "Fundación Vida Nueva", tipoPrestador: "objeto_social_diferente" },
  { token: "muestra-hallazgo", citaEstado: "agendada", diasDesdeHoy: 5, momento: "hallazgo", sincronizacion: "ok", nombre: "Colegio Santa Teresa", tipoPrestador: "objeto_social_diferente" },
];

const DESCRIPCIONES: Record<Solicitud["momento"], string> = {
  habilitacion_inicial: "Quiere abrir consulta externa y aún no tiene el servicio.",
  novedad: "Va a agregar un servicio al REPS y quiere revisar los estándares.",
  hallazgo: "La visita dejó hallazgos en talento humano y necesita plan de mejora.",
  cierre_servicio: "Le cerraron el servicio y debe volver a solicitar visita.",
};

const aLasOcho = (ahora: Date, dias: number) =>
  new Date(`${diaEnBogota(new Date(ahora.getTime() + dias * 86_400_000))}T08:00:00-05:00`);

export const solicitudesDeMuestra = (ahora: Date): Solicitud[] =>
  MUESTRAS.map(({ diasDesdeHoy, ...muestra }, i) => ({
    ...muestra,
    id: `muestra-${i + 1}`,
    notasGestor: "",
    citaInicio: aLasOcho(ahora, diasDesdeHoy),
    creadaEn: new Date(ahora.getTime() - 3 * 86_400_000),
    correo: "contacto@ejemplo.co",
    telefono: "3001234567",
    descripcion: DESCRIPCIONES[muestra.momento],
    autorizacionDatos: true,
  }));
