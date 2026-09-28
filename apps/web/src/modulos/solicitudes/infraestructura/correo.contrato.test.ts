// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { ConfirmacionCita, Correo } from "../dominio/puertos";
import { correoResend } from "./correo-resend";
import { correoEnMemoria } from "./falsos";

/** El mismo contrato contra el falso y contra Resend: así el falso no diverge del real. */
const apiKey = process.env.RESEND_API_KEY ?? "";
const remitente = process.env.CORREO_REMITENTE || "GHYCS <onboarding@resend.dev>";
const urlSitio = "https://ghycs.vercel.app";

// Dirección de prueba de Resend: simula la entrega sin que nadie reciba el correo.
const confirmacion: ConfirmacionCita = {
  para: "delivered@resend.dev",
  nombre: "Contrato ghycs_web",
  inicio: new Date("2026-10-05T13:00:00Z"),
  token: "token-de-prueba",
};

const implementaciones: [string, boolean, () => Correo, () => Correo][] = [
  ["en memoria", false, () => correoEnMemoria(), () => correoEnMemoria(true)],
  [
    "Resend",
    !apiKey,
    () => correoResend({ apiKey, remitente, urlSitio }),
    () => correoResend({ apiKey: "re_invalido", remitente, urlSitio }),
  ],
];

describe.each(implementaciones)("Correo %s", (_nombre, omitir, crear, crearFallando) => {
  it.skipIf(omitir)("envía la confirmación", async () => {
    await crear().enviarConfirmacion(confirmacion);
  }, 30_000);

  it.skipIf(omitir)("lanza si el envío falla", async () => {
    await expect(crearFallando().enviarConfirmacion(confirmacion)).rejects.toThrow();
  }, 30_000);
});

describe("correoResend sin red", () => {
  function resendSimulado(estado = 200) {
    const pedidas: [string, RequestInit | undefined][] = [];
    const fetch = (async (url: string | URL, init?: RequestInit) => {
      pedidas.push([String(url), init]);
      return new Response(JSON.stringify({ id: "correo-1" }), { status: estado });
    }) as typeof globalThis.fetch;
    return { pedidas, correo: correoResend({ apiKey: "re_clave", remitente: "GHYCS <citas@ghycs.co>", urlSitio }, fetch) };
  }

  it("envía desde el remitente, al prospecto, con la fecha, la hora y el enlace privado", async () => {
    const { pedidas, correo } = resendSimulado();
    await correo.enviarConfirmacion({ ...confirmacion, para: "contacto@ejemplo.co" });

    const [url, init] = pedidas[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer re_clave");
    const cuerpo = JSON.parse(init?.body as string);
    expect(cuerpo).toMatchObject({ from: "GHYCS <citas@ghycs.co>", to: ["contacto@ejemplo.co"] });
    expect(cuerpo.text).toContain("lunes, 5 de octubre de 2026");
    expect(cuerpo.text).toContain("08:00 a. m.");
    expect(cuerpo.text).toContain("https://ghycs.vercel.app/solicitud/token-de-prueba");
  });

  it("lanza si Resend responde con error", async () => {
    await expect(resendSimulado(422).correo.enviarConfirmacion(confirmacion)).rejects.toThrow(/422/);
  });
});
