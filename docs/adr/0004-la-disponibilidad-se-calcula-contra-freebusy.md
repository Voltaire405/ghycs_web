# La disponibilidad se calcula contra FreeBusy; no hay tabla de bloqueos

Google Calendar aporta **ocupación**, no disponibilidad. La disponibilidad la define el sitio: horario base menos la ocupación que reporta FreeBusy. El horario base —días hábiles, franjas, duración de la cita— vive en variables de entorno, no en base de datos, y no existe tabla de bloqueos ni interfaz para administrarla.

La alternativa era una tabla de bloqueos que el gestor alimentara desde `/admin`. Se descarta porque obliga a mantener dos agendas en paralelo: el gestor ya bloquea su tiempo en su propio calendario, y cualquier cosa que anote allí y olvide replicar en el sitio produce una cita encima de un compromiso real. La fuente de verdad de cuándo el gestor está tomado es su calendario, y el sitio no debe intentar duplicarla.

## Consecuencias

El sitio depende de Google para ofrecer horarios. Si FreeBusy no responde, no hay disponibilidad que mostrar; hay que decidir si se degrada a solicitud sin agenda o se muestra un error, y hoy no está definido.

La consulta a FreeBusy no es el candado contra doble reserva: solo evita ofrecer horarios que Google ya sabe ocupados. El candado sigue siendo el índice único de la base de datos, según el ADR-0003.

Cambiar el horario de atención es un despliegue, no una edición desde `/admin`. Es aceptable mientras el horario base cambie pocas veces al año; si empieza a cambiar seguido, esta decisión se revisa.
