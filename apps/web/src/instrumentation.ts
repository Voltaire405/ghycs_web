import { leerEnv } from "@/compartido/config/env";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Falla el arranque nombrando cada variable faltante (RS-NF-014).
  leerEnv();
}
