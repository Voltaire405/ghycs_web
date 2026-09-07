import { porUrgencia, type Solicitud } from "../dominio/solicitud";
import type { RepositorioSolicitudes } from "../dominio/puertos";

/** Lectura del listado de `/admin`. El orden es una regla del dominio (RS-F-018, RS-R-006). */
export function listarSolicitudes(puertos: { repositorio: RepositorioSolicitudes }) {
  return {
    async ejecutar(): Promise<Solicitud[]> {
      return (await puertos.repositorio.todas()).sort(porUrgencia);
    },
  };
}
