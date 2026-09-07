import Link from "next/link";
import { fechaLarga, horaCorta } from "@/compartido/ui/fecha";
import { casos } from "@/modulos/solicitudes/componer";
import { MOMENTOS } from "@/modulos/solicitudes/ui/etiquetas";
import { InsigniasSolicitud } from "@/modulos/solicitudes/ui/InsigniasSolicitud";

export const metadata = { title: "Solicitudes" };

export default async function Admin() {
  const solicitudes = await casos.listarSolicitudes.ejecutar();

  return (
    <section className="grid gap-6">
      <h1 className="font-display text-h2 font-semibold text-titular">Solicitudes</h1>
      <p className="text-apoyo">Ordenadas por urgencia y, dentro de cada momento, por hora de la cita.</p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Solicitudes ordenadas por urgencia</caption>
          <thead>
            <tr className="border-b border-borde-fuerte">
              <th scope="col" className="py-2 pr-4 font-semibold text-titular">Prestador</th>
              <th scope="col" className="py-2 pr-4 font-semibold text-titular">Momento</th>
              <th scope="col" className="py-2 pr-4 font-semibold text-titular">Cita</th>
              <th scope="col" className="py-2 font-semibold text-titular">Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id} className="border-b border-borde align-top">
                <th scope="row" className="py-3 pr-4 font-normal">
                  <Link href={`/admin/solicitudes/${s.id}`}>{s.nombre}</Link>
                </th>
                <td className="py-3 pr-4">{MOMENTOS[s.momento]}</td>
                <td className="py-3 pr-4">
                  {fechaLarga(s.citaInicio)}, {horaCorta(s.citaInicio)}
                </td>
                <td className="py-3">
                  <InsigniasSolicitud citaEstado={s.citaEstado} sincronizacion={s.sincronizacion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
