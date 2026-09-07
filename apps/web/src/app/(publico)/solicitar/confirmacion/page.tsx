import Link from "next/link";
import { notFound } from "next/navigation";
import { fechaLarga, horaCorta } from "@/compartido/ui/fecha";

export const metadata = { title: "Su cita quedó agendada" };

export default async function Confirmacion({ searchParams }: PageProps<"/solicitar/confirmacion">) {
  const { cita } = await searchParams;
  const inicio = typeof cita === "string" ? new Date(cita) : null;
  if (!inicio || Number.isNaN(inicio.getTime())) notFound();

  return (
    <section className="prosa">
      <h1>Su cita quedó agendada</h1>
      <p className="mt-4 text-lead">
        Lo esperamos el <strong>{fechaLarga(inicio)}</strong> a las <strong>{horaCorta(inicio)}</strong>, hora de
        Colombia.
      </p>
      <p className="mt-4">La invitación a la cita le llega por correo.</p>
      <p className="mt-8">
        <Link href="/" className="btn-secundario">
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
