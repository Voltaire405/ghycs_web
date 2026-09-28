"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Mensaje = { rol: "usuario" | "asistente"; texto: string };

const BIENVENIDA: Mensaje = {
  rol: "asistente",
  texto: "Hola. Puedo contarle qué hace GHYCS, a quién atiende y cómo funciona la cita. ¿Qué quiere saber?",
};

/** Burbuja del asistente en la esquina inferior derecha de las páginas públicas (RP-F-017). */
export function Asistente() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const final = useRef<HTMLDivElement>(null);

  useEffect(() => final.current?.scrollIntoView({ block: "end" }), [mensajes, abierto]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const pregunta = texto.trim();
    if (!pregunta || esperando) return;
    // La bienvenida es local: no viaja al modelo. Solo las últimas preguntas, para acotar el costo.
    const historial = [...mensajes.slice(1), { rol: "usuario" as const, texto: pregunta }].slice(-12);
    setMensajes((m) => [...m, { rol: "usuario", texto: pregunta }]);
    setTexto("");
    setEsperando(true);
    try {
      const r = await fetch("/api/asistente", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mensajes: historial }),
      });
      const datos = (await r.json()) as { texto?: string };
      if (!r.ok || !datos.texto) throw new Error();
      setMensajes((m) => [...m, { rol: "asistente", texto: datos.texto! }]);
    } catch {
      setMensajes((m) => [
        ...m,
        { rol: "asistente", texto: "El asistente no está disponible ahora. Puede agendar su cita y resolver sus dudas en ella." },
      ]);
    } finally {
      setEsperando(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3">
      {abierto && (
        <section
          id="asistente"
          aria-label="Asistente de GHYCS"
          className="flex h-[min(32rem,calc(100dvh-7rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-borde bg-superficie shadow-elevada"
        >
          <header className="flex items-center justify-between bg-petroleo-800 px-4 py-3 text-white">
            <p className="font-semibold">Asistente de GHYCS</p>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar el asistente" className="px-2 text-lg">
              ×
            </button>
          </header>
          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {mensajes.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 whitespace-pre-line ${
                  m.rol === "usuario" ? "ml-auto bg-petroleo-700 text-white" : "bg-superficie-suave text-cuerpo"
                }`}
              >
                {m.texto}
              </p>
            ))}
            {esperando && <p className="text-apoyo">Escribiendo…</p>}
            <div ref={final} />
          </div>
          <form onSubmit={enviar} className="flex gap-2 border-t border-borde p-3">
            <label htmlFor="pregunta" className="sr-only">
              Su pregunta
            </label>
            <input
              id="pregunta"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={1000}
              placeholder="Escriba su pregunta"
              className="campo min-w-0 flex-1"
            />
            <button type="submit" disabled={esperando || !texto.trim()} className="btn-primario">
              Enviar
            </button>
          </form>
          <p className="border-t border-borde px-4 py-2 text-center text-sm">
            <Link href="/solicitar" className="font-semibold text-enlace">
              Agende su cita
            </Link>
          </p>
        </section>
      )}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls="asistente"
        className="rounded-full bg-petroleo-700 px-5 py-3 font-semibold text-white shadow-elevada hover:bg-petroleo-800"
      >
        {abierto ? "Cerrar" : "¿Preguntas?"}
      </button>
    </div>
  );
}
