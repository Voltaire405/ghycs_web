export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // ponytail: la validación de entorno (RS-NF-014) queda desconectada mientras la fase 1
  // corre con datos en memoria: exigir DATABASE_URL, Resend y Google aquí tumba el arranque
  // en producción y devuelve 500 en toda ruta dinámica. Vuelve a llamar `leerEnv()` (ya
  // probada en compartido/config/env.test.ts) cuando exista el primer consumidor real.
}
