# Interfaz

Cómo intervenir componentes, páginas, estilos y copy visible del sitio.

## Sistema visual

El sistema es `ds-bundle/`. Léelo antes de estilar:

- `ds-bundle/README.md`: variables semánticas, las únicas clases que existen y el ejemplo
  idiomático.
- `ds-bundle/guidelines/sistema-visual.md`: color y contraste, tipografía, modo oscuro,
  copy y superficies del producto.
- `ds-bundle/tokens/ghycs.css`: los valores.

Las rutas `_ds/<carpeta>/` del README son el montaje dentro de Claude Design; en este
repo equivalen a `ds-bundle/`.

Lo que el bundle no sabe del repo:

- La app carga `docs/specs/ghycs-tokens.css` (Tailwind v4, `@theme`) desde
  `apps/web/src/app/globals.css`; el bundle es esa misma escala aplanada a `:root`.
  Un valor nuevo se edita en `ghycs-tokens.css` y se rederiva al bundle siguiendo
  `.design-sync/NOTES.md`.
- `docs/specs/ghycs-guia-estilos.html` es la muestra visual; ábrela para ver el conjunto.

## Copy visible

Las reglas de copy están en `ds-bundle/guidelines/sistema-visual.md`. Añade una: el
vocabulario de `CONTEXT.md` manda en el código y la base de datos aunque la etiqueta
visible se aparte de él. Las prohibiciones normativas son ADR-0002 (el sitio no enumera
el marco) y ADR-0005 (el asistente no interpreta la norma).

## Producto

`docs/specs/diseno-preliminar.md` tiene el mapa de rutas, los dos ejes de la solicitud
(`tipo_prestador` y `momento`), el orden por urgencia de `/admin` y los estados de la cita.
