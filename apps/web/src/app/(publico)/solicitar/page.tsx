import { diaEnBogota, horaCorta } from "@/compartido/ui/fecha";
import { Aviso } from "@/compartido/ui/Aviso";
import { casos } from "@/modulos/solicitudes/componer";
import { FormularioSolicitud } from "@/modulos/solicitudes/ui/FormularioSolicitud";
import { enviarSolicitud } from "./acciones";

export const metadata = { title: "Agende su cita" };

export default async function Solicitar({ searchParams }: PageProps<"/solicitar">) {
  const { fecha } = await searchParams;
  const dia = typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : diaEnBogota(new Date());
  const disponibilidad = await casos.consultarDisponibilidad.ejecutar({ fecha: dia });

  return (
    <>
      <section className="prosa">
        <h1>Agende su cita</h1>
        <p className="mt-4 text-lead">
          Elija el día y la hora que le sirvan, cuéntenos su caso y reciba la invitación por correo. La cita se
          atiende por videollamada, en hora de Colombia.
        </p>
      </section>

      <form className="mt-8 flex flex-wrap items-end gap-3">
        <label className="grid gap-1">
          <span className="font-semibold text-titular">Día</span>
          <input className="campo" type="date" name="fecha" defaultValue={dia} min={diaEnBogota(new Date())} />
        </label>
        <button type="submit" className="btn-secundario min-h-11">
          Ver las horas de ese día
        </button>
      </form>

      {disponibilidad.ok ? (
        <FormularioSolicitud
          horas={disponibilidad.valor.map((h) => ({ valor: h.toISOString(), etiqueta: horaCorta(h) }))}
          enviar={enviarSolicitud}
        />
      ) : (
        <div className="mt-8">
          <Aviso tono="alerta" role="status">
            No es posible consultar la disponibilidad ahora. Intente más tarde.
          </Aviso>
        </div>
      )}
    </>
  );
}
