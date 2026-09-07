import { describe, expect, it } from "vitest";
import type { Momento, Solicitud } from "../dominio/solicitud";
import { repositorioEnMemoria } from "../infraestructura/falsos";
import { actualizarCita } from "./actualizar-cita";
import { listarSolicitudes } from "./listar-solicitudes";
import { registrarNotas } from "./registrar-notas";
import { verSolicitud } from "./ver-solicitud";

const solicitud = (id: string, momento: Momento, hora = "08:00"): Solicitud => ({
  id,
  token: `t-${id}`,
  nombre: "Clínica San Rafael",
  correo: "contacto@ejemplo.co",
  telefono: "3001234567",
  tipoPrestador: "ips",
  momento,
  descripcion: "",
  citaInicio: new Date(`2026-09-07T${hora}:00-05:00`),
  autorizacionDatos: true,
  creadaEn: new Date("2026-09-01T08:00:00-05:00"),
  citaEstado: "agendada",
  sincronizacion: "ok",
  notasGestor: "",
});

const repositorio = (solicitudes: Solicitud[]) => repositorioEnMemoria(60, solicitudes);

it("el listado sale ordenado por urgencia (RS-F-018)", async () => {
  const casos = listarSolicitudes({
    repositorio: repositorio([
      solicitud("a", "habilitacion_inicial"),
      solicitud("b", "cierre_servicio", "10:00"),
      solicitud("c", "hallazgo"),
      solicitud("d", "cierre_servicio", "09:00"),
    ]),
  });
  expect((await casos.ejecutar()).map((s) => s.id)).toEqual(["d", "b", "c", "a"]);
});

describe("actualizarCita (RS-F-021, RS-F-039)", () => {
  it("marca atendida una cita agendada", async () => {
    const repo = repositorio([solicitud("a", "hallazgo")]);
    expect(await actualizarCita({ repositorio: repo }).ejecutar({ id: "a", estado: "atendida" })).toEqual({
      ok: true,
      valor: null,
    });
    expect((await repo.porId("a"))?.citaEstado).toBe("atendida");
  });

  it("rechaza cerrar una cita que ya no está agendada", async () => {
    const repo = repositorio([{ ...solicitud("a", "hallazgo"), citaEstado: "cancelada" }]);
    expect(await actualizarCita({ repositorio: repo }).ejecutar({ id: "a", estado: "atendida" })).toEqual({
      ok: false,
      error: "transicion-no-permitida",
    });
  });

  it("rechaza una solicitud que no existe", async () => {
    expect(await actualizarCita({ repositorio: repositorio([]) }).ejecutar({ id: "x", estado: "atendida" })).toEqual({
      ok: false,
      error: "no-encontrada",
    });
  });
});

it("registrarNotas conserva el resto de la solicitud (RS-F-022)", async () => {
  const antes = solicitud("a", "novedad");
  const repo = repositorio([antes]);
  await registrarNotas({ repositorio: repo }).ejecutar({ id: "a", notas: "Falta el manual de bioseguridad." });
  expect(await repo.porId("a")).toEqual({ ...antes, notasGestor: "Falta el manual de bioseguridad." });
});

it("verSolicitud no revela una solicitud inexistente", async () => {
  expect(await verSolicitud({ repositorio: repositorio([]) }).ejecutar({ id: "x" })).toEqual({
    ok: false,
    error: "no-encontrada",
  });
});
