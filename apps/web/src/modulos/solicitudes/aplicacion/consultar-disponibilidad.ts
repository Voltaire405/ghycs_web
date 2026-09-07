import { calcularDisponibilidad, limitesDelDia, type HorarioBase } from "../dominio/disponibilidad";
import type { Ocupacion, RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

export type ErrorDisponibilidad = "ocupacion-no-disponible";

/** Horas libres de una fecha; sin ocupación conocida no se ofrece ninguna (ADR-0004, RS-F-009). */
export function consultarDisponibilidad(puertos: { ocupacion: Ocupacion; repositorio: RepositorioSolicitudes; reloj: Reloj; horario: HorarioBase }) {
  return {
    async ejecutar(comando: { fecha: string }): Promise<Resultado<Date[], ErrorDisponibilidad>> {
      const ahora = puertos.reloj.ahora();
      const { desde, hasta } = limitesDelDia(comando.fecha);
      try {
        const ocupados = [
          ...(await puertos.ocupacion.consultar(desde, hasta)),
          ...(await puertos.repositorio.agendadas(desde, hasta)),
        ];
        return exito(calcularDisponibilidad(comando.fecha, puertos.horario, ocupados, ahora));
      } catch {
        return fallo("ocupacion-no-disponible");
      }
    },
  };
}
