// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Ocupacion } from "../dominio/puertos";
import { ocupacionEnMemoria } from "./falsos";
import { ocupacionGoogle } from "./ocupacion-google";

/** El mismo contrato contra el falso y contra FreeBusy: así el falso no diverge del real (ADR-0004). */
const desde = new Date(Date.now() + 86_400_000);
const hasta = new Date(desde.getTime() + 7 * 86_400_000);

const credenciales = {
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
  calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
};

const implementaciones: [string, boolean, () => Ocupacion, () => Ocupacion][] = [
  [
    "en memoria",
    false,
    () => ocupacionEnMemoria([{ inicio: desde, fin: new Date(desde.getTime() + 3_600_000) }]),
    () => ocupacionEnMemoria([], true),
  ],
  [
    "Google FreeBusy",
    !credenciales.refreshToken,
    () => ocupacionGoogle(credenciales),
    () => ocupacionGoogle({ ...credenciales, refreshToken: "invalido" }),
  ],
];

describe.each(implementaciones)("Ocupacion %s", (_nombre, omitir, crear, crearFallando) => {
  it.skipIf(omitir)("devuelve intervalos que se cruzan con el rango, con inicio antes del fin", async () => {
    const intervalos = await crear().consultar(desde, hasta);
    for (const i of intervalos) {
      expect(i.inicio).toBeInstanceOf(Date);
      expect(i.inicio < i.fin).toBe(true);
      expect(i.fin > desde && i.inicio < hasta).toBe(true);
    }
  });

  it.skipIf(omitir)("lanza si la consulta falla", async () => {
    await expect(crearFallando().consultar(desde, hasta)).rejects.toThrow();
  });
});

describe("ocupacionGoogle sin red", () => {
  const respuestas = (freeBusy: unknown, estado = 200) => {
    const pedidas: [string, RequestInit | undefined][] = [];
    const fetch = (async (url: string, init?: RequestInit) => {
      pedidas.push([url, init]);
      const cuerpo = url.includes("oauth2") ? { access_token: "acceso" } : freeBusy;
      return new Response(JSON.stringify(cuerpo), { status: url.includes("oauth2") ? 200 : estado });
    }) as typeof globalThis.fetch;
    return { pedidas, ocupacion: ocupacionGoogle({ ...credenciales, calendarId: "cal" }, fetch) };
  };

  it("consulta el calendario configurado entre los dos instantes y convierte los intervalos", async () => {
    const { pedidas, ocupacion } = respuestas({
      calendars: { cal: { busy: [{ start: "2026-09-07T13:00:00Z", end: "2026-09-07T15:00:00Z" }] } },
    });
    expect(await ocupacion.consultar(desde, hasta)).toEqual([
      { inicio: new Date("2026-09-07T13:00:00Z"), fin: new Date("2026-09-07T15:00:00Z") },
    ]);
    const [url, init] = pedidas[1];
    expect(url).toBe("https://www.googleapis.com/calendar/v3/freeBusy");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer acceso");
    expect(JSON.parse(init?.body as string)).toEqual({
      timeMin: desde.toISOString(),
      timeMax: hasta.toISOString(),
      items: [{ id: "cal" }],
    });
  });

  it("lanza si Google responde con error o reporta error en el calendario", async () => {
    await expect(respuestas({}, 500).ocupacion.consultar(desde, hasta)).rejects.toThrow();
    await expect(
      respuestas({ calendars: { cal: { busy: [], errors: [{ reason: "notFound" }] } } }).ocupacion.consultar(desde, hasta),
    ).rejects.toThrow(/notFound/);
  });
});
