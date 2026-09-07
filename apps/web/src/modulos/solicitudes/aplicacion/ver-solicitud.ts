import type { Solicitud } from "../dominio/solicitud";
import type { RepositorioSolicitudes } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

/** Lectura del detalle; el identificador desconocido no existe para el gestor (RS-F-021). */
export function verSolicitud(puertos: { repositorio: RepositorioSolicitudes }) {
  return {
    async ejecutar(comando: { id: string }): Promise<Resultado<Solicitud, "no-encontrada">> {
      const solicitud = await puertos.repositorio.porId(comando.id);
      return solicitud ? exito(solicitud) : fallo("no-encontrada");
    },
  };
}
