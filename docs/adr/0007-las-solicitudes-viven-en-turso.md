# Las solicitudes viven en Turso

Las solicitudes, y los usuarios y sesiones del gestor, se guardan en Turso (libSQL, dialecto SQLite) con Drizzle y migraciones versionadas. Se descarta PostgreSQL.

El volumen del sitio es de pocas solicitudes por día y un solo agregado (ADR-0003): no pide nada que SQLite no dé, y Turso lo sirve gestionado, sin un servidor de base de datos que operar.

## Consecuencias

«Una cita por hora» se garantiza con un índice único parcial sobre la hora de la cita donde la cita no está cancelada; las citas canceladas liberan su hora. Las enumeraciones del dominio se guardan como texto con restricción `CHECK`.

Better Auth usa su adaptador de Drizzle con el proveedor SQLite sobre la misma base (ADR-0006).

Las pruebas de contrato del repositorio corren contra SQLite local (libSQL en archivo o en memoria), el mismo dialecto de Turso: no piden credenciales y corren siempre.
