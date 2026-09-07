import { describe, expect, it } from "vitest";
import {
  citaCancelada,
  citaCerrada,
  porUrgencia,
  puedeCancelarse,
  type EstadoCita,
  type Momento,
  type Solicitud,
} from "./solicitud";

const ahora = new Date("2026-09-01T08:00:00-05:00");

const solicitud = (citaEstado: EstadoCita, citaInicio = new Date("2026-09-07T08:00:00-05:00")): Solicitud => ({
  nombre: "Clínica San Rafael",
  correo: "contacto@ejemplo.co",
  telefono: "3001234567",
  tipoPrestador: "ips",
  momento: "habilitacion_inicial",
  descripcion: "Habilitación de consulta externa.",
  citaInicio,
  autorizacionDatos: true,
  id: "s-1",
  token: "t-1",
  creadaEn: new Date("2026-08-30T10:00:00-05:00"),
  citaEstado,
  sincronizacion: "ok",
  notasGestor: "",
});

describe("puedeCancelarse (RS-F-013)", () => {
  it.each([
    ["agendada", true],
    ["cancelada", false],
    ["atendida", false],
    ["no_asistio", false],
  ] as const)("una cita futura %s: %s", (estado, esperado) => {
    expect(puedeCancelarse(solicitud(estado), ahora)).toBe(esperado);
  });

  it("una cita agendada que ya pasó no se cancela", () => {
    expect(puedeCancelarse(solicitud("agendada", new Date("2026-08-25T08:00:00-05:00")), ahora)).toBe(false);
  });
});

it("citaCancelada solo cambia el estado (RS-F-014)", () => {
  const antes = solicitud("agendada");
  expect(citaCancelada(antes, ahora)).toEqual({ ...antes, citaEstado: "cancelada" });
});

it("citaCancelada rechaza la transición que la regla no permite (RS-F-039)", () => {
  expect(citaCancelada(solicitud("atendida"), ahora)).toBeNull();
});

describe("porUrgencia (RS-F-018)", () => {
  const enMomento = (momento: Momento, citaInicio: string): Solicitud => ({
    ...solicitud("agendada"),
    momento,
    citaInicio: new Date(citaInicio),
  });

  it("ordena cierre, hallazgo, novedad y habilitación inicial", () => {
    const desordenadas = [
      enMomento("habilitacion_inicial", "2026-09-07T08:00:00-05:00"),
      enMomento("novedad", "2026-09-07T08:00:00-05:00"),
      enMomento("cierre_servicio", "2026-09-07T08:00:00-05:00"),
      enMomento("hallazgo", "2026-09-07T08:00:00-05:00"),
    ];
    expect([...desordenadas].sort(porUrgencia).map((s) => s.momento)).toEqual([
      "cierre_servicio",
      "hallazgo",
      "novedad",
      "habilitacion_inicial",
    ]);
  });

  it("dentro de un mismo momento manda la hora de la cita", () => {
    const tarde = enMomento("hallazgo", "2026-09-07T10:00:00-05:00");
    const temprano = enMomento("hallazgo", "2026-09-07T08:00:00-05:00");
    expect([tarde, temprano].sort(porUrgencia)).toEqual([temprano, tarde]);
  });
});

describe("citaCerrada (RS-F-021, RS-F-039)", () => {
  it.each(["atendida", "no_asistio"] as const)("el gestor cierra una cita agendada como %s", (estado) => {
    const antes = solicitud("agendada");
    expect(citaCerrada(antes, estado)).toEqual({ ...antes, citaEstado: estado });
  });

  it.each(["cancelada", "atendida", "no_asistio"] as const)("rechaza cerrar una cita %s", (estado) => {
    expect(citaCerrada(solicitud(estado), "atendida")).toBeNull();
  });
});
