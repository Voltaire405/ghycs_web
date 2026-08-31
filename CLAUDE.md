# CLAUDE.md

## Idioma

El idioma predeterminado del proyecto es **español (dialecto colombiano)**. Aplica a issues, specs, ADRs, `CONTEXT.md`, mensajes de commit, descripciones de PR, comentarios de código y toda comunicación con el equipo.

Escribe en **tuteo** («usa», «revisa», «tu salida»), no en tercera persona formal.

Se conservan en su forma original: identificadores de código, nombres de comandos y banderas de CLI, etiquetas del tracker (`needs-triage`, `ready-for-agent`, …) y términos técnicos sin traducción establecida.

Escribe con ortografía completa: tildes, diéresis y `ñ` siempre, nunca sustituidas por su equivalente ASCII.

## Agent skills

### Issue tracker

Los issues viven como GitHub issues en `Voltaire405/ghycs_web`, operados con la CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulario canónico por defecto: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Ver `docs/agents/triage-labels.md`.

### Domain docs

Contexto único: un `CONTEXT.md` en la raíz más `docs/adr/`. Ver `docs/agents/domain.md`.
