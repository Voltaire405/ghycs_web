import type { Ocupacion } from "../dominio/puertos";

export interface CredencialesGoogle {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
}

type RespuestaFreeBusy = {
  calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: { reason: string }[] }>;
};

/**
 * Ocupación del gestor según FreeBusy de su Google Calendar (ADR-0004). Cualquier falla
 * —token, red, calendario inexistente— lanza, para que no se ofrezca ningún horario (RS-F-009).
 * ponytail: pide un access token en cada consulta; guárdalo hasta que expire si el tráfico lo pide.
 */
export function ocupacionGoogle(credenciales: CredencialesGoogle, fetch = globalThis.fetch): Ocupacion {
  const jsonOLanza = async <T>(r: Response): Promise<T> => {
    if (!r.ok) throw new Error(`Google respondió ${r.status}: ${await r.text()}`);
    return r.json() as Promise<T>;
  };

  return {
    async consultar(desde, hasta) {
      const { access_token } = await jsonOLanza<{ access_token: string }>(
        await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: credenciales.clientId,
            client_secret: credenciales.clientSecret,
            refresh_token: credenciales.refreshToken,
          }),
        }),
      );
      const respuesta = await jsonOLanza<RespuestaFreeBusy>(
        await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
          method: "POST",
          headers: { authorization: `Bearer ${access_token}`, "content-type": "application/json" },
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
