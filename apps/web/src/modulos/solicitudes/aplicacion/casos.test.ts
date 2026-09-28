import { expect, it, vi } from "vitest";
import type { HorarioBase } from "../dominio/disponibilidad";
import type { SolicitudNueva } from "../dominio/solicitud";
import { calendarioEnMemoria, ocupacionEnMemoria, repositorioEnMemoria } from "../infraestructura/falsos";
import { consultarDisponibilidad } from "./consultar-disponibilidad";
import { crearSolicitud } from "./crear-solicitud";
import { cancelarCita } from "./cancelar-cita";
import { consultarPorToken } from "./consultar-por-token";

const horario: HorarioBase = {
  dias: [1, 2, 3, 4, 5],
  franjas: [["08:00", "10:00"]],
  duracionMinutos: 60,
  anticipacionHoras: 24,
  horizonteDias: 30,
};
const reloj = { ahora: () => new Date("2026-09-01T08:00:00-05:00") };
const lunes8 = new Date("2026-09-07T08:00:00-05:00");

const comando = (citaInicio = lunes8): SolicitudNueva => ({
  nombre: "Clínica San Rafael",
  correo: "contacto@ejemplo.co",
  telefono: "3001234567",
  tipoPrestador: "ips",
  momento: "habilitacion_inicial",
  descripcion: "Habilitación de consulta externa.",
  citaInicio,
  autorizacionDatos: true,
});

it("consultar-disponibilidad devuelve las horas libres del día", async () => {
  const caso = consultarDisponibilidad({ ocupacion: ocupacionEnMemoria(), repositorio: repositorioEnMemoria(60), reloj, horario });
  const r = await caso.ejecutar({ fecha: "2026-09-07" });
  expect(r.ok && r.valor.map((d) => d.toISOString())).toEqual([
    "2026-09-07T13:00:00.000Z",
    "2026-09-07T14:00:00.000Z",
  ]);
});

it("consultar-disponibilidad falla sin ocupación conocida (RS-F-009)", async () => {
  const caso = consultarDisponibilidad({ ocupacion: ocupacionEnMemoria([], true), repositorio: repositorioEnMemoria(60), reloj, horario });
  expect(await caso.ejecutar({ fecha: "2026-09-07" })).toEqual({ ok: false, error: "ocupacion-no-disponible" });
});

it("crear-solicitud guarda la solicitud con un token", async () => {
  const caso = crearSolicitud({ repositorio: repositorioEnMemoria(60), ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario });
  const r = await caso.ejecutar(comando());
  expect(r.ok && r.valor.token).toMatch(/^[0-9a-f-]{36}$/);
});

it("crear-solicitud crea la cita con videollamada en el calendario y guarda su evento (RP-F-010)", async () => {
  const calendario = calendarioEnMemoria();
  const repositorio = repositorioEnMemoria(60);
  const r = await crearSolicitud({ repositorio, ocupacion: ocupacionEnMemoria(), calendario, reloj, horario }).ejecutar(comando());

  expect(calendario.eventos).toEqual([
    {
      titulo: "Cita GHYCS · Clínica San Rafael",
      inicio: lunes8,
      fin: new Date("2026-09-07T09:00:00-05:00"),
      invitado: "contacto@ejemplo.co",
    },
  ]);
  const eventoId = calendario.ids[0];
  expect(r.ok && r.valor).toMatchObject({ eventoId, sincronizacion: "ok" });
  expect(r.ok && (await repositorio.porId(r.valor.id))).toMatchObject({ eventoId, sincronizacion: "ok" });
});

it("si el calendario falla, la solicitud queda guardada con sincronización pendiente y el caso tiene éxito (RP-F-016)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const r = await crearSolicitud({
    repositorio,
    ocupacion: ocupacionEnMemoria(),
    calendario: calendarioEnMemoria(true),
    reloj,
    horario,
  }).ejecutar(comando());

  expect(r.ok && r.valor).toMatchObject({ eventoId: null, sincronizacion: "pendiente" });
  expect(r.ok && (await repositorio.porId(r.valor.id))).toMatchObject({ eventoId: null, sincronizacion: "pendiente" });
});

it("si guardar el evento falla, la solicitud sigue pendiente y el caso tiene éxito (RP-F-016)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const caido = { ...repositorio, actualizar: async () => Promise.reject(new Error("bd caída")) };
  const r = await crearSolicitud({
    repositorio: caido,
    ocupacion: ocupacionEnMemoria(),
    calendario: calendarioEnMemoria(),
    reloj,
    horario,
  }).ejecutar(comando());

  expect(r.ok && r.valor).toMatchObject({ eventoId: null, sincronizacion: "pendiente" });
  expect(r.ok && (await repositorio.porId(r.valor.id))).toMatchObject({ sincronizacion: "pendiente" });
});

it("crear-solicitud rechaza una hora que nunca se ofreció (RS-F-005)", async () => {
  const caso = crearSolicitud({ repositorio: repositorioEnMemoria(60), ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario });
  const r = await caso.ejecutar(comando(new Date("2026-09-07T12:00:00-05:00")));
  expect(r).toEqual({ ok: false, error: "horario-no-disponible" });
});

