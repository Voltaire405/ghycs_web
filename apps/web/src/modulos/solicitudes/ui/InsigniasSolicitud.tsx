import { Insignia } from "@/compartido/ui/Insignia";
import type { EstadoCita, Sincronizacion } from "../aplicacion/vistas";
import { ESTADOS_CITA } from "./etiquetas";

/** Estado de la cita y, si falta el evento en el calendario, la advertencia (RS-F-020). */
export function InsigniasSolicitud({
  citaEstado,
  sincronizacion,
}: {
  citaEstado: EstadoCita;
  sincronizacion: Sincronizacion;
}) {
  return (
    <span className="flex flex-wrap gap-2">
      <Insignia variante={ESTADOS_CITA[citaEstado].variante}>{ESTADOS_CITA[citaEstado].etiqueta}</Insignia>
      {sincronizacion === "pendiente" && <Insignia variante="insignia-pendiente">Sin sincronizar</Insignia>}
    </span>
  );
}
