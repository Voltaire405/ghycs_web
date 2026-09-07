import type { ReactNode } from "react";

/** Insignia del sistema visual; siempre lleva variante (`ds-bundle/README.md`). */
export function Insignia({ variante, children }: { variante: string; children: ReactNode }) {
  return <span className={`insignia ${variante}`}>{children}</span>;
}
