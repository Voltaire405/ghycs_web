# Manuales

`docs/manuals/` es el **oráculo** del comportamiento visible: cada manual describe un flujo como el usuario debe vivirlo, de principio a fin. La aplicación es correcta cuando hace exactamente lo que dice su manual. El formato y el índice están en [`docs/manuals/README.md`](../manuals/README.md).

## Validar contra el manual

Al probar, revisar o dar por terminado un cambio de cara al usuario:

1. Ubica en el índice los manuales de los flujos que toca el cambio.
2. Recorre cada paso y cada fila de «Caminos alternativos y problemas» contra la aplicación en marcha o, si no se puede levantar, contra el código y las pruebas. Compara literalmente: el texto entre «» es el copy exacto.
3. Clasifica cada punto como **coincide** o **difiere**.

Terminado cuando todos los pasos y todas las filas de esos manuales tienen su clasificación. Reporta cada diferencia con el manual, el punto y lo que hace la aplicación.

Una diferencia se lee según la ficha **Estado**:

- **Disponible**: es un defecto; el manual manda.
- **Parcial** o **Previsto**: es esperada en la parte que la ficha declara sin construir; fuera de ella, es un defecto.

Cuando el manual parezca el equivocado, llévalo al usuario como decisión abierta y corrige el lado que decida.

## Actualizar el manual

Todo cambio en lo que el usuario ve o hace —ruta, pantalla, copy, mensaje, botón, estado, correo o regla que altere un flujo— actualiza su manual en el mismo commit:

- Pasos y filas afectados, con el copy nuevo literal.
- La ficha: **Estado** (una parte construida pasa de Previsto a Parcial o a Disponible) y **Requisitos**.
- Cada **⚠ Por definir** que el cambio resuelve, reemplazado por el comportamiento decidido.
- Un flujo nuevo: su archivo y su fila en el índice, con el estado de la fila igual al de la ficha.

Terminado cuando `grep -rn "<copy anterior>" docs/manuals` no devuelve nada por cada texto visible que cambió, y el índice coincide con las fichas.

Un cambio de planificación (PRD, roadmap o ADR) que altere un flujo sigue la misma regla: el manual cambia en el mismo commit.
