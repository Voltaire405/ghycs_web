import Link from "next/link";
import { notFound } from "next/navigation";
import { fechaLarga, horaCorta } from "@/compartido/ui/fecha";
import { casos } from "@/modulos/solicitudes/componer";
import { MOMENTOS, TIPOS_PRESTADOR } from "@/modulos/solicitudes/ui/etiquetas";
import { InsigniasSolicitud } from "@/modulos/solicitudes/ui/InsigniasSolicitud";
import { PanelGestor } from "@/modulos/solicitudes/ui/PanelGestor";
import { actualizarCita, registrarNotas } from "./acciones";

export const metadata = { title: "Solicitud" };

export default async function Detalle({ params }: PageProps<"/admin/solicitudes/[id]">) {
  const { id } = await params;
  const resultado = await casos.verSolicitud.ejecutar({ id });
  if (!resultado.ok) notFound();

  const s = resultado.valor;
  const datos: [string, string][] = [
    ["Prestador", s.nombre],
    ["Tipo de prestador", TIPOS_PRESTADOR[s.tipoPrestador]],
    ["Momento", MOMENTOS[s.momento]],
    ["Correo", s.correo],
    ["Teléfono", s.telefono],
    ["Cita", `${fechaLarga(s.citaInicio)}, ${horaCorta(s.citaInicio)}`],
    ["Descripción", s.descripcion || "Sin descripción."],
    ["Recibida", fechaLarga(s.creadaEn)],
  ];

  return (
    <section>
      <p>
        <Link href="/admin">Volver a las solicitudes</Link>
      </p>

      <h1 className="mt-4 font-display text-h2 font-semibold text-titular">{s.nombre}</h1>

      <p className="mt-4">
        <InsigniasSolicitud citaEstado={s.citaEstado} sincronizacion={s.sincronizacion} />
      </p>

      <dl className="mt-8 grid gap-4">
        {datos.map(([termino, valor]) => (
          <div key={termino}>
            <dt className="font-semibold text-titular">{termino}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>

      <PanelGestor
        id={s.id}
        citaEstado={s.citaEstado}
        notasGestor={s.notasGestor}
        cerrar={actualizarCita}
        guardar={registrarNotas}
      />
    </section>
  );
}
