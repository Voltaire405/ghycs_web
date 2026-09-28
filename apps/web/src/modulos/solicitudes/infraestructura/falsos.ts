import type { Intervalo } from "../dominio/disponibilidad";
import type { Calendario, EventoCita, Ocupacion, RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import type { Solicitud, SolicitudNueva } from "../dominio/solicitud";

/**
 * Adaptadores en memoria de la fase 1: los mismos que usan las pruebas de los casos de
 * uso. Se reemplazan por Google Calendar y Turso, no se descartan.
 */

export const relojDelSistema: Reloj = { ahora: () => new Date() };

export function ocupacionEnMemoria(intervalos: Intervalo[] = [], falla = false): Ocupacion {
  return {
    async consultar(desde, hasta) {
      if (falla) throw new Error("ocupación no disponible");
      return intervalos.filter((i) => i.fin > desde && i.inicio < hasta);
    },
  };
}

/** Calendario que guarda los eventos creados; con `falla` lanza como Google caído. */
export function calendarioEnMemoria(falla = false): Calendario & { eventos: EventoCita[]; ids: string[] } {
  const eventos: EventoCita[] = [];
  const ids: string[] = [];
  return {
    eventos,
    ids,
    async crearEvento(evento) {
      if (falla) throw new Error("calendario no disponible");
      eventos.push(evento);
      ids.push(crypto.randomUUID());
      return ids.at(-1)!;
    },
  };
}

export function repositorioEnMemoria(duracionMinutos: number, guardadas: Solicitud[] = []): RepositorioSolicitudes {
  return {
    async agendadas(desde, hasta) {
      // Solo la cancelación libera la hora; atendida y no asistió la conservan (RS-D-002).
      return guardadas
        .filter((s) => s.citaEstado !== "cancelada")
        .map((s) => ({ inicio: s.citaInicio, fin: new Date(s.citaInicio.getTime() + duracionMinutos * 60_000) }))
        .filter((i) => i.fin > desde && i.inicio < hasta);
    },
    async guardar(nueva: SolicitudNueva) {
      const tomada = guardadas.some(
        (s) => s.citaEstado !== "cancelada" && s.citaInicio.getTime() === nueva.citaInicio.getTime(),
      );
      if (tomada) return null;
      const solicitud: Solicitud = {
        ...nueva,
        id: crypto.randomUUID(),
        token: crypto.randomUUID(),
        creadaEn: new Date(),
        citaEstado: "agendada",
        sincronizacion: "pendiente",
        notasGestor: "",
        eventoId: null,
      };
      guardadas.push(solicitud);
      return solicitud;
    },
    async todas() {
      return [...guardadas];
    },
    async porId(id) {
      return guardadas.find((s) => s.id === id) ?? null;
    },
    async porToken(token) {
      return guardadas.find((s) => s.token === token) ?? null;
    },
    async actualizar(solicitud) {
      const i = guardadas.findIndex((s) => s.id === solicitud.id);
      if (i < 0) throw new Error(`solicitud desconocida: ${solicitud.id}`);
      guardadas[i] = solicitud;
    },
  };
}
