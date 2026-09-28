import type { Calendario } from "../dominio/puertos";
import { jsonOLanza, limite, tokenDeAcceso, urlCalendario, type CredencialesGoogle } from "./google";

/**
 * Cita en el Google Calendar del gestor con videollamada de Meet; Google envía la invitación
 * al prospecto (RP-F-010). Cualquier falla lanza: el caso de uso deja la solicitud `pendiente`.
 * `enviarInvitaciones` en `false` solo para la suite de contrato, que no debe mandar correos.
 */
export function calendarioGoogle(
  credenciales: CredencialesGoogle,
  fetch = globalThis.fetch,
  enviarInvitaciones = true,
): Calendario {
  return {
    async crearEvento(evento) {
      const acceso = await tokenDeAcceso(credenciales, fetch);
      const url = new URL(`${urlCalendario(credenciales.calendarId)}/events`);
      url.searchParams.set("conferenceDataVersion", "1");
      url.searchParams.set("sendUpdates", enviarInvitaciones ? "all" : "none");
      const { id } = await jsonOLanza<{ id: string }>(
        await fetch(url, {
          method: "POST",
          signal: limite(),
          headers: { authorization: `Bearer ${acceso}`, "content-type": "application/json" },
          body: JSON.stringify({
            summary: evento.titulo,
            start: { dateTime: evento.inicio.toISOString() },
            end: { dateTime: evento.fin.toISOString() },
            attendees: [{ email: evento.invitado }],
            conferenceData: {
              createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
            },
          }),
        }),
      );
      return id;
    },
  };
}
