# GHYCS — cómo construir con este sistema

Sistema visual de un gestor de habilitación y calidad en salud (Colombia). **No hay
librería de componentes React**: lo que se sincroniza son los tokens, la capa base y un
puñado de clases CSS. Construye con HTML/JSX plano y estas clases; para el layout propio
usa las variables, nunca valores literales.

## Setup

No hay provider ni wrapper. Basta con que `styles.css` esté cargado — él importa
`tokens/ghycs.css`, que trae las fuentes de Google (Lora + Source Sans 3), un reset
mínimo, los tokens y la capa base. La capa base ya estiliza `body`, `h1`–`h4`, `a`, `hr`
y `:focus-visible`: no los vuelvas a estilar salvo que haga falta.

Modo oscuro automático por `prefers-color-scheme`; para forzar claro, `data-tema="claro"`
en el elemento raíz.

## Idioma del estilo: variables semánticas

Estiliza contra los tokens **semánticos**, no contra la escala cruda (`--color-petroleo-*`,
`--color-piedra-*`), que solo existe para definirlos.

- Superficies: `--superficie-pagina`, `--superficie`, `--superficie-suave`, `--superficie-marca`
- Texto: `--texto-titular`, `--texto-cuerpo`, `--texto-apoyo`, `--texto-invertido`
- Bordes: `--borde`, `--borde-fuerte`, `--borde-marca`
- Acción: `--accion`, `--accion-hover`, `--accion-activa`, `--accion-texto`
- Enlaces: `--enlace`, `--enlace-hover`
- Estados (`-fondo`, `-borde`, `-texto` cada uno): `--exito-*`, `--alerta-*`, `--error-*`, `--info-*`
- Foco: `--foco` · Ancho de lectura: `--medida` (68ch)
- Tipografía: `--font-display`, `--font-sans`, `--font-mono`; tamaños `--text-caption`,
  `--text-sm`, `--text-base`, `--text-lead`, `--text-h3`, `--text-h2`, `--text-h1`, `--text-display`
- Radios: `--radius-sm|md|lg|full` · Sombras: `--shadow-sutil`, `--shadow-elevada`

**El éxito usa el petróleo de marca. No introduzcas verde.**

## Clases disponibles

`.prosa` · `.btn-primario` · `.btn-secundario` · `.btn-destructivo` · `.tarjeta` ·
`.campo` · `.insignia` (siempre con una variante: `.insignia-agendada`,
`.insignia-cancelada`, `.insignia-pendiente`)

Eso es todo lo que existe. Cualquier otra cosa la escribes tú con las variables de
arriba; no inventes nombres de clase del sistema que no estén en esta lista.

## Ejemplo idiomático

```html
<article class="tarjeta" style="display:grid; gap:.75rem; max-width:34rem">
  <header style="display:flex; align-items:center; justify-content:space-between; gap:1rem">
    <h3 style="margin:0">Clínica San Rafael</h3>
    <span class="insignia insignia-agendada">Agendada</span>
  </header>
  <p style="margin:0; color:var(--texto-apoyo); font-size:var(--text-sm)">
    IPS · Hallazgo en visita de verificación
  </p>
  <p class="prosa" style="margin:0">Requieren acompañamiento para el plan de mejoramiento.</p>
  <div style="display:flex; gap:.5rem">
    <button class="btn-primario">Ver solicitud</button>
    <button class="btn-secundario">Aplazar</button>
  </div>
</article>
```

## Dónde está la verdad

`_ds/<carpeta>/styles.css` y `_ds/<carpeta>/tokens/ghycs.css` — léelos antes de estilar.
El contexto de producto, copy y tono está en `guidelines/sistema-visual.md`.
