# Interfaz

Cómo intervenir componentes, páginas, estilos y copy visible del sitio.

## Sistema visual

Los tokens son `docs/specs/ghycs-tokens.css` (Tailwind v4, configuración en CSS): escala
de marca, semánticos con modo oscuro, capa base y las clases del sistema (`.prosa`,
`.btn-*`, `.tarjeta`, `.campo`, `.insignia-*`). Léelo antes de estilar; es la fuente de
verdad y esta página no repite sus valores.

Cuatro reglas que el archivo no confiesa por sí solo:

- **Estiliza contra los tokens semánticos** (`--texto-cuerpo`, `--accion`, `--borde`…).
  La escala cruda —`--color-petroleo-*`, `--color-piedra-*`— existe solo para definirlos.
- **El éxito usa el petróleo de marca.** Un verde junto a un teal se confunde de un
  vistazo, así que el sistema no trae verde. Rojo para lo destructivo, ámbar para
  advertencia, azul para informativo.
- **`--color-petroleo-500` va en bordes y rellenos**, nunca en texto: da 3,8:1 sobre blanco.
- **`.prosa` en todo texto largo**, para respetar la medida de 68 caracteres.

El modo oscuro está implementado con `prefers-color-scheme` y sin revisión visual. Si
tocas una pantalla, revísala en ambos modos o dilo al entregar.

`ghycs-guia-estilos.html` es la muestra visual del sistema; ábrela para ver el conjunto.

## Copy visible

**Al visitante se le habla de usted**, en registro neutro. El tuteo de `CLAUDE.md` cubre
la comunicación con el equipo, no el contenido del sitio.

Las etiquetas de interfaz pueden apartarse del glosario cuando el visitante no lo
comparte: el botón dice «Agende su cita» aunque la ruta sea `/solicitar` y la tabla
`solicitudes`. El vocabulario de `CONTEXT.md` manda en el código y la base de datos.

La reunión se llama **la cita**. El trabajo se llama **autoevaluación**: «diagnóstico»
está entre los términos a evitar.

El sitio no enumera el marco normativo (ADR-0002) y el asistente no interpreta la norma
(ADR-0005).

## Producto

`docs/specs/diseno-preliminar.md` tiene el mapa de rutas, los dos ejes de la solicitud
(`tipo_prestador` y `momento`), el orden por urgencia de `/admin` y los estados de la cita.

## Claude Design

`ds-bundle/` es la exportación de este sistema al proyecto de claude.ai/design; se genera
desde los tokens, no se edita a mano. Ver `.design-sync/NOTES.md`.
