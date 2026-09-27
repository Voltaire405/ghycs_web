# Roadmap

Deriva de [mission.md](mission.md). Orden de arriba abajo; un hijo depende de su padre; `← requiere` marca dependencias cruzadas.

## Now — Solicitud con cita

Salida: en producción, un prospecto envía desde el móvil una solicitud con cita, recibe la invitación con videollamada, la cancela por su enlace privado, y el gestor sigue viendo esa solicitud en `/admin` en la posición de su momento.

- [ ] Inicio con acción principal única
  - [ ] Solicitud con autorización de datos (la solicitud es el agregado y la cita un atributo, ADR 0003)
    - [ ] Disponibilidad real (se calcula contra FreeBusy y sin horarios si falla, ADR 0004)
      - [ ] Cita confirmada con videollamada
    - [ ] Consulta y cancelación por enlace privado
    - [ ] Panel del gestor por urgencia
      - [ ] Aviso de sincronización fallida ← requiere Cita confirmada con videollamada

## Next — Prestadores reales

Salida: un prestador ajeno a GHYCS encuentra el sitio, entiende la oferta y agenda sin ayuda, y el gestor se entera de la solicitud sin abrir `/admin`.

- [ ] Presentación de la oferta (el sitio no enumera el marco normativo, ADR 0002)
  - [ ] Portafolio de servicios
  - [ ] Identidad del gestor
  - [ ] Cobertura y modalidad
- [ ] Aviso al gestor ← requiere Solicitud con autorización de datos
- [ ] Continuidad ante fallos externos ← requiere Cita confirmada con videollamada

## Later

- [ ] Asistente sobre la oferta (no interpreta la norma ni accede a solicitudes, ADR 0005) ← requiere Portafolio de servicios
- [ ] Historial de conversaciones ← requiere Asistente sobre la oferta
