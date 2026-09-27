---
name: setup-ssd-roadmap
description: Construye o rehace docs/roadmap.md como árbol de capacidades en horizontes Now/Next/Later, derivado de la misión, con criterio de salida por horizonte.
disable-model-invocation: true
---

# setup-ssd-roadmap

El roadmap es parte de la **constitución** del repo junto a `docs/mission.md` (y `docs/tech-stack.md`, que deriva de ambos). Responde qué capacidades existen, en qué orden y cuándo un horizonte está cumplido. No lleva fechas, estimaciones ni responsables: eso vive en el issue tracker.

## Pasos

### 1. Misión

Lee `docs/mission.md`. Si falta, redáctala con el usuario: un párrafo que diga qué es el producto, para quién y qué permite hacer. Completo cuando `docs/mission.md` existe y el usuario la aprobó.

### 2. Inventario de capacidades

Reúne candidatas desde la misión, `CONTEXT.md`, los ADR en `docs/adr/`, los issues abiertos y lo que el usuario nombre. Cada capacidad es un sustantivo del dominio ("Proyectos y miembros", "Búsqueda y filtros"), nunca una tarea ("implementar búsqueda"). Si existe glosario en `CONTEXT.md`, usa su término en español. Completo cuando cada frase de la misión está cubierta por al menos una capacidad y cada capacidad traza a una frase de la misión; lo que no traza se descarta o se declara decisión abierta.

### 3. Horizontes y salida

Reparte las capacidades en tres horizontes:

- **Now** — el flujo mínimo que hace usable el producto. Su **salida** preferida es el _dogfooding_: el producto se usa para construirse a sí mismo.
- **Next** — lo que hace falta para que un usuario externo real adopte el flujo completo.
- **Later** — lista plana de lo que la misión pide pero no bloquea a nadie hoy. Sin salida.

Now y Next llevan cada uno una línea `Salida:`: un estado observable y binario (se cumple o no), no una lista de entregables. Completo cuando cada salida pasa esa prueba y el usuario aprobó el reparto.

### 4. Árbol de dependencias

Dentro de cada horizonte, anida: un hijo depende de su padre. La raíz es lo que todo lo demás necesita (p. ej. usuarios y roles). Hermanos al mismo nivel son independientes entre sí. Una dependencia que cruza ramas u horizontes se marca al final del ítem con `← requiere <nombre exacto del ítem>`. Una decisión ya tomada que acota el ítem se cita entre paréntesis con su ADR. Completo cuando cada `← requiere` apunta a un ítem existente, escrito idéntico, en el mismo horizonte o en uno anterior.

### 5. Escribir `docs/roadmap.md`

```markdown
# Roadmap

Deriva de [mission.md](mission.md). Orden de arriba abajo; un hijo depende de su padre; `← requiere` marca dependencias cruzadas.

## Now — <nombre del horizonte>

Salida: <estado observable>.

- [ ] <Capacidad raíz>
  - [ ] <Capacidad hija>
    - [ ] <Capacidad nieta>
  - [ ] <Otra hija> ← requiere <Capacidad nieta>

## Next — <nombre del horizonte>

Salida: <estado observable>.

- [ ] <Capacidad> (<decisión vigente>, ADR NNNN)

## Later

- [ ] <Capacidad> ← requiere <Capacidad de Next>
```

Un ítem se marca `[x]` solo cuando su capacidad está entregada; un padre, cuando todos sus hijos lo están.

### 6. Enlazar la constitución

En `CLAUDE.md` (o `AGENTS.md`), asegura una sección:

```markdown
## Constitución

La constitución del proyecto son `docs/mission.md`, `docs/tech-stack.md` y `docs/roadmap.md`. Léela antes de implementar, planificar o proponer cualquier artefacto; toda salida se alinea con ella, y cualquier desviación se declara como decisión abierta.
```

Nombra solo los archivos que existen. Completo cuando el puntero está y cada archivo nombrado existe.

## Mantenimiento

Al cambiar el alcance: renombra el ítem en todos sus `← requiere`, mueve capacidades entre horizontes en lugar de duplicarlas y registra en un ADR la decisión que motivó el cambio. Commit con `docs(roadmap): <qué cambió>`.
