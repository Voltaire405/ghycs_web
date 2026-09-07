"use server";

import { redirect } from "next/navigation";
import { casos } from "@/modulos/solicitudes/componer";
import type { ErrorCancelar } from "@/modulos/solicitudes/aplicacion/cancelar-cita";

const MENSAJES: Record<ErrorCancelar, string> = {
  "no-encontrada": "No encontramos esa cita.",
  "no-cancelable": "Esa cita ya no se puede cancelar.",
};

export async function cancelarCita(_estado: { error?: string }, datos: FormData): Promise<{ error?: string }> {
  const token = String(datos.get("token") ?? "");
  const resultado = await casos.cancelarCita.ejecutar({ token });
  if (!resultado.ok) return { error: MENSAJES[resultado.error] };

  redirect(`/solicitud/${encodeURIComponent(token)}?cancelada=1`);
}
