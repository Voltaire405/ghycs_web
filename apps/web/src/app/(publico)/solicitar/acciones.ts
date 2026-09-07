"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { casos } from "@/modulos/solicitudes/componer";

type EstadoEnvio = { error?: string };

/** Validación en el borde; el dominio recibe tipos ya válidos (SRD §3.3, RS-F-004). */
const esquema = z.object({
  nombre: z.string().trim().min(2).max(120),
  correo: z.email(),
  telefono: z.string().trim().min(7).max(20),
  tipoPrestador: z.enum(["ips", "profesional_independiente", "objeto_social_diferente"]),
  momento: z.enum(["habilitacion_inicial", "novedad", "hallazgo", "cierre_servicio"]),
  descripcion: z.string().max(2000).default(""),
  citaInicio: z.iso.datetime(),
  autorizacionDatos: z.literal("on"),
});

const MENSAJES = {
  "horario-ocupado": "Ese horario acaba de ocuparse. Elija otro.",
  "horario-no-disponible": "Ese horario ya no está disponible. Elija otro de la lista.",
  "ocupacion-no-disponible": "No es posible consultar la disponibilidad ahora. Intente más tarde.",
  invalido: "Revise los datos del formulario: alguno está incompleto o mal escrito.",
};

export async function enviarSolicitud(_estado: EstadoEnvio, datos: FormData): Promise<EstadoEnvio> {
  const r = esquema.safeParse(Object.fromEntries(datos));
  if (!r.success) return { error: MENSAJES.invalido };

  const resultado = await casos.crearSolicitud.ejecutar({
    ...r.data,
    citaInicio: new Date(r.data.citaInicio),
    autorizacionDatos: true,
  });
  if (!resultado.ok) return { error: MENSAJES[resultado.error] };

  redirect(`/solicitar/confirmacion?cita=${encodeURIComponent(r.data.citaInicio)}`);
}
