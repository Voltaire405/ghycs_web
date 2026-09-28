import { conectar } from "@/compartido/bd/cliente";
import { leerEnv } from "@/compartido/config/env";
import { componerCasos } from "./casos";
import { calendarioGoogle } from "./infraestructura/calendario-google";
import { relojDelSistema } from "./infraestructura/falsos";
import { leerHorarioBase } from "./infraestructura/horario-base";
import { ocupacionGoogle } from "./infraestructura/ocupacion-google";
import { repositorioTurso } from "./infraestructura/repositorio-turso";

/**
 * Composición del módulo: las solicitudes viven en Turso (ADR-0007); la ocupación sale de FreeBusy
 * (ADR-0004) y las citas se crean en el mismo calendario, con la credencial de servidor.
 */
const env = leerEnv();
const horario = leerHorarioBase();
const google = {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  refreshToken: env.GOOGLE_REFRESH_TOKEN,
  calendarId: env.GOOGLE_CALENDAR_ID,
};

export const casos = componerCasos({
  ocupacion: ocupacionGoogle(google),
  calendario: calendarioGoogle(google),
  repositorio: repositorioTurso(
    conectar({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN }),
    horario.duracionMinutos,
  ),
  reloj: relojDelSistema,
  horario,
});
