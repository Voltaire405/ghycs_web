# El asistente no interpreta la norma ni accede a los datos de solicitudes

El asistente responde preguntas sobre la oferta del gestor y deriva a `/solicitar` cuando la pregunta las excede. No interpreta la Resolución 3100 de 2019 ni ninguna otra norma, no indica qué estándares aplican a un prestador concreto, no da plazos ni cifras, no promete resultados. Tampoco lee la tabla de solicitudes ni crea reservas.

El límite es comercial antes que técnico: determinar qué le aplica a un prestador es exactamente el servicio que se vende, y un asistente que lo regale a medias compite con su propio negocio y responde peor que una persona. Se refuerza con el ADR-0002: si los propios anclas normativos tienen citas sin confirmar, el asistente no puede repetirlas.

## Consecuencias

Agendar desde el asistente sería la funcionalidad obvia y se descarta: agrega riesgo sin beneficio, porque `/solicitar` ya son dos clics. Con alcance estrecho y sin herramientas conectadas, el peor caso de un intento de manipulación es una respuesta rara, no una fuga de datos de prospectos.

El valor del asistente queda atado por completo a la calidad de `servicios.md` y `faq.md`. Con contenido genérico, el modelo improvisa sobre la norma, que es justo el escenario que esta decisión evita. El contenido es el camino crítico, no la integración.

El asistente le habla al visitante en usted, según la regla de registro de `CLAUDE.md`.
