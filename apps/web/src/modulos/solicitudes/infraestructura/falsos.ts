import type { Intervalo } from "../dominio/disponibilidad";
import type { Ocupacion, RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import type { Solicitud, SolicitudNueva } from "../dominio/solicitud";

/**
 * Adaptadores en memoria de la fase 1: los mismos que usan las pruebas de los casos de
 * uso. Se reemplazan por Google Calendar y PostgreSQL, no se descartan.
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
        sincronizacion: "ok",
        notasGestor: "",
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
