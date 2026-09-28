# Manuales de uso

Un archivo por flujo de trabajo: una cadena de acciones con un propósito, de principio a fin, con sus caminos alternativos y cómo resolverlos. Cada manual se escribe para quien lo usa, en su lenguaje y en usted.

Los manuales describen el sitio **como está previsto** en [`prd.md`](../prd.md), [`roadmap.md`](../roadmap.md) y los ADR, no solo lo que ya funciona. Sirven para validar la planificación antes de construirla y, una vez construida, para comprobar que la aplicación hace exactamente lo que describen.

## Cómo leer un manual

Cada manual abre con una ficha:

- **Quién**: el rol que sigue el flujo.
- **Para qué**: el resultado que obtiene.
- **Estado**: `Disponible` (ya funciona así), `Parcial` (funciona una parte) o `Previsto` (aún no existe), con la etapa del roadmap (Now, Next, Later).
- **Requisitos**: los identificadores del PRD que respaldan el flujo.

Los textos entre comillas «así» son los que se ven en pantalla. Donde la planificación no fija un detalle, el manual lo marca con **⚠ Por definir** y propone el comportamiento; esas marcas son las preguntas que la validación debe cerrar.

## Roles

- **Prestador**: quien visita el sitio para conocer la oferta y agendar una cita con GHYCS. En el código y en el PRD se llama *prospecto*.
- **Gestor**: cada uno de los tres socios de GHYCS, que atiende las solicitudes desde la administración.

## Índice

### Prestador

| # | Flujo | Estado |
|---|---|---|
| 1 | [Conocer la oferta de GHYCS](prestador/01-conocer-la-oferta.md) | Parcial · Next |
| 2 | [Agendar una cita](prestador/02-agendar-una-cita.md) | Parcial · Now |
| 3 | [Recibir la invitación y asistir a la cita](prestador/03-asistir-a-la-cita.md) | Previsto · Now |
| 4 | [Consultar o cancelar su cita](prestador/04-consultar-o-cancelar-su-cita.md) | Parcial · Now |
| 5 | [Conocer y ejercer sus derechos sobre sus datos](prestador/05-sus-datos-personales.md) | Parcial · Now |
| 6 | [Preguntar al asistente](prestador/06-preguntar-al-asistente.md) | Previsto · Later |

### Gestor

| # | Flujo | Estado |
|---|---|---|
| 1 | [Entrar y salir de la administración](gestor/01-entrar-y-salir.md) | Parcial · Now |
| 2 | [Enterarse de una solicitud nueva](gestor/02-enterarse-de-una-solicitud-nueva.md) | Previsto · Next |
| 3 | [Revisar las solicitudes](gestor/03-revisar-las-solicitudes.md) | Parcial · Now |
| 4 | [Resolver una invitación que no se envió](gestor/04-resolver-una-invitacion-no-enviada.md) | Parcial · Now |
| 5 | [Cerrar una cita](gestor/05-cerrar-una-cita.md) | Parcial · Now |
| 6 | [Registrar notas de una solicitud](gestor/06-registrar-notas.md) | Parcial · Now |
| 7 | [Retomar una solicitud con la cita cancelada](gestor/07-retomar-una-solicitud-cancelada.md) | Parcial · Now |
| 8 | [Bloquear su tiempo para que no le agenden](gestor/08-bloquear-su-tiempo.md) | Disponible · Now |
| 9 | [Administrar el asistente](gestor/09-administrar-el-asistente.md) | Previsto · Later |
| 10 | [Reenviar el enlace privado y corregir el correo](gestor/10-reenviar-el-enlace-privado.md) | Previsto · Now |

## Mantenimiento

Cómo se valida la aplicación contra estos manuales y cómo se actualizan: [`docs/agents/manuales.md`](../agents/manuales.md).
