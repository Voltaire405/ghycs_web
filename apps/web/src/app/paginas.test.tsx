import axe from "axe-core";
import { readdirSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaginaPublica } from "@/compartido/ui/PaginaPublica";
import Inicio from "./(publico)/page";
import Politica from "./(publico)/politica-de-datos/page";
import NoEncontrada from "./not-found";
import Confirmacion from "./(publico)/solicitar/confirmacion/page";
import Solicitar from "./(publico)/solicitar/page";
import Cita from "./(publico)/solicitud/[token]/page";

const paginas = { "/": Inicio, "/politica-de-datos": Politica, "404": NoEncontrada };

describe.each(Object.entries(paginas))("%s", (_ruta, Pagina) => {
  const html = renderToStaticMarkup(<PaginaPublica><Pagina /></PaginaPublica>);

  it("enlaza «Agende su cita» a /solicitar y lleva a inicio y a la política", () => {
    expect(html).toMatch(/href="\/solicitar"[^>]*>Agende su cita/);
    expect(html).toContain('href="/politica-de-datos"');
    expect(html).toContain('href="/"');
  });

  it("no tutea al visitante", () => {
    const texto = html.replace(/<[^>]+>/g, " ");
    expect(texto).not.toMatch(/\b(tu|tus|te|tú|agenda|solicita|puedes|tienes)\b/i);
  });

  it("pasa axe-core sin errores", async () => {
    document.documentElement.lang = "es-CO";
    document.body.innerHTML = html;
    const r = await axe.run(document.body);
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`)).toEqual([]);
  });
});

const asincronas: [string, Promise<React.ReactElement>][] = [
  ["/solicitar", Solicitar({ searchParams: Promise.resolve({ fecha: "2026-09-07" }), params: Promise.resolve({}) })],
  [
    "/solicitar/confirmacion",
    Confirmacion({ searchParams: Promise.resolve({ cita: "2026-09-07T13:00:00.000Z" }), params: Promise.resolve({}) }),
  ],
  [
    "/solicitud/[token]",
    Cita({ params: Promise.resolve({ token: "muestra-agendada" }), searchParams: Promise.resolve({}) }),
  ],
  [
    "/solicitud/[token] cancelada",
    Cita({ params: Promise.resolve({ token: "muestra-cancelada" }), searchParams: Promise.resolve({ cancelada: "1" }) }),
  ],
];

describe.each(asincronas)("%s", (_ruta, pagina) => {
  it("pasa axe-core sin errores dentro de la página pública", async () => {
    const html = renderToStaticMarkup(<PaginaPublica>{await pagina}</PaginaPublica>);
    document.documentElement.lang = "es-CO";
    document.body.innerHTML = html;
    const r = await axe.run(document.body);
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`)).toEqual([]);
  });
});

it("un token desconocido devuelve la 404 del sitio (RS-F-012)", async () => {
  await expect(
    Cita({ params: Promise.resolve({ token: "no-existe" }), searchParams: Promise.resolve({}) }),
  ).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
});

it("ningún archivo de src tiene valores hexadecimales (RS-NF-007)", () => {
  const conHex = readdirSync("src", { recursive: true })
    .map(String)
    .filter((f) => /\.(tsx?|css)$/.test(f) && /#[0-9a-f]{3,8}\b/i.test(readFileSync(`src/${f}`, "utf8")));
  expect(conHex).toEqual([]);
});
