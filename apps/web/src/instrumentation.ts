export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { leerEnv } = await import("./compartido/config/env");
  leerEnv();
}
