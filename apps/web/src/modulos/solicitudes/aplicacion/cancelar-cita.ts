import { citaCancelada } from "../dominio/solicitud";
import type { Calendario, RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

export type ErrorCancelar = "no-encontrada" | "no-cancelable";

/**
 * Cancela desde el enlace privado; la regla y la transición son del dominio (RS-F-013, RS-F-014, RS-R-006).
 * Al cancelar se retira el evento de la cita (RP-F-023).
 * Como al crear, la solicitud manda: se guarda cancelada y `pendiente` si tiene evento, y pasa a `ok`
 * solo con el evento retirado; si el calendario o esa actualización fallan, la cancelación se mantiene.
 */
export function cancelarCita(puertos: { repositorio: RepositorioSolicitudes; calendario: Calendario; reloj: Reloj }) {
  return {
    async ejecutar(comando: { token: string }): Promise<Resultado<null, ErrorCancelar>> {
      const solicitud = await puertos.repositorio.porToken(comando.token);
      if (!solicitud) return fallo("no-encontrada");

      const cancelada = citaCancelada(solicitud, puertos.reloj.ahora());
      if (!cancelada) return fallo("no-cancelable");

      const { eventoId } = cancelada;
      if (!eventoId) {
        await puertos.repositorio.actualizar(cancelada);
        return exito(null);
      }

      await puertos.repositorio.actualizar({ ...cancelada, sincronizacion: "pendiente" });
      try {
        await puertos.calendario.retirarEvento(eventoId);
        await puertos.repositorio.actualizar({ ...cancelada, sincronizacion: "ok" });
      } catch {
        // Queda `pendiente`: el panel la destaca y el gestor retira el evento a mano.
      }
      return exito(null);
    },
  };
}
