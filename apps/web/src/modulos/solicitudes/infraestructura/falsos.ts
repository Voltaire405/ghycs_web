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

export function repositorioEnMemoria(
  duracionMinutos: number,
  guardadas: Solicitud[] = [],
): RepositorioSolicitudes & { todas(): Solicitud[] } {
  return {
    async agendadas(desde, hasta) {
      return guardadas
        .map((s) => ({ inicio: s.citaInicio, fin: new Date(s.citaInicio.getTime() + duracionMinutos * 60_000) }))
        .filter((i) => i.fin > desde && i.inicio < hasta);
    },
    async guardar(nueva: SolicitudNueva) {
      if (guardadas.some((s) => s.citaInicio.getTime() === nueva.citaInicio.getTime())) return null;
      const solicitud: Solicitud = { ...nueva, token: crypto.randomUUID(), creadaEn: new Date() };
      guardadas.push(solicitud);
      return solicitud;
    },
    todas: () => guardadas,
  };
}
