import { consultarDisponibilidad } from "./aplicacion/consultar-disponibilidad";
import { crearSolicitud } from "./aplicacion/crear-solicitud";
import { cancelarCita } from "./aplicacion/cancelar-cita";
import { consultarPorToken } from "./aplicacion/consultar-por-token";
import { listarSolicitudes } from "./aplicacion/listar-solicitudes";
import { verSolicitud } from "./aplicacion/ver-solicitud";
import { actualizarCita } from "./aplicacion/actualizar-cita";
import { registrarNotas } from "./aplicacion/registrar-notas";
import type { HorarioBase } from "./dominio/disponibilidad";
import type { Calendario, Ocupacion, RepositorioSolicitudes, Reloj } from "./dominio/puertos";

/** Casos de uso del módulo sobre los puertos que se le den; `componer.ts` le pasa los reales. */
export function componerCasos(puertos: {
  ocupacion: Ocupacion;
  calendario: Calendario;
  repositorio: RepositorioSolicitudes;
  reloj: Reloj;
  horario: HorarioBase;
}) {
  const { repositorio, reloj } = puertos;
  return {
    consultarDisponibilidad: consultarDisponibilidad(puertos),
    crearSolicitud: crearSolicitud(puertos),
    consultarPorToken: consultarPorToken({ repositorio, reloj }),
    cancelarCita: cancelarCita(puertos),
    listarSolicitudes: listarSolicitudes({ repositorio }),
    verSolicitud: verSolicitud({ repositorio }),
    actualizarCita: actualizarCita({ repositorio }),
    registrarNotas: registrarNotas({ repositorio }),
  };
}
