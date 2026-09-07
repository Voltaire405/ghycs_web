"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { casos } from "@/modulos/solicitudes/componer";
import type { ErrorActualizarCita } from "@/modulos/solicitudes/aplicacion/actualizar-cita";
import { CIERRES_DEL_GESTOR } from "@/modulos/solicitudes/aplicacion/vistas";
import type { EstadoGuardado } from "@/modulos/solicitudes/ui/PanelGestor";

const MENSAJES: Record<ErrorActualizarCita | "invalido", string> = {
  "no-encontrada": "Esa solicitud ya no existe.",
  "transicion-no-permitida": "Esa cita ya no está agendada: su estado no se puede cambiar.",
  invalido: "Revise lo que envió: no es un valor válido.",
};

/** Las notas no pasan de 5000 caracteres (RS-F-022). */
const notas = z.object({ id: z.string().min(1), notas: z.string().max(5000) });
const cierre = z.object({ id: z.string().min(1), estado: z.enum(CIERRES_DEL_GESTOR) });

export async function actualizarCita(_estado: EstadoGuardado, datos: FormData): Promise<EstadoGuardado> {
  const r = cierre.safeParse(Object.fromEntries(datos));
  if (!r.success) return { error: MENSAJES.invalido };

  const resultado = await casos.actualizarCita.ejecutar(r.data);
  if (!resultado.ok) return { error: MENSAJES[resultado.error] };

  revalidatePath("/admin");
  revalidatePath(`/admin/solicitudes/${r.data.id}`);
  return { guardado: true };
}

export async function registrarNotas(_estado: EstadoGuardado, datos: FormData): Promise<EstadoGuardado> {
  const r = notas.safeParse(Object.fromEntries(datos));
  if (!r.success) return { error: MENSAJES.invalido };

  const resultado = await casos.registrarNotas.ejecutar(r.data);
  if (!resultado.ok) return { error: MENSAJES[resultado.error] };

  revalidatePath(`/admin/solicitudes/${r.data.id}`);
  return { guardado: true };
}
