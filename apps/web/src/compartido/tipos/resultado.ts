/** Resultado de un caso de uso: los errores esperables son parte del contrato (RS-R-008). */
export type Resultado<T, E> = { ok: true; valor: T } | { ok: false; error: E };

export const exito = <T>(valor: T): Resultado<T, never> => ({ ok: true, valor });
export const fallo = <E>(error: E): Resultado<never, E> => ({ ok: false, error });
