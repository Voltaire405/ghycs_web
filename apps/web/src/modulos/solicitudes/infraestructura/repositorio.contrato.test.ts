// @vitest-environment node
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { conectar, migrar } from "@/compartido/bd/cliente";
import type { RepositorioSolicitudes } from "../dominio/puertos";
import type { Solicitud, SolicitudNueva } from "../dominio/solicitud";
import { repositorioEnMemoria } from "./falsos";
import { repositorioTurso } from "./repositorio-turso";

/** El mismo contrato contra el falso y contra libSQL local: así el falso no diverge del real (ADR-0007). */
const DURACION = 60;

/** Cada implementación da dos repositorios sobre el mismo almacén: dos instancias del sitio. */
type Par = [RepositorioSolicitudes, RepositorioSolicitudes];

async function turso(): Promise<Par> {
  // Archivo temporal y no `:memory:`: cada conexión de libSQL a `:memory:` abre una base distinta.
  const url = `file:${join(mkdtempSync(join(tmpdir(), "ghycs-")), "bd.sqlite")}`;
  const bd = conectar({ url });
  await migrar(bd);
  return [repositorioTurso(bd, DURACION), repositorioTurso(conectar({ url }), DURACION)];
}

const implementaciones: [string, () => Promise<Par>][] = [
  [
    "en memoria",
    async () => {
      const guardadas: Solicitud[] = [];
      return [repositorioEnMemoria(DURACION, guardadas), repositorioEnMemoria(DURACION, guardadas)];
    },
  ],
  ["Turso (libSQL local)", turso],
];

const lunes8 = new Date("2026-09-07T08:00:00-05:00");
const nueva = (citaInicio = lunes8, nombre = "Clínica San Rafael"): SolicitudNueva => ({
  nombre,
  correo: "contacto@ejemplo.co",
  telefono: "3001234567",
  tipoPrestador: "ips",
  momento: "habilitacion_inicial",
  descripcion: "Habilitación de consulta externa.",
  citaInicio,
  autorizacionDatos: true,
});

describe.each(implementaciones)("RepositorioSolicitudes %s", (_nombre, crearPar) => {
  const crear = async () => (await crearPar())[0];

  it("guarda la solicitud agendada, sincronizada, sin notas ni evento, y la devuelve por id y por token", async () => {
    const repo = await crear();
    const s = await repo.guardar(nueva());
    expect(s).toMatchObject({ ...nueva(), citaEstado: "agendada", sincronizacion: "ok", notasGestor: "", eventoId: null });
    expect(await repo.porId(s!.id)).toEqual(s);
    expect(await repo.porToken(s!.token)).toEqual(s);
    expect(await repo.todas()).toEqual([s]);
  });

  it("un id o un token inexistente responde null", async () => {
    const repo = await crear();
    await repo.guardar(nueva());
    expect(await repo.porId("no-existe")).toBeNull();
    expect(await repo.porToken("no-existe")).toBeNull();
  });

  it("el token es aleatorio: largo y distinto en cada solicitud", async () => {
    const repo = await crear();
    const a = await repo.guardar(nueva());
    const b = await repo.guardar(nueva(new Date("2026-09-07T09:00:00-05:00")));
    expect(a!.token.length).toBeGreaterThanOrEqual(32);
    expect(a!.token).not.toBe(b!.token);
    expect(a!.id).not.toBe(b!.id);
  });

  it("una segunda solicitud a la misma hora devuelve null", async () => {
    const repo = await crear();
    await repo.guardar(nueva());
    expect(await repo.guardar(nueva(lunes8, "Otra"))).toBeNull();
    expect(await repo.todas()).toHaveLength(1);
  });

  it("dos guardar concurrentes a la misma hora, por conexiones distintas: uno gana y el otro devuelve null", async () => {
    const [repo, otraConexion] = await crearPar();
    const r = await Promise.all([repo.guardar(nueva()), otraConexion.guardar(nueva(lunes8, "Otra"))]);
    expect(r.filter((s) => s === null)).toHaveLength(1);
    expect(await repo.todas()).toHaveLength(1);
  });

  it("cancelar libera la hora sin borrar la solicitud cancelada", async () => {
    const repo = await crear();
    const s = (await repo.guardar(nueva()))!;
    await repo.actualizar({ ...s, citaEstado: "cancelada" });
    expect(await repo.agendadas(lunes8, new Date("2026-09-08T00:00:00-05:00"))).toEqual([]);
    const otra = await repo.guardar(nueva(lunes8, "Otra"));
    expect(otra).not.toBeNull();
    expect((await repo.todas()).map((x) => x.citaEstado).sort()).toEqual(["agendada", "cancelada"]);
  });

  it("atendida y no asistió conservan la hora", async () => {
    const repo = await crear();
    const s = (await repo.guardar(nueva()))!;
    await repo.actualizar({ ...s, citaEstado: "atendida" });
    expect(await repo.guardar(nueva(lunes8, "Otra"))).toBeNull();
  });

  it("agendadas devuelve los intervalos que se cruzan con el rango", async () => {
    const repo = await crear();
    await repo.guardar(nueva());
    await repo.guardar(nueva(new Date("2026-09-08T08:00:00-05:00")));
    const fin = new Date(lunes8.getTime() + DURACION * 60_000);
    expect(await repo.agendadas(new Date("2026-09-07T08:30:00-05:00"), new Date("2026-09-07T12:00:00-05:00"))).toEqual([
      { inicio: lunes8, fin },
    ]);
    expect(await repo.agendadas(fin, new Date("2026-09-07T12:00:00-05:00"))).toEqual([]);
  });

  it("actualizar persiste estado, sincronización, notas e identificador del evento", async () => {
    const repo = await crear();
    const s = (await repo.guardar(nueva()))!;
    const cambiada = { ...s, citaEstado: "no_asistio" as const, sincronizacion: "pendiente" as const, notasGestor: "Llamar.", eventoId: "evt-1" };
    await repo.actualizar(cambiada);
    expect(await repo.porId(s.id)).toEqual(cambiada);
  });
});
