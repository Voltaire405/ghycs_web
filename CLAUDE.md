# CLAUDE.md

## Idioma

El idioma predeterminado del proyecto es **español (dialecto colombiano)**, en tuteo. Aplica a issues, specs, ADRs, `CONTEXT.md`, mensajes de commit, descripciones de PR, comentarios de código y toda comunicación con el equipo.

El copy visible del sitio va aparte: al visitante se le habla de **usted**. Ver `docs/agents/interfaz.md`.



## Preferencias de usuario

- Comprueba siempre si existe el archivo [CLAUDE.local.md](http://CLAUDE.local.md) y lee su contenido.

## Agent skills

### Issue tracker

Los issues viven como GitHub issues en `Voltaire405/ghycs_web`, operados con la CLI `gh`. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulario canónico por defecto: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Ver `docs/agents/triage-labels.md`.

### Interfaz

Al escribir componentes, páginas, estilos o copy visible: tokens en `docs/specs/ghycs-tokens.css`. Ver `docs/agents/interfaz.md`.

### Domain docs

Contexto único: un `CONTEXT.md` en la raíz más `docs/adr/`. Ver `docs/agents/domain.md`.
