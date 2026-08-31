# La solicitud es el agregado y la cita un atributo suyo

El sitio existe para producir solicitudes, y el prospecto describe su situación y elige horario en un mismo flujo. Lo que se persiste es una solicitud que además trae una hora agendada: la cita es un atributo de la solicitud, no una entidad con vida propia.

La consecuencia que decide la elección es qué pasa al cancelar. Con la solicitud como agregado, cancelar la cita deja la solicitud viva y sin atender, visible para el gestor. Con la cita como agregado, el prospecto desaparece del sistema justo después de haberse identificado y de haber contado qué necesita, que es lo más valioso que produce el sitio.

## Opciones consideradas

- **A. Solicitud sin agenda.** Formulario y respuesta posterior. Elimina la integración con calendario, pero el prospecto se va sin fecha y la conversión queda atada al tiempo de respuesta del gestor.
- **B. Cita como agregado.** Mayor poder de conversión, pero desplaza a la solicitud del centro del modelo y contradice el glosario, donde la solicitud es la unidad de trabajo del sitio.
- **C. Solicitud como agregado, cita como atributo.** Elegida. Conserva el agendamiento en el mismo flujo sin perder la solicitud cuando la cita se cae.

## Consecuencias

El estado de la cita —agendada, cancelada, atendida, no asistió— vive dentro de la solicitud. Una solicitud con la cita cancelada no es una solicitud muerta: es trabajo pendiente y `/admin` debe mostrarla como tal.

El candado contra doble reserva es de la base de datos, no del calendario externo, porque el agregado que se protege es la solicitud.

La reunión se llama **la cita**, sin apellido. Se descartó «cita de diagnóstico» porque «diagnóstico» ya está entre los términos a evitar de `autoevaluación`, y confundir ambas cosas en el copy sugeriría que el gestor entrega en una reunión gratuita lo que en realidad es parte del servicio.