it("una cita agendada deja de ofrecerse (RS-F-002)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const puertos = { repositorio, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario };
  await crearSolicitud(puertos).ejecutar(comando());
  const r = await consultarDisponibilidad(puertos).ejecutar({ fecha: "2026-09-07" });
  expect(r.ok && r.valor.map((d) => d.toISOString())).toEqual(["2026-09-07T14:00:00.000Z"]);
});

it("crear-solicitud rechaza la hora que acaba de ocuparse (RS-F-007)", async () => {
  const repositorio = repositorioEnMemoria(60);
  // La ocupación no ve la cita anterior: solo el candado del repositorio la rechaza.
  const caso = crearSolicitud({ repositorio, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario });
  await caso.ejecutar(comando());
  const sinRevalidar = { ...repositorio, agendadas: async () => [] };
  const r = await crearSolicitud({ repositorio: sinRevalidar, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario }).ejecutar(comando());
  expect(r).toEqual({ ok: false, error: "horario-ocupado" });
});

it("consultar-por-token no encuentra un token desconocido (RS-F-012)", async () => {
  const caso = consultarPorToken({ repositorio: repositorioEnMemoria(60), reloj });
  expect(await caso.ejecutar({ token: "no-existe" })).toEqual({ ok: false, error: "no-encontrada" });
});

it("cancelar-cita libera la hora y conserva la solicitud (RS-F-014)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const puertos = { repositorio, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario };
  const creada = await crearSolicitud(puertos).ejecutar(comando());
  const token = creada.ok ? creada.valor.token : "";

  expect(await cancelarCita(puertos).ejecutar({ token })).toEqual({ ok: true, valor: null });

  const vista = await consultarPorToken({ repositorio, reloj }).ejecutar({ token });
  expect(vista.ok && vista.valor.solicitud).toEqual({ ...(creada.ok && creada.valor), citaEstado: "cancelada" });
  expect(vista.ok && vista.valor.cancelable).toBe(false);

  const libres = await consultarDisponibilidad(puertos).ejecutar({ fecha: "2026-09-07" });
  expect(libres.ok && libres.valor.map((d) => d.toISOString())).toEqual([
    "2026-09-07T13:00:00.000Z",
    "2026-09-07T14:00:00.000Z",
  ]);
});

it("cancelar-cita rechaza una cita que ya no es cancelable (RS-F-013)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const puertos = { repositorio, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario };
  const creada = await crearSolicitud(puertos).ejecutar(comando());
  const token = creada.ok ? creada.valor.token : "";
  await cancelarCita(puertos).ejecutar({ token });

  expect(await cancelarCita(puertos).ejecutar({ token })).toEqual({
    ok: false,
    error: "no-cancelable",
  });
});

it("cancelar-cita retira el evento de la cita y la deja sincronizada (RP-F-023)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const calendario = calendarioEnMemoria();
  const creada = await crearSolicitud({ repositorio, ocupacion: ocupacionEnMemoria(), calendario, reloj, horario }).ejecutar(comando());
  const { id, token } = creada.ok ? creada.valor : { id: "", token: "" };

  expect(await cancelarCita({ repositorio, calendario, reloj }).ejecutar({ token })).toEqual({ ok: true, valor: null });
  expect(calendario.ids).toEqual([]);
  expect(await repositorio.porId(id)).toMatchObject({ citaEstado: "cancelada", sincronizacion: "ok" });
});

it("cancelar-cita sin evento cancela sin intentar retirarlo (RP-F-023)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const puertos = { repositorio, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(true), reloj, horario };
  const creada = await crearSolicitud(puertos).ejecutar(comando());
  const { id, token } = creada.ok ? creada.valor : { id: "", token: "" };
  const calendario = { ...calendarioEnMemoria(), retirarEvento: vi.fn() };

  expect(await cancelarCita({ repositorio, calendario, reloj }).ejecutar({ token })).toEqual({ ok: true, valor: null });
  expect(calendario.retirarEvento).not.toHaveBeenCalled();
  expect(await repositorio.porId(id)).toMatchObject({ citaEstado: "cancelada", sincronizacion: "pendiente" });
});

it("si retirar el evento falla, la cancelación se mantiene con sincronización pendiente (RP-F-023)", async () => {
  const repositorio = repositorioEnMemoria(60);
  const creada = await crearSolicitud({ repositorio, ocupacion: ocupacionEnMemoria(), calendario: calendarioEnMemoria(), reloj, horario }).ejecutar(comando());
  const { id, token } = creada.ok ? creada.valor : { id: "", token: "" };

  expect(await cancelarCita({ repositorio, calendario: calendarioEnMemoria(true), reloj }).ejecutar({ token })).toEqual({ ok: true, valor: null });
  expect(await repositorio.porId(id)).toMatchObject({ citaEstado: "cancelada", sincronizacion: "pendiente" });
});
