# GHYCS — Sistema visual

Gestor de habilitación y calidad en salud. El sitio conecta al **prestador** (IPS,
profesional independiente, objeto social diferente) con el gestor. Su unidad de trabajo
es la **solicitud**: todo lo que se diseñe existe para que una solicitud ocurra o para
atenderla.

## Copy

- Al visitante se le habla de **usted**, en registro neutro. Nada de tuteo en el sitio.
- Las etiquetas de interfaz pueden apartarse del vocabulario interno: el botón dice
  «Agende su cita» aunque la ruta sea `/solicitar`.
- La reunión se llama **la cita**, nunca «cita de diagnóstico»: «diagnóstico» es un
  término a evitar; el trabajo se llama **autoevaluación**.
- El asistente no interpreta la norma: no cita la Resolución 3100 de 2019, no dice qué
  estándares aplican a un prestador concreto, no da plazos ni cifras, no promete
  resultados. Cuando la pregunta cruza ese límite, deriva a `/solicitar`.
- El sitio no enumera el marco normativo.

## Color

Azul petróleo. **No hay verde en el sistema**: el estado de éxito usa el petróleo de
marca, porque un verde junto a un teal se confunde de un vistazo. Rojo para lo
destructivo, ámbar para advertencia, azul para informativo.

Los neutrales (`piedra`) llevan matiz petróleo; no son grises puros.

| Uso | Token | Contraste sobre blanco |
|---|---|---|
| Titulares | `--texto-titular` `#0b3b3c` | 12,3:1 |
| Cuerpo | `--texto-cuerpo` `#2f4746` | 10,4:1 |
| Texto de apoyo | `--texto-apoyo` `#5f7373` | 5,1:1 |
| Enlaces | `--enlace` `#17756e` | 5,5:1 |
| Blanco sobre acción | `--accion` `#115e59` | 7,5:1 |
| `--color-petroleo-500` `#2a9187` | — | 3,8:1 — **solo bordes y rellenos**, nunca texto |

## Tipografía

Lora (`--font-display`) en `h1`–`h3`. Source Sans 3 (`--font-sans`) de `h4` hacia abajo y
en toda la interfaz. En textos largos, ancho de línea de 68 caracteres: clase `.prosa`
(`max-width: var(--medida)`).

## Modo oscuro

Implementado con `prefers-color-scheme` y anulable con `[data-tema="claro"]` en la raíz.
Está sin revisión visual: si diseñas una pantalla, revísala en ambos modos o dilo.

## Superficies típicas del producto

- Públicas: `/`, `/nosotros`, `/servicios`, `/solicitar`, `/solicitar/confirmacion`,
  `/solicitud/[token]`, `/politica-de-datos`, `/404`. Widget de asistente flotante en todas.
- Privadas: `/login`, `/admin` (solicitudes, urgentes destacadas), `/admin/solicitudes/[id]`,
  `/admin/conversaciones`.

Los dos ejes de una solicitud son independientes y ambos se muestran: `tipo_prestador`
(IPS · profesional independiente · objeto social diferente) y `momento` (habilitación
inicial · novedad · hallazgo · cierre del servicio). `/admin` ordena por urgencia:
cierre del servicio primero, luego hallazgo, luego novedad y habilitación inicial.

Estados de la cita, con su insignia: agendada, cancelada, atendida, no asistió.
