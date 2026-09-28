// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import type { Calendario, EventoCita } from "../dominio/puertos";
import { calendarioGoogle } from "./calendario-google";
import { calendarioEnMemoria } from "./falsos";
import { tokenDeAcceso, urlCalendario } from "./google";

/** El mismo contrato contra el falso y contra Google Calendar: así el falso no diverge del real. */
const credenciales = {
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
  calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
};

const inicio = new Date(Date.now() + 40 * 86_400_000);
// Dominio reservado (RFC 2606): nadie recibe la invitación, y el adaptador tampoco la envía.
const evento: EventoCita = {
  titulo: "Contrato ghycs_web · borrar",
  inicio,
  fin: new Date(inicio.getTime() + 45 * 60_000),
  invitado: "prueba@example.com",
};

// Los eventos creados en Google se borran al terminar para no ensuciar el calendario de prueba.
const creadosEnGoogle: string[] = [];
afterAll(async () => {
  if (!creadosEnGoogle.length) return;
  const acceso = await tokenDeAcceso(credenciales);
  for (const id of creadosEnGoogle) {
    await fetch(
      `${urlCalendario(credenciales.calendarId)}/events/${id}?sendUpdates=none`,
      { method: "DELETE", headers: { authorization: `Bearer ${acceso}` } },
    );
  }
});

const implementaciones: [string, boolean, () => Calendario, () => Calendario, string[]][] = [
  ["en memoria", false, () => calendarioEnMemoria(), () => calendarioEnMemoria(true), []],
  [
    "Google Calendar",
    !credenciales.refreshToken,
    () => calendarioGoogle(credenciales, fetch, false),
    () => calendarioGoogle({ ...credenciales, refreshToken: "invalido" }, fetch, false),
    creadosEnGoogle,
  ],
];

describe.each(implementaciones)("Calendario %s", (_nombre, omitir, crear, crearFallando, creados) => {
  it.skipIf(omitir)("crea el evento y devuelve un identificador distinto por evento", async () => {
    const calendario = crear();
    const a = await calendario.crearEvento(evento);
    const b = await calendario.crearEvento(evento);
    creados.push(a, b);
    expect(a).toMatch(/\S+/);
    expect(a).not.toBe(b);
  }, 30_000);

  it.skipIf(omitir)("lanza si la creación falla", async () => {
    await expect(crearFallando().crearEvento(evento)).rejects.toThrow();
  }, 30_000);

  it.skipIf(omitir)("retira un evento creado; retirarlo de nuevo lanza", async () => {
    const calendario = crear();
    const id = await calendario.crearEvento(evento);
    creados.push(id);
    await calendario.retirarEvento(id);
    await expect(calendario.retirarEvento(id)).rejects.toThrow();
  }, 30_000);

  it.skipIf(omitir)("lanza si el retiro falla", async () => {
    await expect(crearFallando().retirarEvento("evt-1")).rejects.toThrow();
  }, 30_000);
});

describe("calendarioGoogle sin red", () => {
  function googleSimulado(estado = 200) {
    const pedidas: [string, RequestInit | undefined][] = [];
    const fetch = (async (url: string | URL, init?: RequestInit) => {
      pedidas.push([String(url), init]);
      if (String(url).includes("oauth2")) return new Response(JSON.stringify({ access_token: "acceso" }));
      return new Response(estado === 204 ? null : JSON.stringify({ id: "evt-1" }), { status: estado });
    }) as typeof globalThis.fetch;
    return { pedidas, calendario: calendarioGoogle({ ...credenciales, calendarId: "cal@ghycs.co" }, fetch) };
  }

  it("crea el evento con Meet, invita al prospecto, le envía la invitación y devuelve el id", async () => {
    const { pedidas, calendario } = googleSimulado();
    expect(await calendario.crearEvento(evento)).toBe("evt-1");

    const [url, init] = pedidas[1];
    const u = new URL(url);
    expect(u.pathname).toBe("/calendar/v3/calendars/cal%40ghycs.co/events");
    expect(u.searchParams.get("conferenceDataVersion")).toBe("1");
    expect(u.searchParams.get("sendUpdates")).toBe("all");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer acceso");
    const cuerpo = JSON.parse(init?.body as string);
    expect(cuerpo).toMatchObject({
      summary: evento.titulo,
      start: { dateTime: evento.inicio.toISOString() },
      end: { dateTime: evento.fin.toISOString() },
      attendees: [{ email: "prueba@example.com" }],
      conferenceData: { createRequest: { conferenceSolutionKey: { type: "hangoutsMeet" } } },
    });
    expect(cuerpo.conferenceData.createRequest.requestId).toMatch(/\S+/);
  });

  it("retira el evento y avisa al prospecto de la cancelación", async () => {
    const { pedidas, calendario } = googleSimulado(204);
    await calendario.retirarEvento("evt-1");

    const [url, init] = pedidas[1];
    const u = new URL(url);
    expect(init?.method).toBe("DELETE");
    expect(u.pathname).toBe("/calendar/v3/calendars/cal%40ghycs.co/events/evt-1");
    expect(u.searchParams.get("sendUpdates")).toBe("all");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer acceso");
  });

  it("lanza si Google rechaza el retiro", async () => {
    await expect(googleSimulado(410).calendario.retirarEvento("evt-1")).rejects.toThrow(/410/);
  });

  it("lanza si Google responde con error", async () => {
    await expect(googleSimulado(403).calendario.crearEvento(evento)).rejects.toThrow(/403/);
  });
});
