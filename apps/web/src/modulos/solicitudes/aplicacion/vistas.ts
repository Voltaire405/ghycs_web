/**
 * Lo que la presentación necesita del vocabulario del dominio, expuesto por la capa que sí
 * puede importarlo: `src/app/**` y `ui/**` no cruzan a `dominio/` (SRD §3.1).
 */
export { CIERRES_DEL_GESTOR } from "../dominio/solicitud";
export type {
  CierreDelGestor,
  EstadoCita,
  Momento,
  Sincronizacion,
  Solicitud,
  TipoPrestador,
} from "../dominio/solicitud";
