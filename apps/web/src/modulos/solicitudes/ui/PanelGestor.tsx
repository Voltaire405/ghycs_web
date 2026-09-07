"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/ui/Aviso";
import { Boton } from "@/compartido/ui/Boton";
import { Area, Campo } from "@/compartido/ui/Campo";
import { CIERRES_DEL_GESTOR, type EstadoCita } from "../aplicacion/vistas";
import { ESTADOS_CITA } from "./etiquetas";

export type EstadoGuardado = { error?: string; guardado?: boolean };
export type AccionGestor = (estado: EstadoGuardado, datos: FormData) => Promise<EstadoGuardado>;

/** Cierre de la cita y notas del gestor; el dominio decide si la transición procede (RS-F-021, RS-F-022). */
export function PanelGestor({
  id,
  citaEstado,
  notasGestor,
  cerrar,
  guardar,
}: {
  id: string;
  citaEstado: EstadoCita;
  notasGestor: string;
  cerrar: AccionGestor;
  guardar: AccionGestor;
}) {
  const [cierre, accionCerrar, cerrando] = useActionState(cerrar, {});
  const [notas, accionGuardar, guardando] = useActionState(guardar, {});

  return (
    <div className="mt-10 grid gap-10">
      <form action={accionCerrar} className="grid gap-4">
        <h2 className="font-display text-h3 font-semibold text-titular">Cierre de la cita</h2>
        <input type="hidden" name="id" value={id} />

        {cierre.error && (
          <Aviso tono="error" role="alert">
            {cierre.error}
          </Aviso>
        )}
        {cierre.guardado && <Aviso role="status">El estado de la cita quedó guardado.</Aviso>}

        {citaEstado === "agendada" ? (
          <p className="flex flex-wrap gap-4">
            {CIERRES_DEL_GESTOR.map((estado, i) => (
              <Boton key={estado} type="submit" name="estado" value={estado} tono={i === 0 ? "primario" : "secundario"} disabled={cerrando}>
                {ESTADOS_CITA[estado].etiqueta}
              </Boton>
            ))}
          </p>
        ) : (
          <p className="text-apoyo">Esta cita ya está cerrada: su estado no se puede cambiar.</p>
        )}
      </form>

      <form action={accionGuardar} className="grid gap-4">
        <h2 className="font-display text-h3 font-semibold text-titular">Notas del gestor</h2>
        <input type="hidden" name="id" value={id} />

        <Campo etiqueta="Notas">
          <Area name="notas" rows={6} maxLength={5000} defaultValue={notasGestor} />
        </Campo>

        {notas.error && (
          <Aviso tono="error" role="alert">
            {notas.error}
          </Aviso>
        )}
        {notas.guardado && <Aviso role="status">Las notas quedaron guardadas.</Aviso>}

        <p>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar notas"}
          </Boton>
        </p>
      </form>
    </div>
  );
}
