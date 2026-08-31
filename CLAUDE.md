# CLAUDE.md

## Idioma

El idioma predeterminado del proyecto es **español (dialecto colombiano)**. Aplica a issues, specs, ADRs, `CONTEXT.md`, mensajes de commit, descripciones de PR, comentarios de código, el copy del sitio y toda comunicación con el equipo.

Hay dos registros, según el interlocutor:

- **Tuteo** («usa», «revisa», «tu salida») en la interacción del agente con los consultores: issues, specs, ADR, `CONTEXT.md`, mensajes de commit, descripciones de PR y comentarios de código. Nunca tercera persona formal.
- **Usted**, en registro neutro, en todo el copy visible del sitio: páginas, etiquetas de interfaz, correos y respuestas del asistente. El interlocutor ahí es el prestador, que llega en un contexto regulatorio y muchas veces institucional; en Colombia esa relación se sostiene en usted.

El asistente es el punto donde más fácil se filtra el registro equivocado: lo alimenta contenido que los consultores escriben en tuteo, pero le responde al visitante en usted.

Las etiquetas de interfaz pueden apartarse del glosario cuando el visitante no lo comparte —el botón puede decir «Agende su cita» aunque la ruta sea `/solicitar` y la tabla `solicitudes`—, pero nunca del registro.

Se conservan en su forma original: identificadores de código, nombres de comandos y banderas de CLI, etiquetas del tracker (`needs-triage`, `ready-for-agent`, …) y términos técnicos sin traducción establecida.

Escribe con ortografía completa: tildes, diéresis y `ñ` siempre, nunca sustituidas por su equivalente ASCII.

## Agent skills

### Issue tracker

Los issues viven como GitHub issues en `Voltaire405/ghycs_web`, operados con la CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulario canónico por defecto: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Ver `docs/agents/triage-labels.md`.

### Domain docs

Contexto único: un `CONTEXT.md` en la raíz más `docs/adr/`. Ver `docs/agents/domain.md`.
