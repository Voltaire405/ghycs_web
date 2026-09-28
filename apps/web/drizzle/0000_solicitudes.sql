CREATE TABLE `solicitudes` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`nombre` text NOT NULL,
	`correo` text NOT NULL,
	`telefono` text NOT NULL,
	`tipo_prestador` text NOT NULL,
	`momento` text NOT NULL,
	`descripcion` text NOT NULL,
	`autorizacion_datos` integer NOT NULL,
	`cita_inicio` integer NOT NULL,
	`cita_estado` text NOT NULL,
	`sincronizacion` text NOT NULL,
	`notas_gestor` text NOT NULL,
	`evento_id` text,
	`creada_en` integer NOT NULL,
	CONSTRAINT "tipo_prestador_valido" CHECK(tipo_prestador IN ('ips', 'profesional_independiente', 'objeto_social_diferente')),
	CONSTRAINT "momento_valido" CHECK(momento IN ('habilitacion_inicial', 'novedad', 'hallazgo', 'cierre_servicio')),
	CONSTRAINT "cita_estado_valido" CHECK(cita_estado IN ('agendada', 'cancelada', 'atendida', 'no_asistio')),
	CONSTRAINT "sincronizacion_valida" CHECK(sincronizacion IN ('ok', 'pendiente')),
	CONSTRAINT "autorizacion_datos_dada" CHECK(autorizacion_datos = 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `solicitudes_token_unique` ON `solicitudes` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `una_cita_por_hora` ON `solicitudes` (`cita_inicio`) WHERE cita_estado <> 'cancelada';