import { calcularDisponibilidad, diaEnBogota, limitesDelDia, type HorarioBase } from "../dominio/disponibilidad";
import type { Ocupacion, RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import type { Solicitud, SolicitudNueva } from "../dominio/solicitud";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

export type ErrorCrearSolicitud = "horario-no-disponible" | "horario-ocupado" | "ocupacion-no-disponible";

/**
 * Crea la solicitud tras revalidar la hora contra la disponibilidad del momento.
 * `horario-no-disponible` es la hora que nunca se ofreció (RS-F-005); `horario-ocupado`,
 * la que el candado rechaza al guardar (RS-F-007).
 */
export function crearSolicitud(puertos: {
  repositorio: RepositorioSolicitudes;
  ocupacion: Ocupacion;
  reloj: Reloj;
  horario: HorarioBase;
}) {
  return {
    async ejecutar(comando: SolicitudNueva): Promise<Resultado<Solicitud, ErrorCrearSolicitud>> {
      const dia = diaEnBogota(comando.citaInicio);
      const { desde, hasta } = limitesDelDia(dia);
      let ocupados;
      try {
        ocupados = [
          ...(await puertos.ocupacion.consultar(desde, hasta)),
          ...(await puertos.repositorio.agendadas(desde, hasta)),
        ];
      } catch {
        return fallo("ocupacion-no-disponible");
      }
      const libres = calcularDisponibilidad(dia, puertos.horario, ocupados, puertos.reloj.ahora());
      if (!libres.some((h) => h.getTime() === comando.citaInicio.getTime())) return fallo("horario-no-disponible");

      const guardada = await puertos.repositorio.guardar(comando);
      return guardada ? exito(guardada) : fallo("horario-ocupado");
    },
  };
}
