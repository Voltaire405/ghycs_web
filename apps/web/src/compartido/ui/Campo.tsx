import type { ComponentProps, ReactNode } from "react";

/** Etiqueta y control del sistema visual: todo campo va rotulado (RS-NF-001). */
export function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="font-semibold text-titular">{etiqueta}</span>
      {children}
    </label>
  );
}

export const Entrada = (props: ComponentProps<"input">) => <input {...props} className="campo" />;
export const Seleccion = (props: ComponentProps<"select">) => <select {...props} className="campo" />;
export const Area = (props: ComponentProps<"textarea">) => <textarea {...props} className="campo" />;
