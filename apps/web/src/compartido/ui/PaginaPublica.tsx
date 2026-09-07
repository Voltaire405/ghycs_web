import Link from "next/link";
import type { ReactNode } from "react";

/** Barra de navegación y pie comunes a toda página pública (RS-F-036). */
export function PaginaPublica({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-borde bg-superficie">
        <nav aria-label="Principal" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-display text-h3 font-semibold text-titular">
            GHYCS
          </Link>
          <Link href="/solicitar" className="btn-primario">
            Agende su cita
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <footer className="border-t border-borde bg-superficie">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-apoyo">
          <p>GHYCS · Gestores de Habilitación y Calidad en Salud</p>
          <Link href="/politica-de-datos">Política de tratamiento de datos</Link>
        </div>
      </footer>
    </>
  );
}
