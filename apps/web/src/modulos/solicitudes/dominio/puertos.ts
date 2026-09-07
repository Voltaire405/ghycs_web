import type { Intervalo } from "./disponibilidad";
import type { Solicitud, SolicitudNueva } from "./solicitud";

/** Puertos de salida del módulo; los adaptadores viven en `infraestructura/` (RS-R-004). */

export interface Ocupacion {
  /** Intervalos ocupados del gestor entre dos instantes. Lanza si la consulta falla (RS-F-009). */
  consultar(desde: Date, hasta: Date): Promise<Intervalo[]>;
}

export interface RepositorioSolicitudes {
  /** Citas ya agendadas en el rango; también ocupan el horario (RS-F-002). */
  agendadas(desde: Date, hasta: Date): Promise<Intervalo[]>;

  /** Guarda la solicitud; devuelve `null` si la hora ya está tomada (RS-F-007). */
  guardar(nueva: SolicitudNueva): Promise<Solicitud | null>;

  /** Solicitud del enlace privado; `null` si el token no existe (RS-F-012). */
  porToken(token: string): Promise<Solicitud | null>;

  /** Persiste la solicitud que el dominio ya transformó (RS-F-014). */
  actualizar(solicitud: Solicitud): Promise<void>;
}

export interface Reloj {
  ahora(): Date;
}
