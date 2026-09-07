import axe from "axe-core";
import { readdirSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PaginaPublica } from "@/compartido/ui/PaginaPublica";
import Inicio from "./(publico)/page";
import Politica from "./(publico)/politica-de-datos/page";
import NoEncontrada from "./not-found";

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

it("ningún archivo de src tiene valores hexadecimales (RS-NF-007)", () => {
  const conHex = readdirSync("src", { recursive: true })
    .map(String)
    .filter((f) => /\.(tsx?|css)$/.test(f) && /#[0-9a-f]{3,8}\b/i.test(readFileSync(`src/${f}`, "utf8")));
  expect(conHex).toEqual([]);
});
