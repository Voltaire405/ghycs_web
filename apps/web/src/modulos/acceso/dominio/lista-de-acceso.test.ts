import { expect, it } from "vitest";
import { admitido } from "./lista-de-acceso";

const lista = ["socia@ghycs.co", "Socio@GHYCS.co"];

it("admite los correos de la lista sin importar mayúsculas ni espacios", () => {
  expect(admitido("socia@ghycs.co", lista)).toBe(true);
  expect(admitido(" SOCIO@ghycs.co ", lista)).toBe(true);
});

it("rechaza cualquier otro correo (RC-5: no hay roles, solo la lista)", () => {
  expect(admitido("personal@gmail.com", lista)).toBe(false);
  expect(admitido("", lista)).toBe(false);
});
