import { citaCerrada, type CierreDelGestor } from "../dominio/solicitud";
import type { RepositorioSolicitudes } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

export type ErrorActualizarCita = "no-encontrada" | "transicion-no-permitida";

/** El gestor cierra la cita; el dominio rechaza toda otra transición (RS-F-021, RS-F-039, RS-R-006). */
export function actualizarCita(puertos: { repositorio: RepositorioSolicitudes }) {
  return {
    async ejecutar(comando: { id: string; estado: CierreDelGestor }): Promise<Resultado<null, ErrorActualizarCita>> {
      const solicitud = await puertos.repositorio.porId(comando.id);
      if (!solicitud) return fallo("no-encontrada");

      const cerrada = citaCerrada(solicitud, comando.estado);
      if (!cerrada) return fallo("transicion-no-permitida");

      await puertos.repositorio.actualizar(cerrada);
      return exito(null);
    },
  };
}
