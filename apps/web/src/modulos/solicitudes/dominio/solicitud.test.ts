import { describe, expect, it } from "vitest";
import { citaCancelada, puedeCancelarse, type EstadoCita, type Solicitud } from "./solicitud";

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
  token: "t-1",
  creadaEn: new Date("2026-08-30T10:00:00-05:00"),
  citaEstado,
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
