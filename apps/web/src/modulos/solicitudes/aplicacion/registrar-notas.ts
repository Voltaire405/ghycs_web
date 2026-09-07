import type { RepositorioSolicitudes } from "../dominio/puertos";
import { fallo, exito, type Resultado } from "@/compartido/tipos/resultado";

/** Las notas del gestor no dependen del estado de la cita (RS-F-022). */
export function registrarNotas(puertos: { repositorio: RepositorioSolicitudes }) {
  return {
    async ejecutar(comando: { id: string; notas: string }): Promise<Resultado<null, "no-encontrada">> {
      const solicitud = await puertos.repositorio.porId(comando.id);
      if (!solicitud) return fallo("no-encontrada");

      await puertos.repositorio.actualizar({ ...solicitud, notasGestor: comando.notas });
      return exito(null);
    },
  };
}
