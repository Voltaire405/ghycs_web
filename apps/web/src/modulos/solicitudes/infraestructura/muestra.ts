import { diaEnBogota } from "../dominio/disponibilidad";
import type { EstadoCita, Solicitud } from "../dominio/solicitud";

/**
 * Tokens de muestra de la fase 1, uno por estado más una cita pasada, para recorrer
 * `/solicitud/{token}` sin base de datos. Desaparecen con el repositorio de PostgreSQL.
 */
const MUESTRAS: [token: string, citaEstado: EstadoCita, diasDesdeHoy: number][] = [
  ["muestra-agendada", "agendada", 7],
  ["muestra-cancelada", "cancelada", 7],
  ["muestra-atendida", "atendida", -7],
  ["muestra-no-asistio", "no_asistio", -7],
  ["muestra-pasada", "agendada", -1],
];

const aLasOcho = (ahora: Date, dias: number) =>
  new Date(`${diaEnBogota(new Date(ahora.getTime() + dias * 86_400_000))}T08:00:00-05:00`);

export const solicitudesDeMuestra = (ahora: Date): Solicitud[] =>
  MUESTRAS.map(([token, citaEstado, dias]) => ({
    token,
    citaEstado,
    citaInicio: aLasOcho(ahora, dias),
    creadaEn: new Date(ahora.getTime() - 3 * 86_400_000),
    nombre: "Clínica San Rafael",
    correo: "contacto@ejemplo.co",
    telefono: "3001234567",
    tipoPrestador: "ips",
    momento: "habilitacion_inicial",
    descripcion: "Habilitación de consulta externa.",
    autorizacionDatos: true,
  }));
