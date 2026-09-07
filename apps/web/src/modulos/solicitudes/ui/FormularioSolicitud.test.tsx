import axe from "axe-core";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { FormularioSolicitud } from "./FormularioSolicitud";

const horas = [
  { valor: "2026-09-07T13:00:00.000Z", etiqueta: "08:00 a. m." },
  { valor: "2026-09-07T14:00:00.000Z", etiqueta: "09:00 a. m." },
];
const enviar = async () => ({});

const html = (props = {}) =>
  renderToStaticMarkup(<FormularioSolicitud horas={horas} enviar={enviar} {...props} />);

it("deja la autorización desmarcada y el envío deshabilitado (RS-F-037, RS-F-041)", () => {
  const marca = html();
  expect(marca).toContain('href="/politica-de-datos"');
  expect(marca).not.toMatch(/name="autorizacionDatos"[^>]*checked/);
  expect(marca).toMatch(/<button[^>]*disabled/);
});

it("ofrece cada hora disponible como opción", () => {
  expect(html()).toContain('value="2026-09-07T14:00:00.000Z"');
});

it("avisa cuando no hay horas libres", () => {
  expect(html({ horas: [] })).toContain("No hay horas libres");
});

it("no tutea al visitante", () => {
  expect(html().replace(/<[^>]+>/g, " ")).not.toMatch(/\b(tu|tus|te|tú|puedes|tienes|elige|marca)\b/i);
});

it("pasa axe-core sin errores", async () => {
  document.documentElement.lang = "es-CO";
  document.body.innerHTML = `<main>${html()}</main>`;
  const r = await axe.run(document.body);
  expect(r.violations.map((v) => v.id)).toEqual([]);
});
