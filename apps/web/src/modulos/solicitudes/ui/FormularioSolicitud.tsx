"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/ui/Aviso";

export type Hora = { valor: string; etiqueta: string };

const TIPOS = [
  { valor: "ips", etiqueta: "IPS" },
  { valor: "profesional_independiente", etiqueta: "Profesional independiente" },
  { valor: "objeto_social_diferente", etiqueta: "Entidad con objeto social diferente" },
];

const MOMENTOS = [
  { valor: "habilitacion_inicial", etiqueta: "Habilitación inicial" },
  { valor: "novedad", etiqueta: "Novedad en un servicio ya habilitado" },
  { valor: "hallazgo", etiqueta: "Hallazgo de una visita de verificación" },
  { valor: "cierre_servicio", etiqueta: "Cierre de un servicio" },
];

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

      <label className="grid gap-1">
        <span className="font-semibold text-titular">Nombre</span>
        <input className="campo" name="nombre" required minLength={2} maxLength={120} autoComplete="name" />
      </label>

      <label className="grid gap-1">
        <span className="font-semibold text-titular">Correo</span>
        <input className="campo" type="email" name="correo" required autoComplete="email" />
      </label>

      <label className="grid gap-1">
        <span className="font-semibold text-titular">Teléfono</span>
        <input className="campo" type="tel" name="telefono" required minLength={7} maxLength={20} autoComplete="tel" />
      </label>

      <label className="grid gap-1">
        <span className="font-semibold text-titular">Tipo de prestador</span>
        <select className="campo" name="tipoPrestador" required defaultValue="">
          <option value="" disabled>
            Elija una opción
          </option>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="font-semibold text-titular">Momento en el que se encuentra</span>
        <select className="campo" name="momento" required defaultValue="">
          <option value="" disabled>
            Elija una opción
          </option>
          {MOMENTOS.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.etiqueta}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="font-semibold text-titular">Descripción (opcional)</span>
        <textarea className="campo" name="descripcion" rows={4} maxLength={2000} />
      </label>

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
        <button type="submit" className="btn-primario" disabled={!autorizado || enviando}>
          {enviando ? "Enviando…" : "Solicite su cita"}
        </button>
      </p>
    </form>
  );
}
