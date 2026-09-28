import axe from "axe-core";
import { casos } from "@/modulos/solicitudes/componer";
import { readdirSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PaginaPublica } from "@/compartido/ui/PaginaPublica";
import Inicio from "./(publico)/page";
import Politica from "./(publico)/politica-de-datos/page";
import NoEncontrada from "./not-found";
import Confirmacion from "./(publico)/solicitar/confirmacion/page";
import Solicitar from "./(publico)/solicitar/page";
import Cita from "./(publico)/solicitud/[token]/page";
import LayoutGestor from "./(gestor)/layout";
import Login from "./(gestor)/login/page";
import Admin from "./(gestor)/admin/page";
import Detalle from "./(gestor)/admin/solicitudes/[id]/page";

// Las páginas se renderizan sobre el falso sembrado con una solicitud por estado, sin base de datos.
// `calendario.falla` simula FreeBusy caído.
const calendario = vi.hoisted(() => ({ falla: false }));
vi.mock("@/modulos/solicitudes/componer", async () => {
  const { componerCasos } = await import("@/modulos/solicitudes/casos");
  const { ocupacionEnMemoria, relojDelSistema, repositorioEnMemoria } = await import(
    "@/modulos/solicitudes/infraestructura/falsos"
  );
  const { leerHorarioBase } = await import("@/modulos/solicitudes/infraestructura/horario-base");
  const { solicitudesDeMuestra } = await import("@/modulos/solicitudes/infraestructura/muestra");
  const horario = leerHorarioBase({});
  const repositorio = repositorioEnMemoria(horario.duracionMinutos, solicitudesDeMuestra(new Date()));
  const ocupacion = {
    consultar: (desde: Date, hasta: Date) => ocupacionEnMemoria([], calendario.falla).consultar(desde, hasta),
  };
  return { casos: componerCasos({ ocupacion, repositorio, reloj: relojDelSistema, horario }) };
});
// Fuera de una petición `connection()` lanza; aquí no hay prerender que evitar.
vi.mock("next/server", async (original) => ({ ...(await original<object>()), connection: async () => {} }));

const paginas = { "/": Inicio, "/politica-de-datos": Politica };

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

describe("404", () => {
  const html = renderToStaticMarkup(<NoEncontrada />);

  it("trae la navegación pública y lleva a inicio y a la política", () => {
    expect(html).toMatch(/href="\/solicitar"[^>]*>Agende su cita/);
    expect(html).toContain('href="/politica-de-datos"');
    expect(html).toContain('href="/"');
  });

  it("pasa axe-core sin errores", async () => {
    document.documentElement.lang = "es-CO";
    document.body.innerHTML = html;
    const r = await axe.run(document.body);
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`)).toEqual([]);
  });
});

const delGestor: [string, Promise<React.ReactElement>][] = [
  ["/login", Login({ searchParams: Promise.resolve({}), params: Promise.resolve({}) })],
  ["/login bloqueado", Login({ searchParams: Promise.resolve({ bloqueado: "1" }), params: Promise.resolve({}) })],
  ["/admin", Admin()],
  [
    "/admin/solicitudes/[id]",
    Detalle({ params: Promise.resolve({ id: "muestra-1" }), searchParams: Promise.resolve({}) }),
  ],
];

describe.each(delGestor)("%s", (_ruta, pagina) => {
  it("pasa axe-core sin errores dentro de la página del gestor", async () => {
    const html = renderToStaticMarkup(<LayoutGestor>{await pagina}</LayoutGestor>);
    document.documentElement.lang = "es-CO";
    document.body.innerHTML = html;
    const r = await axe.run(document.body);
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(" | ")}`)).toEqual([]);
  });
});

it("el listado del gestor sale ordenado por urgencia y marca la sincronización pendiente (RS-F-018, RS-F-020)", async () => {
  const html = renderToStaticMarkup(await Admin());
  const momentos = [...html.matchAll(/<td[^>]*>(Habilitación inicial|Novedad[^<]*|Hallazgo[^<]*|Cierre[^<]*)</g)].map(
    (m) => m[1],
  );
  expect(momentos).toEqual([...momentos].sort((a, b) => rango(a) - rango(b)));

  const solicitudes = await casos.listarSolicitudes.ejecutar();
  const pendientes = solicitudes.filter((s) => s.sincronizacion === "pendiente");
  expect(pendientes).not.toHaveLength(0);
  expect((html.match(/Sin sincronizar/g) ?? []).length).toBe(pendientes.length);
});

const rango = (momento: string) =>
  ["Cierre", "Hallazgo", "Novedad", "Habilitación"].findIndex((p) => momento.startsWith(p));

it("un token desconocido devuelve la 404 del sitio (RS-F-012)", async () => {
  await expect(
    Cita({ params: Promise.resolve({ token: "no-existe" }), searchParams: Promise.resolve({}) }),
  ).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
});

it("un identificador desconocido devuelve la 404 del gestor", async () => {
  await expect(
    Detalle({ params: Promise.resolve({ id: "no-existe" }), searchParams: Promise.resolve({}) }),
  ).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
});

// `app/tokens.css` es la única fuente de los valores: el resto los consume como tokens.
it("ningún archivo de src fuera de los tokens tiene valores hexadecimales (RS-NF-007)", () => {
  const conHex = readdirSync("src", { recursive: true })
    .map(String)
    .filter((f) => f !== "app/tokens.css")
    .filter((f) => /\.(tsx?|css)$/.test(f) && /#[0-9a-f]{3,8}\b/i.test(readFileSync(`src/${f}`, "utf8")));
  expect(conHex).toEqual([]);
});

it("con el calendario caído /solicitar no ofrece horas y muestra el aviso (RS-F-009)", async () => {
  calendario.falla = true;
  try {
    const html = renderToStaticMarkup(
      await Solicitar({ searchParams: Promise.resolve({ fecha: "2026-09-07" }), params: Promise.resolve({}) }),
    );
    expect(html).toContain("No es posible consultar la disponibilidad ahora. Intente más tarde.");
    expect(html).not.toContain('name="nombre"');
  } finally {
    calendario.falla = false;
  }
});
