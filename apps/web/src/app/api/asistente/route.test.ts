// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { POST } from "./route";

const pedir = (cuerpo: unknown) =>
  POST(new Request("http://x/api/asistente", { method: "POST", body: JSON.stringify(cuerpo) }));
const pregunta = { mensajes: [{ rol: "usuario", texto: "¿Qué incluye el acompañamiento?" }] };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("sin clave de OpenRouter responde 503 y el sitio sigue funcionando", async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "");
  expect((await pedir(pregunta)).status).toBe(503);
});

it("rechaza un historial vacío o una pregunta demasiado larga", async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "clave");
  expect((await pedir({ mensajes: [] })).status).toBe(400);
  expect((await pedir({ mensajes: [{ rol: "usuario", texto: "x".repeat(1001) }] })).status).toBe(400);
});

it("envía los manuales del prestador como única fuente y devuelve la respuesta del modelo", async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "clave");
  const fetch = vi.fn(async () => Response.json({ choices: [{ message: { content: "Respuesta." } }] }));
  vi.stubGlobal("fetch", fetch);

  const r = await pedir(pregunta);
  expect(await r.json()).toEqual({ texto: "Respuesta." });
  const cuerpo = JSON.parse((fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
  expect(cuerpo.model).toBe("deepseek/deepseek-v4.1-flash");
  expect(cuerpo.messages[0].content).toContain("# Conocer la oferta de GHYCS");
  expect(cuerpo.messages.at(-1)).toEqual({ role: "user", content: "¿Qué incluye el acompañamiento?" });
});
