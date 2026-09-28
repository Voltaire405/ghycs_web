import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/modulos/acceso/componer";

export const { GET, POST } = toNextJsHandler(auth);
