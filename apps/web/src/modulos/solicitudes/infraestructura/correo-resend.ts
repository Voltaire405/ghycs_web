import type { Correo } from "../dominio/puertos";

/** Credencial de Resend, remitente verificado y origen público del sitio para armar el enlace privado. */
export interface ConfigResend {
  apiKey: string;
  remitente: string;
  urlSitio: string;
}

// ponytail: repite `compartido/ui/fecha`, que la infraestructura no puede importar; muévelo a compartido si crece.
const enBogota = (d: Date, opciones: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", ...opciones }).format(d);

/**
 * Confirmación de GHYCS por Resend: la fecha, la hora y el enlace privado para consultar o cancelar,
 * aparte de la invitación de calendario (RP-F-021). Cualquier falla lanza; el caso de uso la absorbe.
 */
export function correoResend(config: ConfigResend, fetch = globalThis.fetch): Correo {
  return {
    async enviarConfirmacion({ para, nombre, inicio, token }) {
      const fecha = enBogota(inicio, { dateStyle: "full" });
      const hora = enBogota(inicio, { hour: "2-digit", minute: "2-digit", hour12: true });
      const enlace = new URL(`/solicitud/${encodeURIComponent(token)}`, config.urlSitio);
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
        headers: { authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: config.remitente,
          to: [para],
          subject: `Su cita con GHYCS: ${fecha}`,
          text: [
            `Hola, ${nombre}:`,
            `Su cita con GHYCS quedó agendada para el ${fecha} a las ${hora}, hora de Colombia.`,
            "La invitación con el enlace de la videollamada le llega en otro correo.",
            `Para consultar o cancelar su cita, use este enlace privado. Es personal: no lo reenvíe.\n${enlace}`,
            "GHYCS",
          ].join("\n\n"),
        }),
      });
      if (!r.ok) throw new Error(`Resend respondió ${r.status}: ${await r.text()}`);
    },
  };
}
