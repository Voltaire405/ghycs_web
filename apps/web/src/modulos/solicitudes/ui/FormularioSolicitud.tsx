"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/ui/Aviso";
import { Boton } from "@/compartido/ui/Boton";
import { Area, Campo, Entrada, Seleccion } from "@/compartido/ui/Campo";
import { MOMENTOS, opciones, TIPOS_PRESTADOR } from "./etiquetas";

export type Hora = { valor: string; etiqueta: string };


/** Formulario de solicitud: validación en el borde, envío condicionado a la autorización (RS-F-004, RS-F-037, RS-F-041). */
export function FormularioSolicitud({
  horas,
  enviar,
}: {
  horas: Hora[];
  enviar: (estado: { error?: string }, datos: FormData) => Promise<{ error?: string }>;
}) {
  const [estado, accion, enviando] = useActionState(enviar, {});
  const [autorizado, setAutorizado] = useState(false);

  if (horas.length === 0) {
    return (
      <Aviso role="status">No hay horas libres en esa fecha. Elija otra.</Aviso>
    );
  }

  return (
    <form action={accion} className="mt-8 grid gap-6">
      <fieldset className="grid gap-3">
        <legend className="font-semibold text-titular">Hora de la cita</legend>
        <div className="flex flex-wrap gap-2">
          {horas.map((h, i) => (
            <label key={h.valor} className="flex min-h-11 min-w-11 items-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 has-checked:border-accion has-checked:bg-superficie-marca">
              <input type="radio" name="citaInicio" value={h.valor} defaultChecked={i === 0} required />
              {h.etiqueta}
            </label>
          ))}
        </div>
      </fieldset>

      <Campo etiqueta="Nombre">
        <Entrada name="nombre" required minLength={2} maxLength={120} autoComplete="name" />
      </Campo>

      <Campo etiqueta="Correo">
        <Entrada type="email" name="correo" required autoComplete="email" />
      </Campo>

      <Campo etiqueta="Teléfono">
        <Entrada type="tel" name="telefono" required minLength={7} maxLength={20} autoComplete="tel" />
      </Campo>

      <Campo etiqueta="Tipo de prestador">
        <Seleccion name="tipoPrestador" required defaultValue="">
          <option value="" disabled>
            Elija una opción
          </option>
          {opciones(TIPOS_PRESTADOR).map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </Seleccion>
      </Campo>

      <Campo etiqueta="Momento en el que se encuentra">
        <Seleccion name="momento" required defaultValue="">
          <option value="" disabled>
            Elija una opción
          </option>
          {opciones(MOMENTOS).map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </Seleccion>
      </Campo>

      <Campo etiqueta="Descripción (opcional)">
        <Area name="descripcion" rows={4} maxLength={2000} />
      </Campo>

      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
        <input
          type="checkbox"
          name="autorizacionDatos"
          checked={autorizado}
          onChange={(e) => setAutorizado(e.target.checked)}
          className="mt-1 h-7 w-7"
        />
        <span className="text-cuerpo">
          Autorizo a GHYCS el tratamiento de mis datos personales para atender esta solicitud, en los términos de la{" "}
          <Link href="/politica-de-datos">política de tratamiento de datos</Link>.
        </span>
      </label>

      {estado.error && (
        <Aviso tono="error" role="alert">
          {estado.error}
        </Aviso>
      )}

      <p>
        <Boton type="submit" disabled={!autorizado || enviando}>
          {enviando ? "Enviando…" : "Solicite su cita"}
        </Boton>
      </p>
    </form>
  );
}
