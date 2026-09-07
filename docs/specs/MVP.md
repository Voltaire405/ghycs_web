# MVP — Primera entrega del sitio de GHYCS

| Campo | Valor |
|---|---|
| Versión | 0.1 · 2026-09-06 |
| Documento origen | `SRD.md`; este documento solo recorta, no agrega requisitos |
| Criterio de corte | Una bala trazadora completa: visitante → solicitud con cita → calendario y correo → gestor la ve y la opera |

## 1. Pantallas

| Ruta | Alcance en el MVP |
|---|---|
| `/` | Inicio mínimo: título, un párrafo, los tres bloques por tipo de prestador (RS-F-035) y «Agende su cita» (RS-F-036). Sin `/nosotros` ni `/servicios`; los bloques enlazan a `/solicitar`. |
| `/solicitar` | Formulario con selector de disponibilidad (horario base − FreeBusy − citas en base de datos). Casilla de autorización desmarcada con enlace a `/politica-de-datos`; envío deshabilitado hasta marcarla. |
| `/solicitar/confirmacion` | Fecha, hora en `America/Bogota` y aviso de que la invitación llega por correo. |
| `/solicitud/[token]` | Fecha, hora y estado de la cita; botón de cancelar solo si está `agendada` y es futura. 404 si el token no existe. |
| `/login` | Correo + contraseña contra `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH`; 5 intentos por IP en 15 minutos. |
| `/admin` | Listado ordenado por urgencia con insignia en `sincronizacion = 'pendiente'`. Sin filtros. |
| `/admin/solicitudes/[id]` | Detalle con cambio de `cita_estado` (`atendida`, `no_asistio`) y `notas_gestor`. Sin reintento de sincronización. |
| `/politica-de-datos` | Página estática mínima. Requisito del formulario, no pantalla del sistema. |
| `not-found` | 404 con el sistema visual y enlace a inicio. |

## 2. Integraciones

- **Google Calendar**: FreeBusy, creación del evento con videollamada, eliminación al cancelar, URL de cancelación en la descripción del evento.
- **Resend**: correo de confirmación al prospecto y aviso al gestor.

## 3. Requisitos del SRD incluidos

- Interfaces: RS-I-001 a RS-I-007, RS-I-010 a RS-I-013.
- Disponibilidad y solicitud: RS-F-001 a RS-F-014, RS-F-042 a RS-F-044.
- Administración: RS-F-015 a RS-F-018, RS-F-020 a RS-F-022, RS-F-039.
- Páginas: RS-F-034 (solo `/` y `/politica-de-datos`), RS-F-035 a RS-F-038, RS-F-041.
- Datos: RS-D-001 a RS-D-003, RS-D-005, RS-D-006, RS-D-008. `limites_ip` solo con ámbito `acceso`.
- No funcionales: RS-NF-001 a RS-NF-005, RS-NF-007 a RS-NF-010, RS-NF-012, RS-NF-014 a RS-NF-016.
- Diseño y arquitectura: RS-R-001 a RS-R-011 completos.

## 4. Fuera del MVP

| Qué | Requisitos | Por qué |
|---|---|---|
| Asistente completo (módulo, `/api/asistente`, `/admin/conversaciones`) | RS-I-008, RS-I-009, RS-F-024 a RS-F-033, RS-D-004, RS-D-007, RS-D-009, RS-NF-013 | No participa en la bala trazadora; agregarlo después no toca el flujo de solicitud |
| `/nosotros`, `/servicios` | RS-F-034 (parcial) | Contenido antes de validar el flujo |
| Reintento de sincronización | RS-F-023 | Deseable; el gestor crea el evento a mano mientras tanto |
| Aviso de credencial de Google en `/admin` | RS-NF-011 | Se cubre con el aviso al gestor por correo (RS-F-043), que ya lleva el estado de sincronización |
| Correo de cancelación | RS-F-045 | Google ya notifica la eliminación del evento |
| Filtro por estado en `/admin` | RS-F-019 | Con pocas solicitudes basta el orden por urgencia |
| Rendimiento ≥ 90 en Lighthouse | RS-NF-006 | Se mide, no se exige, en la primera entrega |

## 5. Decisión que el MVP obligó a cerrar

TBD-1 (fallo de FreeBusy) queda resuelto en ADR-0004: sin ocupación conocida no se ofrece ningún horario.
