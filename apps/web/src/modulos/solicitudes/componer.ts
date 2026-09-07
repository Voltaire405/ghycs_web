import { consultarDisponibilidad } from "./aplicacion/consultar-disponibilidad";
import { crearSolicitud } from "./aplicacion/crear-solicitud";
import { relojDelSistema, repositorioEnMemoria } from "./infraestructura/falsos";
import type { Ocupacion } from "./dominio/puertos";
import { diaEnBogota } from "./dominio/disponibilidad";
import { leerHorarioBase } from "./infraestructura/horario-base";
import { solicitudesDeMuestra } from "./infraestructura/muestra";
import { cancelarCita } from "./aplicacion/cancelar-cita";
import { consultarPorToken } from "./aplicacion/consultar-por-token";

/**
 * Composición del módulo. Fase 1: ocupación y repositorio en memoria, con una ocupación
 * de muestra para que el estado «horario ocupado» sea visible. Las solicitudes de muestra viven
 * en el proceso: lo que se cancele sigue cancelado hasta el siguiente arranque.
 */
const horario = leerHorarioBase();
const reloj = relojDelSistema;

/** Muestra: el gestor tiene ocupada la media mañana de todos los días. */
const ocupacion: Ocupacion = {
  async consultar(desde) {
    const dia = diaEnBogota(desde);
    return [{ inicio: new Date(`${dia}T09:00:00-05:00`), fin: new Date(`${dia}T11:00:00-05:00`) }];
  },
};
const repositorio = repositorioEnMemoria(horario.duracionMinutos, solicitudesDeMuestra(reloj.ahora()));

export const casos = {
  consultarDisponibilidad: consultarDisponibilidad({ ocupacion, repositorio, reloj, horario }),
  crearSolicitud: crearSolicitud({ repositorio, ocupacion, reloj, horario }),
  consultarPorToken: consultarPorToken({ repositorio, reloj }),
  cancelarCita: cancelarCita({ repositorio, reloj }),
};
