import { readdirSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

/** Toda página y todo server action de `/admin` abre con `exigirSesion()` (ADR-0006). */
const raiz = "src/app/(gestor)/admin";
const archivos = readdirSync(raiz, { recursive: true })
  .map(String)
  .filter((f) => /(^|\/)(page\.tsx|acciones\.ts)$/.test(f));

const cuenta = (texto: string, patron: RegExp) => (texto.match(patron) ?? []).length;

it.each(archivos)("%s exige sesión en cada punto de entrada", (archivo) => {
  const codigo = readFileSync(`${raiz}/${archivo}`, "utf8");
  const entradas = archivo.endsWith("page.tsx") ? 1 : cuenta(codigo, /^export\s+(?!type\b|interface\b)/gm);
  expect(entradas).toBeGreaterThan(0);
  expect(cuenta(codigo, /await exigirSesion\(\)/g)).toBe(entradas);
});
