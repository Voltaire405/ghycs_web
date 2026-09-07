import { ESLint } from "eslint";
import { expect, it } from "vitest";

const eslint = new ESLint();
const raiz = `${process.cwd()}/src`;

async function errores(archivo: string, codigo: string) {
  const [r] = await eslint.lintText(codigo, { filePath: `${raiz}/${archivo}` });
  return r.messages.filter((m) => m.ruleId === "no-restricted-imports");
}

it("la presentación no importa infraestructura ni el cliente de bd", async () => {
  expect(await errores("app/x/page.tsx", `import "@/modulos/solicitudes/infraestructura/repositorio-postgres";`)).toHaveLength(1);
  expect(await errores("app/x/page.tsx", `import "@/compartido/bd/cliente";`)).toHaveLength(1);
  expect(await errores("app/x/page.tsx", `import "@/modulos/solicitudes/dominio/cita";`)).toHaveLength(1);
  expect(await errores("app/x/page.tsx", `import "@/compartido/config/env";`)).toHaveLength(1);
  expect(await errores("app/x/page.tsx", `import "@/modulos/solicitudes/aplicacion/crear-solicitud";`)).toHaveLength(0);
  expect(await errores("app/x/page.tsx", `import "@/compartido/ui/PaginaPublica";`)).toHaveLength(0);
});

it("el dominio no importa next, react, drizzle ni googleapis", async () => {
  expect(await errores("modulos/s/dominio/cita.ts", `import "next/server";`)).toHaveLength(1);
  expect(await errores("modulos/s/dominio/cita.ts", `import "drizzle-orm";`)).toHaveLength(1);
  expect(await errores("modulos/s/dominio/cita.ts", `import "../infraestructura/x";`)).toHaveLength(1);
  expect(await errores("modulos/s/dominio/cita.ts", `import "@/compartido/tipos/resultado";`)).toHaveLength(0);
});

it("la aplicación no importa presentación ni infraestructura", async () => {
  expect(await errores("modulos/s/aplicacion/crear.ts", `import "../ui/Formulario";`)).toHaveLength(1);
  expect(await errores("modulos/s/aplicacion/crear.ts", `import "next/navigation";`)).toHaveLength(1);
  expect(await errores("modulos/s/aplicacion/crear.ts", `import "@/compartido/bd/cliente";`)).toHaveLength(1);
  expect(await errores("modulos/s/aplicacion/crear.ts", `import "../dominio/cita";`)).toHaveLength(0);
  expect(await errores("modulos/s/aplicacion/crear.ts", `import "@/compartido/tipos/resultado";`)).toHaveLength(0);
});

it("la infraestructura no importa presentación ni aplicación", async () => {
  expect(await errores("modulos/s/infraestructura/repo.ts", `import "../aplicacion/crear";`)).toHaveLength(1);
  expect(await errores("modulos/s/infraestructura/repo.ts", `import "next/server";`)).toHaveLength(1);
  expect(await errores("modulos/s/infraestructura/repo.ts", `import "@/compartido/bd/cliente";`)).toHaveLength(0);
  expect(await errores("modulos/s/infraestructura/repo.ts", `import "@/compartido/config/env";`)).toHaveLength(0);
});
