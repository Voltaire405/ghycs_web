import Link from "next/link";
import type { ReactNode } from "react";
import { salir } from "./login/acciones";

/** El gestor no ve la navegación del visitante: su sitio es el listado (SRD §4.3). */
export default function LayoutGestor({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-borde bg-superficie">
        <nav aria-label="Administración" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="font-display text-h3 font-semibold text-titular">
            GHYCS · Administración
          </Link>
          <form action={salir}>
            <button type="submit" className="btn-secundario min-h-11">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
    </>
  );
}
