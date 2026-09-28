import type { Intervalo } from "./disponibilidad";
import type { Solicitud, SolicitudNueva } from "./solicitud";

/** Puertos de salida del módulo; los adaptadores viven en `infraestructura/` (RS-R-004). */

export interface Ocupacion {
  /** Intervalos ocupados del gestor entre dos instantes. Lanza si la consulta falla (RS-F-009). */
  consultar(desde: Date, hasta: Date): Promise<Intervalo[]>;
}

/** Cita en el calendario del gestor, con videollamada y el prospecto invitado. */
export interface EventoCita {
  titulo: string;
  inicio: Date;
  fin: Date;
  invitado: string;
}

export interface Calendario {
  /** Crea el evento con videollamada e invita al prospecto; devuelve su identificador. Lanza si falla (RP-F-010). */
  crearEvento(evento: EventoCita): Promise<string>;

  /** Retira el evento y avisa al prospecto de la cancelación. Si el evento ya no existe, cuenta como retirado. Lanza si falla (RP-F-023). */
  retirarEvento(id: string): Promise<void>;
}

/** Lo que el prospecto necesita para volver a su cita: la hora y el enlace privado de su token. */
export interface ConfirmacionCita {
  para: string;
  nombre: string;
  inicio: Date;
  token: string;
}

export interface Correo {
  /** Envía al prospecto la confirmación con la fecha, la hora y el enlace privado. Lanza si falla (RP-F-021). */
  enviarConfirmacion(confirmacion: ConfirmacionCita): Promise<void>;
}

export interface RepositorioSolicitudes {
  /** Citas ya agendadas en el rango; también ocupan el horario (RS-F-002). */
  agendadas(desde: Date, hasta: Date): Promise<Intervalo[]>;

  /** Guarda la solicitud; devuelve `null` si la hora ya está tomada (RS-F-007). */
  guardar(nueva: SolicitudNueva): Promise<Solicitud | null>;

  /** Todas las solicitudes; el orden lo pone el dominio (RS-F-018). */
  todas(): Promise<Solicitud[]>;

  /** Solicitud por identificador interno; `null` si no existe (RS-F-021). */
  porId(id: string): Promise<Solicitud | null>;

  /** Solicitud del enlace privado; `null` si el token no existe (RS-F-012). */
  porToken(token: string): Promise<Solicitud | null>;

  /** Persiste la solicitud que el dominio ya transformó (RS-F-014). */
  actualizar(solicitud: Solicitud): Promise<void>;
}

export interface Reloj {
  ahora(): Date;
}
