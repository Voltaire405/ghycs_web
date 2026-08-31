# Documentos de dominio

Cómo deben consumir las skills de ingeniería la documentación de dominio de este repo al explorar el código.

Estos documentos se escriben en español (dialecto colombiano) y en tuteo, según la convención de idioma en `CLAUDE.md`.

## Antes de explorar, lee esto

- **`CONTEXT.md`** en la raíz del repo, o
- **`CONTEXT-MAP.md`** en la raíz si existe — apunta a un `CONTEXT.md` por contexto. Lee cada uno que sea relevante al tema.
- **`docs/adr/`** — lee los ADR que toquen el área en la que vas a trabajar. En repos multi-contexto, revisa también `src/<context>/docs/adr/` para decisiones acotadas a un contexto.

Si alguno de estos archivos no existe, **sigue sin decir nada**. No señales su ausencia; no propongas crearlos por adelantado. La skill `/domain-modeling` (a la que se llega desde `/grill-with-docs` e `/improve-codebase-architecture`) los crea de forma perezosa, cuando de verdad se resuelven términos o decisiones.

## Estructura de archivos

Repo de contexto único (el caso de la mayoría):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-pedidos-event-sourced.md
│   └── 0002-postgres-para-el-modelo-de-escritura.md
└── src/
```

Repo multi-contexto (presencia de `CONTEXT-MAP.md` en la raíz):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← decisiones de todo el sistema
└── src/
    ├── pedidos/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← decisiones propias del contexto
    └── facturacion/
        ├── CONTEXT.md
        └── docs/adr/
```

## Usa el vocabulario del glosario

Cuando tu salida nombre un concepto del dominio (en el título de un issue, una propuesta de refactor, una hipótesis, el nombre de una prueba), usa el término tal como está definido en `CONTEXT.md`. No te desvíes hacia sinónimos que el glosario evita explícitamente.

Si el concepto que necesitas todavía no está en el glosario, eso es una señal: o estás inventando lenguaje que el proyecto no usa (reconsidéralo) o hay un vacío real (anótalo para `/domain-modeling`).

## Señala los conflictos con ADR

Si tu salida contradice un ADR existente, dilo de frente en lugar de pasarlo por alto:

> _Contradice el ADR-0007 (pedidos event-sourced), pero vale la pena reabrirlo porque…_
