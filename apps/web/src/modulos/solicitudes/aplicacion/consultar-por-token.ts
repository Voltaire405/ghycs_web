import { puedeCancelarse, type Solicitud } from "../dominio/solicitud";
import type { RepositorioSolicitudes, Reloj } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

export type VistaSolicitud = { solicitud: Solicitud; cancelable: boolean };

/** Lo que muestra el enlace privado; el token desconocido no existe para el sitio (RS-F-012). */
export function consultarPorToken(puertos: { repositorio: RepositorioSolicitudes; reloj: Reloj }) {
  return {
    async ejecutar(comando: { token: string }): Promise<Resultado<VistaSolicitud, "no-encontrada">> {
      const solicitud = await puertos.repositorio.porToken(comando.token);
      if (!solicitud) return fallo("no-encontrada");
      return exito({ solicitud, cancelable: puedeCancelarse(solicitud, puertos.reloj.ahora()) });
    },
  };
}
