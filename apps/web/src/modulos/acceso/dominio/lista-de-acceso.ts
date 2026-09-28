const normalizar = (correo: string) => correo.trim().toLowerCase();

/** Solo entran los correos de la lista; no hay roles (RC-5, ADR-0006). */
export const admitido = (correo: string, lista: readonly string[]) =>
  lista.some((c) => normalizar(c) === normalizar(correo));
