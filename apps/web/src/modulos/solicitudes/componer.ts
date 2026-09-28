import { conectar } from "@/compartido/bd/cliente";
import { leerEnv } from "@/compartido/config/env";
import { componerCasos } from "./casos";
import { relojDelSistema } from "./infraestructura/falsos";
import { leerHorarioBase } from "./infraestructura/horario-base";
import { ocupacionGoogle } from "./infraestructura/ocupacion-google";
import { repositorioTurso } from "./infraestructura/repositorio-turso";

/** Composición del módulo: las solicitudes viven en Turso (ADR-0007) y la ocupación sale de FreeBusy (ADR-0004). */
const env = leerEnv();
const horario = leerHorarioBase();

export const casos = componerCasos({
  ocupacion: ocupacionGoogle({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    refreshToken: env.GOOGLE_REFRESH_TOKEN,
    calendarId: env.GOOGLE_CALENDAR_ID,
  }),
  repositorio: repositorioTurso(
    conectar({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN }),
    horario.duracionMinutos,
  ),
  reloj: relojDelSistema,
  horario,
});
