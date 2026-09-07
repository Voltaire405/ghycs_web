import type { ReactNode } from "react";

/** Mensaje destacado con los tokens de estado del sistema visual. */
export function Aviso({
  tono = "info",
  role,
  children,
}: {
  tono?: "info" | "alerta" | "error";
  role?: "status" | "alert";
  children: ReactNode;
}) {
  return (
    <p
      className="rounded-md border px-4 py-3"
      style={{
        background: `var(--${tono}-fondo)`,
        borderColor: `var(--${tono}-borde)`,
        color: `var(--${tono}-texto)`,
      }}
      role={role}
    >
      {children}
    </p>
  );
}
