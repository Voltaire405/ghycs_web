import { describe, expect, it } from "vitest";
import { calcularDisponibilidad, type HorarioBase } from "./disponibilidad";

const horario: HorarioBase = {
  dias: [1, 2, 3, 4, 5],
  franjas: [["08:00", "10:00"], ["14:00", "15:00"]],
  duracionMinutos: 60,
  anticipacionHoras: 24,
  horizonteDias: 30,
};

/** 2026-09-07 es lunes; los instantes se escriben en `America/Bogota` (UTC−05:00). */
const bogota = (iso: string) => new Date(`${iso}-05:00`);
const horas = (fecha: string, ocupados: { inicio: Date; fin: Date }[] = [], ahora = bogota("2026-09-01T08:00:00")) =>
  calcularDisponibilidad(fecha, horario, ocupados, ahora).map((d) => d.toISOString().slice(11, 16));

describe("calcularDisponibilidad", () => {
  it("devuelve las horas del horario base del día", () => {
    expect(horas("2026-09-07")).toEqual(["13:00", "14:00", "19:00"]);
  });

  it("no ofrece horas en un día fuera de los días de atención", () => {
    expect(horas("2026-09-06")).toEqual([]);
  });

  it("descarta las horas que se solapan con la ocupación", () => {
    const ocupados = [{ inicio: bogota("2026-09-07T08:30:00"), fin: bogota("2026-09-07T09:15:00") }];
    expect(horas("2026-09-07", ocupados)).toEqual(["19:00"]);
  });

  it("respeta la anticipación mínima", () => {
    expect(horas("2026-09-07", [], bogota("2026-09-06T09:30:00"))).toEqual(["19:00"]);
  });

  it("no ofrece horas más allá del horizonte", () => {
    expect(horas("2026-10-05")).toEqual([]);
  });

  it("no ofrece horas de una fecha pasada", () => {
    expect(horas("2026-08-31")).toEqual([]);
  });

  it("no ofrece una hora que no cabe completa en la franja", () => {
    const largo = { ...horario, duracionMinutos: 90 };
    expect(calcularDisponibilidad("2026-09-07", largo, [], bogota("2026-09-01T08:00:00"))).toHaveLength(1);
  });
});
