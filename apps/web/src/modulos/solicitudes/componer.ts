import { conectar } from "@/compartido/bd/cliente";
import { leerEnv } from "@/compartido/config/env";
import { componerCasos } from "./casos";
import type { Ocupacion } from "./dominio/puertos";
import { diaEnBogota } from "./dominio/disponibilidad";
import { relojDelSistema } from "./infraestructura/falsos";
import { leerHorarioBase } from "./infraestructura/horario-base";
import { repositorioTurso } from "./infraestructura/repositorio-turso";

/**
 * Composición del módulo: las solicitudes viven en Turso (ADR-0007). La ocupación sigue
 * siendo de muestra hasta el adaptador de FreeBusy, para que el estado «horario ocupado» sea visible.
 */
const env = leerEnv();
const horario = leerHorarioBase();

/** Muestra: el gestor tiene ocupada la media mañana de todos los días. */
const ocupacion: Ocupacion = {
  async consultar(desde) {
    const dia = diaEnBogota(desde);
    return [{ inicio: new Date(`${dia}T09:00:00-05:00`), fin: new Date(`${dia}T11:00:00-05:00`) }];
  },
};

export const casos = componerCasos({
  ocupacion,
  repositorio: repositorioTurso(
    conectar({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN }),
    horario.duracionMinutos,
  ),
  reloj: relojDelSistema,
  horario,
});
