import { and, eq, gt, lt, ne } from "drizzle-orm";
import type { Bd } from "@/compartido/bd/cliente";
import type { RepositorioSolicitudes } from "../dominio/puertos";
import type { Solicitud } from "../dominio/solicitud";
import { solicitudes } from "./esquema";

type Fila = typeof solicitudes.$inferSelect;

const aSolicitud = ({ autorizacionDatos, ...fila }: Fila): Solicitud => {
  if (!autorizacionDatos) throw new Error(`solicitud sin autorización de datos: ${fila.id}`);
  return { ...fila, autorizacionDatos };
};

/** El índice `una_cita_por_hora` rechazó la fila: la hora ya está tomada (RS-F-007). */
const esHoraTomada = (e: unknown): boolean =>
  e instanceof Error && (/UNIQUE constraint failed: solicitudes\.cita_inicio/.test(e.message) || esHoraTomada(e.cause));

/** Repositorio en Turso (libSQL); la regla de una cita por hora la hace cumplir la base (ADR-0003, ADR-0007). */
export function repositorioTurso(bd: Bd, duracionMinutos: number): RepositorioSolicitudes {
  const duracion = duracionMinutos * 60_000;
  return {
    async agendadas(desde, hasta) {
      const filas = await bd
        .select({ inicio: solicitudes.citaInicio })
        .from(solicitudes)
        .where(
          and(
            ne(solicitudes.citaEstado, "cancelada"),
            gt(solicitudes.citaInicio, new Date(desde.getTime() - duracion)),
            lt(solicitudes.citaInicio, hasta),
          ),
        );
      return filas.map(({ inicio }) => ({ inicio, fin: new Date(inicio.getTime() + duracion) }));
    },
    async guardar(nueva) {
      const solicitud: Solicitud = {
        ...nueva,
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        creadaEn: new Date(),
        citaEstado: "agendada",
        sincronizacion: "ok",
        notasGestor: "",
        eventoId: null,
      };
      try {
        await bd.insert(solicitudes).values(solicitud);
        return solicitud;
      } catch (e) {
        if (esHoraTomada(e)) return null;
        throw e;
      }
    },
    async todas() {
      return (await bd.select().from(solicitudes)).map(aSolicitud);
    },
    async porId(id) {
      const [fila] = await bd.select().from(solicitudes).where(eq(solicitudes.id, id));
      return fila ? aSolicitud(fila) : null;
    },
    async porToken(token) {
      const [fila] = await bd.select().from(solicitudes).where(eq(solicitudes.token, token));
      return fila ? aSolicitud(fila) : null;
    },
    async actualizar({ id, ...cambios }) {
      const r = await bd.update(solicitudes).set(cambios).where(eq(solicitudes.id, id));
      if (r.rowsAffected === 0) throw new Error(`solicitud desconocida: ${id}`);
    },
  };
}
