import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Política de tratamiento de datos" };

export default function PoliticaDeDatos() {
  return (
    <article className="prosa">
      <h1>Política de tratamiento de datos personales</h1>
      <p className="mt-4">
        GHYCS recoge los datos que usted entrega al agendar su cita —nombre, correo electrónico, teléfono, tipo de
        prestador y situación— con el único fin de contactarlo, atender la cita y hacerle seguimiento a su solicitud.
      </p>
      <p className="mt-4">
        Sus datos no se comparten con terceros distintos de los proveedores necesarios para agendar la cita y enviar
        la invitación por correo. Se conservan mientras dure la relación con usted o hasta que solicite su
        eliminación.
      </p>
      <p className="mt-4">
        Usted puede conocer, actualizar, rectificar o pedir la supresión de sus datos escribiendo al correo de
        contacto de GHYCS. Este tratamiento se rige por la Ley 1581 de 2012 y sus normas reglamentarias.
      </p>
      <p className="mt-10">
        <Link href="/solicitar" className="btn-primario">
          Agende su cita
        </Link>
      </p>
    </article>
  );
}
