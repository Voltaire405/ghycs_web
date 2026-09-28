import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { ESTADOS_CITA, MOMENTOS, SINCRONIZACIONES, TIPOS_PRESTADOR } from "../dominio/solicitud";

/** `valor IN ('a', 'b')` para guardar una enumeración del dominio como texto con `CHECK` (ADR-0007). */
const enLista = (columna: string, valores: readonly string[]) =>
  sql.raw(`${columna} IN (${valores.map((v) => `'${v}'`).join(", ")})`);

/** Una fila por solicitud con la cita embebida (ADR-0003). */
export const solicitudes = sqliteTable(
  "solicitudes",
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    nombre: text().notNull(),
    correo: text().notNull(),
    telefono: text().notNull(),
    tipoPrestador: text("tipo_prestador", { enum: TIPOS_PRESTADOR }).notNull(),
    momento: text({ enum: MOMENTOS }).notNull(),
    descripcion: text().notNull(),
    autorizacionDatos: integer("autorizacion_datos", { mode: "boolean" }).notNull(),
    citaInicio: integer("cita_inicio", { mode: "timestamp_ms" }).notNull(),
    citaEstado: text("cita_estado", { enum: ESTADOS_CITA }).notNull(),
    sincronizacion: text({ enum: SINCRONIZACIONES }).notNull(),
    notasGestor: text("notas_gestor").notNull(),
    eventoId: text("evento_id"),
    creadaEn: integer("creada_en", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    // Una cita por hora: las canceladas liberan la suya (RS-F-007, ADR-0007).
    uniqueIndex("una_cita_por_hora").on(t.citaInicio).where(sql`cita_estado <> 'cancelada'`),
    check("tipo_prestador_valido", enLista("tipo_prestador", TIPOS_PRESTADOR)),
    check("momento_valido", enLista("momento", MOMENTOS)),
    check("cita_estado_valido", enLista("cita_estado", ESTADOS_CITA)),
    check("sincronizacion_valida", enLista("sincronizacion", SINCRONIZACIONES)),
    // Ley 1581: no se guarda una solicitud sin autorización de datos (RS-F-008).
    check("autorizacion_datos_dada", sql`autorizacion_datos = 1`),
  ],
);
