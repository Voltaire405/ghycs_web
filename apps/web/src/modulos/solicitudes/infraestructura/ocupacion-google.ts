import type { Ocupacion } from "../dominio/puertos";
import { jsonOLanza, limite, tokenDeAcceso, type CredencialesGoogle } from "./google";

type RespuestaFreeBusy = {
  calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: { reason: string }[] }>;
};

/**
 * Ocupación del gestor según FreeBusy de su Google Calendar (ADR-0004). Cualquier falla
 * —token, red, calendario inexistente— lanza, para que no se ofrezca ningún horario (RS-F-009).
 */
export function ocupacionGoogle(credenciales: CredencialesGoogle, fetch = globalThis.fetch): Ocupacion {
  return {
    async consultar(desde, hasta) {
      const acceso = await tokenDeAcceso(credenciales, fetch);
      const respuesta = await jsonOLanza<RespuestaFreeBusy>(
        await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
          method: "POST",
          signal: limite(),
          headers: { authorization: `Bearer ${acceso}`, "content-type": "application/json" },
          body: JSON.stringify({
            timeMin: desde.toISOString(),
            timeMax: hasta.toISOString(),
            items: [{ id: credenciales.calendarId }],
          }),
        }),
      );
      // Se pide un solo calendario: se toma sin depender de cómo Google escriba su clave («primary» o el correo).
      const [calendario] = Object.values(respuesta.calendars ?? {});
      if (!calendario || calendario.errors?.length) {
        throw new Error(`FreeBusy sin datos del calendario: ${JSON.stringify(calendario?.errors ?? "ausente")}`);
      }
      return (calendario.busy ?? []).map((b) => ({ inicio: new Date(b.start), fin: new Date(b.end) }));
    },
  };
}
