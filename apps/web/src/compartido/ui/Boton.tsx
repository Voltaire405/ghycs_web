import type { ComponentProps } from "react";

const CLASES = { primario: "btn-primario", secundario: "btn-secundario", destructivo: "btn-destructivo" };

/** Botón del sistema visual; el tono elige la clase (`ds-bundle/README.md`). */
export function Boton({ tono = "primario", ...props }: ComponentProps<"button"> & { tono?: keyof typeof CLASES }) {
  return <button {...props} className={CLASES[tono]} />;
}
