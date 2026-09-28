# Bloquear su tiempo para que no le agenden

- **Quién**: socio de GHYCS dueño del calendario donde se agendan las citas.
- **Para qué**: que el sitio no ofrezca horas en las que usted tiene otro compromiso.
- **Estado**: Previsto · Now. Hoy el sitio usa una ocupación de ejemplo; está previsto leer el calendario real.
- **Requisitos**: RP-F-007, RC-3 (ADR-0004).

## Cómo decide el sitio qué horas ofrecer

El sitio parte del **horario de atención**: lunes a viernes, de 8:00 a 12:00 y de 2:00 a 5:00, en citas de 45 minutos, con al menos 24 horas de anticipación y hasta 30 días adelante. A ese horario le quita:

- Todo lo que aparezca **ocupado en su Google Calendar**.
- Las citas ya agendadas en el sitio.

No hay una pantalla de bloqueos en la administración: **su calendario es la única agenda**.

**⚠ Por definir**: de quién es el calendario que se consulta, si de un socio o de una cuenta de la marca, y si las citas rotan entre socios (TBD-2).

## Pasos

1. Abra Google Calendar con la cuenta que usa el sitio.
2. Cree un evento en el tiempo que quiere bloquear: una reunión, una visita, vacaciones o un día completo.
3. Deje el evento como **«Ocupado»** (es lo normal en Google Calendar).
4. Desde ese momento, esas horas ya no aparecen en «Agende su cita».

## Caminos alternativos y problemas

| Lo que pasa | Por qué | Qué hacer |
|---|---|---|
| Creó un evento y la hora sigue apareciendo | El evento quedó como «Disponible», o está en otro calendario o en otra cuenta. | Abra el evento y cámbielo a «Ocupado», en el calendario de la cuenta que usa el sitio. |
| Alguien ya había agendado esa hora antes de bloquearla | El bloqueo no cancela citas existentes. | Comuníquese con el prestador, pídale que cancele con su enlace y agende otra hora. |
| Quiere cambiar el horario de atención (días, franjas, duración) | El horario no se cambia desde la administración. | Pídalo al administrador técnico: es un cambio de configuración del sitio. Para excepciones puntuales, bloquee en el calendario. |
| En «Agende su cita» sale «No es posible consultar la disponibilidad ahora» | El sitio no logra leer su calendario. Por seguridad no ofrece horas. | Avise al administrador técnico. Los prestadores no pueden agendar mientras dure. |
| Se ocupa la media hora antes de una cita | Una cita dura 45 minutos: si cualquier parte se cruza con un evento, esa hora no se ofrece. | Es lo esperado. |
