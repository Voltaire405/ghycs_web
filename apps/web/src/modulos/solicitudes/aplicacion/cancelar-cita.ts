import { citaCancelada } from "../dominio/solicitud";
import type { RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

export type ErrorCancelar = "no-encontrada" | "no-cancelable";

/** Cancela desde el enlace privado; la regla y la transición son del dominio (RS-F-013, RS-F-014, RS-R-006). */
export function cancelarCita(puertos: { repositorio: RepositorioSolicitudes; reloj: Reloj }) {
  return {
    async ejecutar(comando: { token: string }): Promise<Resultado<null, ErrorCancelar>> {
      const solicitud = await puertos.repositorio.porToken(comando.token);
      if (!solicitud) return fallo("no-encontrada");

      const cancelada = citaCancelada(solicitud, puertos.reloj.ahora());
      if (!cancelada) return fallo("no-cancelable");

      await puertos.repositorio.actualizar(cancelada);
      return exito(null);
    },
  };
}
