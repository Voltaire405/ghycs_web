"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/ui/Aviso";

/** Cancelación desde el enlace privado; la regla ya la evaluó el dominio (RS-F-013). */
export function BotonCancelar({
  token,
  cancelar,
}: {
  token: string;
  cancelar: (estado: { error?: string }, datos: FormData) => Promise<{ error?: string }>;
}) {
  const [estado, accion, cancelando] = useActionState(cancelar, {});

  return (
    <form action={accion} className="mt-8 grid gap-4">
      <input type="hidden" name="token" value={token} />
      {estado.error && (
        <Aviso tono="error" role="alert">
          {estado.error}
        </Aviso>
      )}
      <p>
        <button type="submit" className="btn-destructivo" disabled={cancelando}>
          {cancelando ? "Cancelando…" : "Cancele su cita"}
        </button>
      </p>
    </form>
  );
}
