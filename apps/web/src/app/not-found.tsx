import type { Metadata } from "next";
import Link from "next/link";
import { PaginaPublica } from "@/compartido/ui/PaginaPublica";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NoEncontrada() {
  return (
    <PaginaPublica>
      <section className="prosa">
        <h1>Página no encontrada</h1>
        <p className="mt-4">La dirección que escribió no existe o cambió de lugar.</p>
        <p className="mt-6 flex flex-wrap gap-4">
          <Link href="/" className="btn-secundario">
            Volver al inicio
          </Link>
          <Link href="/solicitar" className="btn-primario">
            Agende su cita
          </Link>
        </p>
      </section>
    </PaginaPublica>
  );
}
