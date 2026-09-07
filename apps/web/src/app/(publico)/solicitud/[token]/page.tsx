import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso } from "@/compartido/ui/Aviso";
import { Insignia } from "@/compartido/ui/Insignia";
import { fechaLarga, horaCorta } from "@/compartido/ui/fecha";
import { casos } from "@/modulos/solicitudes/componer";
import { ESTADOS_CITA } from "@/modulos/solicitudes/ui/etiquetas";
import { BotonCancelar } from "@/modulos/solicitudes/ui/BotonCancelar";
import { cancelarCita } from "./acciones";

export const metadata = { title: "Su cita" };

export default async function Cita({ params, searchParams }: PageProps<"/solicitud/[token]">) {
  const { token } = await params;
  const { cancelada } = await searchParams;
  const resultado = await casos.consultarPorToken.ejecutar({ token });
  if (!resultado.ok) notFound();

  const { solicitud, cancelable } = resultado.valor;

  return (
    <section className="prosa">
      <h1>Su cita</h1>

      {cancelada === "1" && (
        <div className="mt-6">
          <Aviso role="status">Su cita quedó cancelada. Puede pedir otra cuando lo necesite.</Aviso>
        </div>
      )}

      <dl className="mt-6 grid gap-4">
        <div>
          <dt className="font-semibold text-titular">Fecha</dt>
          <dd>{fechaLarga(solicitud.citaInicio)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-titular">Hora</dt>
          <dd>{horaCorta(solicitud.citaInicio)}, hora de Colombia</dd>
        </div>
        <div>
          <dt className="font-semibold text-titular">Estado</dt>
          <dd>
            <Insignia variante={ESTADOS_CITA[solicitud.citaEstado].variante}>
              {ESTADOS_CITA[solicitud.citaEstado].etiqueta}
            </Insignia>
          </dd>
        </div>
      </dl>

      {cancelable ? (
        <BotonCancelar token={solicitud.token} cancelar={cancelarCita} />
      ) : (
        <p className="mt-8">
          <Link href="/solicitar" className="btn-primario">
            Agende otra cita
          </Link>
        </p>
      )}
    </section>
  );
}
