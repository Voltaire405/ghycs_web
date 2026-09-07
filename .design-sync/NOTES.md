# Notas de design-sync

- **No aplica ningún shape del converter.** El repo no tiene librería de componentes ni
  Storybook: `apps/web` es el scaffold de Next.js. `ds-bundle/` se escribe a mano.
- `ds-bundle/tokens/ghycs.css` se deriva de `docs/specs/ghycs-tokens.css` con:
  borrar `@import "tailwindcss"`, `@theme {` y `@theme inline {` → `:root {`, y un reset
  mínimo envuelto en `@layer base`. Si cambian los tokens, repetir esa transformación.
- El reset **debe** ir dentro de `@layer base`: fuera de capa, `button { color: inherit }`
  gana sobre `@layer components` y deja `.btn-primario` con texto ilegible sobre petróleo.
- Fuentes por `@import` de Google Fonts (Lora + Source Sans 3), con fallbacks en los tokens.
- Verificado en Chrome contra `ds-bundle/styles.css`: variables, capa base, `.prosa` (68ch
  → 540px), los tres botones, `.campo` y las tres insignias. Modo oscuro **no** verificado
  visualmente (el sistema estaba en claro) — coincide con el riesgo abierto del diseño preliminar.
- Cuando existan componentes React reales, reevaluar: pasar a shape `package` con un
  `packages/ui` compilado, y este bundle a mano se retira.
- `conventions.md` enumera variables y clases porque el agente de Claude Design no tiene
  el repo. `docs/agents/interfaz.md` no las repite: apunta a `ghycs-tokens.css`. Si cambian
  los tokens, `conventions.md` es lo que hay que revisar.
