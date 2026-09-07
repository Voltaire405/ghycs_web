# SRD — Sitio web de GHYCS

| Campo | Valor |
|---|---|
| Documento | Software Requirements Document (especificación de requisitos de software) |
| Norma de referencia | ISO/IEC/IEEE 29148:2018, cláusula 9.5 (SRS) |
| Versión | 0.1 · 2026-09-06 |
| Estado | Borrador para revisión técnica |
| Documento origen | `PRD.md`; todo `RS-*` traza a uno o más `RP-*` |
| Validación | `python3 docs/requisitos/validar_requisitos.py` verifica identificadores, singularidad, campos y trazabilidad |

## 1. Introducción

### 1.1 Propósito

Especifica el software que satisface el PRD: qué hace cada parte, con qué se integra, qué datos guarda, qué atributos de calidad cumple y bajo qué arquitectura se construye. Es la base para implementar, probar y aceptar la primera etapa.

### 1.2 Alcance

Una aplicación Next.js que sirve el sitio público, la administración del gestor y dos endpoints de API. Se integra con Google Calendar para ocupación e invitaciones, con Resend para el correo transaccional, con un proveedor de modelos de lenguaje para el asistente, y con PostgreSQL como único almacén.

Fuera del alcance: registro de prestadores, panel de contenido, pagos, roles, recordatorios propios, sincronización bidireccional con el calendario y cualquier funcionalidad para transporte especial de pacientes.

### 1.3 Referencias

`PRD.md` · `CONTEXT.md` · `docs/adr/0001` a `0005` · `ghycs-tokens.css` · `content/asistente/` · Ley 1581 de 2012 · WCAG 2.2.

## 2. Descripción general

### 2.1 Perspectiva del producto

```
Visitante ──► Sitio público (Next.js) ──► POST /api/solicitudes ──► PostgreSQL
                    │                              │
                    │                              ├──► Google Calendar (FreeBusy, Events)
                    │                              └──► Resend (confirmación, aviso al gestor)
                    └──► POST /api/asistente ─────────► Proveedor de modelo de lenguaje
Gestor ────► /admin (Next.js, sesión) ────────────────► PostgreSQL
Gestor ────► Google Calendar (su propio cliente) ◄────  ocupación real
```

### 2.2 Funciones del producto

Presentar la oferta · calcular disponibilidad · crear solicitudes con cita · emitir invitaciones · permitir cancelación por enlace · administrar solicitudes por urgencia · responder preguntas sobre la oferta · controlar el consumo del asistente.

### 2.3 Usuarios

| Usuario | Características |
|---|---|
| Visitante / prospecto | Sin cuenta; llega mayoritariamente desde móvil; contexto regulatorio; se le habla en usted |
| Gestor | Una sola cuenta; usa escritorio; revisa `/admin` a diario |

### 2.4 Restricciones generales

Las de `PRD.md` §4.1, más: un solo despliegue (sin servicios aparte), PostgreSQL como único almacén, contenido en el repositorio.

### 2.5 Supuestos y dependencias

Las de `PRD.md` §4.2, más: el gestor autorizó una vez el acceso OAuth a su calendario y la aplicación de Google Cloud está publicada en estado *Production*.

## 3. Arquitectura por capas

Esta sección fija restricciones de diseño verificables. Se adopta una **arquitectura por capas con dependencias hacia el dominio**: cada módulo de negocio tiene cuatro capas; las externas dependen de las internas y nunca al revés. No hay contenedor de inyección de dependencias ni puertos de entrada: el manejador de ruta llama al caso de uso directamente.

### 3.1 Capas y responsabilidades

| Capa | Contiene | Puede importar de | No puede importar de |
|---|---|---|---|
| **Presentación** (`app/`, `modulos/*/ui/`) | Rutas, páginas, componentes React, manejadores de ruta | aplicación, compartido/ui | infraestructura, cliente de base de datos |
| **Aplicación** (`modulos/*/aplicacion/`) | Casos de uso: un archivo por caso, una función `ejecutar(comando)`; orquestan y transaccionan | dominio | presentación, infraestructura, Next.js |
| **Dominio** (`modulos/*/dominio/`) | Entidades, objetos de valor, reglas, estados, **puertos de salida** (interfaces) | nada externo al módulo salvo `compartido/tipos` | Next.js, Drizzle, googleapis, SDK del modelo |
| **Infraestructura** (`modulos/*/infraestructura/`) | Adaptadores que implementan los puertos: PostgreSQL, Google Calendar, proveedor del modelo | dominio, compartido/bd, compartido/config | presentación, aplicación |

La composición —qué adaptador concreto recibe cada caso de uso— vive en un único archivo `componer.ts` por módulo. Las pruebas construyen los casos de uso con implementaciones falsas de los puertos.

### 3.2 Estructura de directorios

```
src/
├── app/                                  presentación · rutas (App Router)
│   ├── (publico)/
│   │   ├── page.tsx                      /
│   │   ├── nosotros/page.tsx
│   │   ├── servicios/page.tsx
│   │   ├── solicitar/page.tsx
│   │   ├── solicitar/confirmacion/page.tsx
│   │   ├── solicitud/[token]/page.tsx
│   │   └── politica-de-datos/page.tsx
│   ├── (privado)/
│   │   ├── login/page.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── solicitudes/[id]/page.tsx
│   │       └── conversaciones/page.tsx
│   ├── api/
│   │   ├── solicitudes/route.ts
│   │   └── asistente/route.ts
│   ├── layout.tsx · not-found.tsx · globals.css
├── modulos/
│   ├── solicitudes/
│   │   ├── dominio/       solicitud.ts · cita.ts · momento.ts · tipo-prestador.ts · disponibilidad.ts · puertos.ts
│   │   ├── aplicacion/    consultar-disponibilidad.ts · crear-solicitud.ts · consultar-por-token.ts
│   │   │                  cancelar-cita.ts · listar-solicitudes.ts · actualizar-cita.ts · registrar-notas.ts
│   │   ├── infraestructura/  repositorio-postgres.ts · calendario-google.ts · correo-resend.ts · plantillas-correo.ts
│   │   ├── ui/            FormularioSolicitud.tsx · SelectorDisponibilidad.tsx · TablaSolicitudes.tsx
│   │   └── componer.ts
│   ├── asistente/
│   │   ├── dominio/       conversacion.ts · configuracion.ts · puertos.ts
│   │   ├── aplicacion/    responder.ts · ensamblar-prompt.ts · leer-configuracion.ts · actualizar-configuracion.ts
│   │   ├── infraestructura/  modelo-anthropic.ts · limitador-postgres.ts · configuracion-postgres.ts · conversaciones-postgres.ts
│   │   ├── ui/            Asistente.tsx
│   │   └── componer.ts
│   └── acceso/
│       ├── aplicacion/    iniciar-sesion.ts · cerrar-sesion.ts
│       ├── infraestructura/  sesion-cookie.ts
│       └── componer.ts
├── compartido/
│   ├── bd/                cliente.ts · esquema.ts · migraciones/
│   ├── config/            env.ts (esquema zod de variables de entorno)
│   ├── tipos/             Resultado<T,E> · errores comunes
│   └── ui/                Boton · Campo · Insignia · Aviso
content/asistente/         README.md · identidad.md · servicios.md · faq.md
```

### 3.3 Reglas transversales

- Validación de entrada con Zod en el borde (manejador de ruta o acción de servidor); el dominio recibe tipos ya válidos.
- Los casos de uso devuelven `Resultado<T, E>` con errores tipados; los manejadores de ruta los traducen a códigos HTTP. Sin excepciones para flujo de negocio.
- Las lecturas de administración (listados) consultan la base directamente desde un caso de uso de lectura, sin pasar por la entidad; no hay lógica en esas consultas.
- Componentes de servidor por defecto; componentes de cliente solo donde hay interacción (selector de disponibilidad, asistente).
- Tiempos siempre en UTC en almacenamiento y en `America/Bogota` en presentación.

## 4. Requisitos específicos

Convenciones: `RS-<categoría>-<n>`, categorías I (interfaces externas), F (funcional), D (datos), NF (no funcional), R (diseño y arquitectura). Prioridad **Obligatorio** o **Deseable**. Verificación: Inspección, Análisis, Demostración o Prueba. Cada requisito traza a uno o más `RP-*`.

### 4.1 Interfaces externas

### RS-I-001 · Consulta de ocupación
**Enunciado.** El sistema debe obtener la ocupación del gestor mediante el método FreeBusy de la API de Google Calendar sobre el calendario configurado en `GOOGLE_CALENDAR_ID`.
**Justificación.** ADR-0004.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007

### RS-I-002 · Creación del evento
**Enunciado.** Al crear una solicitud, el sistema debe crear un evento en el calendario del gestor con el prospecto como invitado, `sendUpdates: all` y `conferenceDataVersion: 1` para generar la videollamada.
**Justificación.** RP-F-010; sin `conferenceDataVersion` Google omite la conferencia sin error.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-010

### RS-I-003 · Idempotencia del evento
**Enunciado.** El sistema debe usar el token de la solicitud como `requestId` de la conferencia para que un reintento no cree una segunda videollamada.
**Justificación.** Los tiempos de espera agotados son el fallo más común de la API; reintentar debe ser seguro.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-010

### RS-I-004 · Enlace de cancelación en el correo
**Enunciado.** El correo de confirmación debe incluir la URL absoluta `/solicitud/{token}` como enlace de cancelación.
**Justificación.** RP-F-021 y RP-F-011; el enlace vive en el canal que controla el gestor.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-021, RP-F-011

### RS-I-010 · Enlace redundante en el evento
**Enunciado.** El sistema debe incluir también la URL `/solicitud/{token}` en la descripción del evento de calendario.
**Justificación.** Segundo canal sin costo: si el correo de confirmación cae en spam, la invitación de Google lleva el enlace.
**Prioridad.** Deseable
**Verificación.** Inspección
**Traza.** RP-F-011

### RS-I-011 · Envío de correo con Resend
**Enunciado.** El sistema debe enviar todo correo transaccional mediante la API de Resend a través del puerto `Correo`, con `RESEND_API_KEY` y remitente `CORREO_REMITENTE` provistos por variables de entorno.
**Justificación.** Decisión del gestor; el puerto aísla al proveedor.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-021, RP-F-022

### RS-I-012 · Idempotencia del correo
**Enunciado.** Cada envío a Resend debe llevar la cabecera `Idempotency-Key` con el token de la solicitud y el tipo de correo, de modo que un reintento no duplique el mensaje.
**Justificación.** Mismo principio que RS-I-003: reintentar debe ser seguro.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-021

### RS-I-013 · Tiempo de espera hacia Resend
**Enunciado.** Toda llamada a la API de Resend debe abortarse si supera 8 segundos.
**Justificación.** Un correo colgado no puede bloquear la confirmación al prospecto.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-NF-007

### RS-I-005 · Cancelación del evento
**Enunciado.** Al cancelar una cita, el sistema debe eliminar el evento asociado usando `google_event_id` y notificar al invitado.
**Justificación.** Sin esto el calendario del gestor y la base de datos quedan desincronizados.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-011

### RS-I-006 · Autenticación con Google
**Enunciado.** El sistema debe autenticarse ante Google con un refresh token obtenido una única vez y provisto por variable de entorno, con los alcances `calendar.events` y `calendar.readonly`.
**Justificación.** Un solo administrador; no se necesita flujo OAuth en la aplicación.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-007, RP-F-010

### RS-I-007 · Tiempo de espera hacia Google
**Enunciado.** Toda llamada a la API de Google Calendar debe abortarse si supera 8 segundos.
**Justificación.** Una llamada colgada bloquea la creación de la solicitud.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-NF-007

### RS-I-008 · Proveedor del modelo de lenguaje
**Enunciado.** El sistema debe invocar al proveedor del modelo mediante su SDK oficial, con respuesta en flujo, a través del puerto `ModeloLenguaje`.
**Justificación.** El puerto aísla al proveedor; el flujo mejora la percepción de latencia.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-017

### RS-I-009 · Caché del prefijo del prompt
**Enunciado.** El sistema debe marcar el prompt del sistema como prefijo cacheable cuando el proveedor lo soporte.
**Justificación.** El prompt es idéntico en todas las conversaciones y domina el costo por turno.
**Prioridad.** Deseable
**Verificación.** Inspección
**Traza.** RP-F-019

### 4.2 Disponibilidad y solicitud

### RS-F-001 · Horario base configurable
**Enunciado.** El sistema debe leer de variables de entorno los días de atención, las franjas horarias, la duración de la cita en minutos, la anticipación mínima en horas y el horizonte máximo en días.
**Justificación.** ADR-0004: el horario base es configuración de despliegue, no dato administrado.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007

### RS-F-002 · Cálculo de disponibilidad
**Enunciado.** Para una fecha dada, el sistema debe devolver las horas de inicio que caen dentro del horario base, no se solapan con la ocupación reportada por FreeBusy, no se solapan con citas agendadas en la base de datos y respetan la anticipación mínima.
**Justificación.** RP-F-007.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007

### RS-F-003 · Disponibilidad como consulta pura
**Enunciado.** El cálculo de disponibilidad debe implementarse como una función pura en el dominio que recibe horario base, intervalos ocupados y el instante actual.
**Justificación.** Es la lógica con más casos límite del sistema; debe probarse sin red ni base de datos.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007

### RS-F-004 · Validación de la solicitud
**Enunciado.** El sistema debe rechazar con código 400 toda solicitud cuyo cuerpo no cumpla el esquema: nombre (2–120 caracteres), correo válido, teléfono (7–20 caracteres), tipo de prestador y momento dentro de sus enumeraciones, descripción (0–2000 caracteres), hora de cita en ISO 8601 y autorización de datos en `true`.
**Justificación.** RP-F-006 y RP-L-001.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-006, RP-L-001

### RS-F-005 · Revalidación del horario en el servidor
**Enunciado.** Antes de persistir, el sistema debe verificar que la hora recibida pertenece a la disponibilidad calculada en ese instante, y rechazar con código 409 si no.
**Justificación.** El horario que envía el navegador no es confiable.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007, RP-F-008

### RS-F-006 · Orden de persistencia
**Enunciado.** El sistema debe ejecutar la creación en este orden: insertar la solicitud, crear el evento de calendario y, por último, enviar los correos.
**Justificación.** Si Google falla, la solicitud existe y el prospecto no se pierde; en el orden inverso se pierde el candado.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-006, RP-F-016

### RS-F-007 · Candado contra doble reserva
**Enunciado.** Cuando el índice único parcial sobre `cita_inicio` rechace la inserción, el sistema debe responder con código 409 y el mensaje «Ese horario acaba de ocuparse. Elija otro.».
**Justificación.** RP-F-008; la condición de carrera se resuelve en la base, no en la aplicación.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-008

### RS-F-008 · Solicitud pendiente de sincronizar
**Enunciado.** Si la creación del evento falla tras persistir la solicitud, el sistema debe marcar la solicitud con `sincronizacion = 'pendiente'`, registrar el error y responder al prospecto con la confirmación.
**Justificación.** RP-F-016.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-016, RP-NF-007

### RS-F-042 · Correo de confirmación al prospecto
**Enunciado.** Tras crear la solicitud y el evento, el sistema debe enviar al prospecto un correo con la fecha y la hora en `America/Bogota`, el enlace de cancelación, el enlace de la videollamada cuando exista y el aviso de que la invitación de calendario llega por separado.
**Justificación.** RP-F-021.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-021

### RS-F-043 · Aviso al gestor
**Enunciado.** Tras crear la solicitud, el sistema debe enviar a `CORREO_GESTOR` un aviso con nombre, tipo de prestador, momento, hora de la cita, estado de sincronización y enlace al detalle en `/admin`.
**Justificación.** RP-F-022; incluye el estado de sincronización para que un fallo de Google sea visible sin entrar al panel.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-022, RP-F-016

### RS-F-044 · Fallo del correo no bloquea la solicitud
**Enunciado.** Cuando el envío de un correo falle, el sistema debe registrar el error y responder al prospecto con la confirmación sin modificar la solicitud.
**Justificación.** La solicitud ya existe y la invitación de Google es el segundo canal; un fallo de correo no es un fallo de negocio.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-NF-007

### RS-F-045 · Correo de cancelación
**Enunciado.** Al cancelar la cita, el sistema debe enviar al prospecto un correo que confirme la cancelación y ofrezca el enlace a `/solicitar` para agendar de nuevo.
**Justificación.** Google notifica la eliminación del evento, pero no invita a reagendar.
**Prioridad.** Deseable
**Verificación.** Prueba
**Traza.** RP-F-011

### RS-F-009 · Comportamiento ante fallo de FreeBusy
**Enunciado.** Cuando la consulta de ocupación falle, el sistema debe aplicar el comportamiento definido en TBD-1 del PRD.
**Justificación.** ADR-0004 deja abierta la decisión; este requisito la reserva y el validador la reporta como pendiente.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007, RP-NF-007

### RS-F-010 · Token opaco
**Enunciado.** El sistema debe generar para cada solicitud un token UUID v4 y usarlo como único identificador expuesto al prospecto.
**Justificación.** RP-F-011; un identificador secuencial permitiría acceder a solicitudes ajenas.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-011

### RS-F-011 · Confirmación
**Enunciado.** Tras crear la solicitud, el sistema debe redirigir a `/solicitar/confirmacion` mostrando fecha, hora en `America/Bogota` y el aviso de la invitación por correo.
**Justificación.** RP-F-009.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-F-009

### RS-F-012 · Consulta por token
**Enunciado.** `/solicitud/{token}` debe mostrar fecha, hora y estado de la cita cuando el token existe, y la página 404 cuando no.
**Justificación.** RP-F-011.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-011

### RS-F-013 · Regla de cancelación
**Enunciado.** El sistema debe permitir la cancelación solo cuando la cita está en estado `agendada` y su inicio es posterior al instante actual.
**Justificación.** Cancelar una cita ya ocurrida no tiene sentido y ensuciaría el historial.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-011

### RS-F-014 · Efecto de la cancelación
**Enunciado.** Al cancelar, el sistema debe cambiar `cita_estado` a `cancelada`, conservar el resto de la solicitud sin cambios y liberar la hora para nuevas solicitudes.
**Justificación.** RP-F-012 y ADR-0003.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-012, RP-F-008

### 4.3 Administración

### RS-F-015 · Inicio de sesión
**Enunciado.** El sistema debe autenticar al gestor comparando el correo y la contraseña recibidos contra `ADMIN_EMAIL` y el hash Argon2id en `ADMIN_PASSWORD_HASH`, y establecer una cookie de sesión firmada, `HttpOnly`, `Secure` y `SameSite=Lax`.
**Justificación.** RP-F-013 y RC-5; un solo usuario no justifica tabla de usuarios.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-013

### RS-F-016 · Protección de rutas privadas
**Enunciado.** El sistema debe redirigir a `/login` toda petición a `/admin` y sus subrutas sin sesión válida.
**Justificación.** RP-F-013.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-013

### RS-F-017 · Limitación de intentos de acceso
**Enunciado.** El sistema debe rechazar con código 429 los intentos de inicio de sesión que superen 5 por IP en 15 minutos.
**Justificación.** Una sola cuenta con contraseña es blanco de fuerza bruta.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-013

### RS-F-018 · Orden por urgencia
**Enunciado.** El listado de `/admin` debe ordenar las solicitudes por `momento` según el rango cierre_servicio &lt; hallazgo &lt; novedad &lt; habilitacion_inicial, y dentro de cada rango por `cita_inicio` ascendente.
**Justificación.** RP-F-014.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-014

### RS-F-019 · Filtro por estado
**Enunciado.** El listado de `/admin` debe permitir filtrar por `cita_estado` y por `sincronizacion`.
**Justificación.** RP-F-014 y RP-F-016.
**Prioridad.** Deseable
**Verificación.** Demostración
**Traza.** RP-F-014, RP-F-016

### RS-F-020 · Destacado de sincronización fallida
**Enunciado.** El listado de `/admin` debe mostrar una insignia de advertencia en toda solicitud con `sincronizacion = 'pendiente'`.
**Justificación.** RP-F-016.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-F-016

### RS-F-021 · Transiciones del estado de la cita
**Enunciado.** El gestor debe poder cambiar `cita_estado` de `agendada` a `atendida` o a `no_asistio` desde el detalle de la solicitud.
**Justificación.** RP-F-015; las transiciones viven en el dominio, no en la interfaz.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-015

### RS-F-039 · Transiciones no permitidas
**Enunciado.** El sistema debe rechazar toda transición de `cita_estado` distinta de las definidas en RS-F-014 y RS-F-021.
**Justificación.** Las transiciones viven en el dominio; la interfaz no puede ampliarlas.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-015

### RS-F-022 · Notas del gestor
**Enunciado.** El gestor debe poder guardar un texto de hasta 5000 caracteres en `notas_gestor` de una solicitud.
**Justificación.** RP-F-015.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-F-015

### RS-F-023 · Reintento de sincronización
**Enunciado.** El gestor debe poder reintentar la creación del evento de una solicitud con `sincronizacion = 'pendiente'` desde su detalle.
**Justificación.** Evita crear el evento a mano cuando el fallo fue transitorio.
**Prioridad.** Deseable
**Verificación.** Prueba
**Traza.** RP-F-016

### 4.4 Asistente

### RS-F-024 · Ensamblado del prompt en construcción
**Enunciado.** El sistema debe concatenar `identidad.md`, `servicios.md` y `faq.md` en un único prompt de sistema durante la construcción de la aplicación, eliminando los comentarios HTML.
**Justificación.** RP-F-017 y RP-NF-005; los comentarios son instrucciones para humanos.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-017, RP-NF-005

### RS-F-025 · Historial acotado
**Enunciado.** Cada petición al proveedor debe incluir como máximo los últimos 8 turnos de la conversación.
**Justificación.** Limita el costo por mensaje en conversaciones largas.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-019

### RS-F-026 · Límite por visitante
**Enunciado.** El sistema debe rechazar con código 429 los mensajes de una IP que superen el valor `asistente_limite_hora` dentro de una ventana de 60 minutos.
**Justificación.** RP-F-019.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-019

### RS-F-027 · Tope diario global
**Enunciado.** El sistema debe dejar de atender mensajes cuando el total del día supere `asistente_tope_diario`, respondiendo con código 503 y el mensaje de no disponibilidad.
**Justificación.** Las IP rotan; el tope global es el que protege el presupuesto.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-019, RP-NF-007

### RS-F-028 · Interruptor del asistente
**Enunciado.** Cuando `asistente_activo` sea falso, el sistema debe ocultar el componente en las páginas públicas y responder 503 en `/api/asistente`.
**Justificación.** RP-F-019.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-019

### RS-F-029 · Configuración desde la administración
**Enunciado.** El gestor debe poder editar `asistente_limite_hora`, `asistente_tope_diario` y `asistente_activo` desde `/admin`.
**Justificación.** RP-F-019; el rango duro evita anular el control por error.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-019

### RS-F-040 · Rangos de la configuración
**Enunciado.** El sistema debe rechazar con código 400 todo valor de `asistente_limite_hora` fuera del rango entero 1–60 y todo valor de `asistente_tope_diario` fuera del rango entero 1–5000.
**Justificación.** Sin rango duro, un valor accidental anula el control de consumo.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-019

### RS-F-030 · Caché de configuración
**Enunciado.** El sistema debe cachear la configuración del asistente en memoria durante 60 segundos.
**Justificación.** Evita una consulta a la base por cada mensaje.
**Prioridad.** Deseable
**Verificación.** Inspección
**Traza.** RP-F-019

### RS-F-031 · Persistencia de conversaciones
**Enunciado.** El sistema debe guardar cada conversación con su identificador de sesión, los mensajes intercambiados y si el asistente derivó a `/solicitar`.
**Justificación.** RP-F-020.
**Prioridad.** Deseable
**Verificación.** Prueba
**Traza.** RP-F-020

### RS-F-032 · Aviso de privacidad en el asistente
**Enunciado.** El componente del asistente debe mostrar, antes del primer mensaje, un aviso de que la conversación se guarda y un enlace a `/politica-de-datos`.
**Justificación.** RP-L-001 y RP-L-002; el asistente es un punto de captura de datos.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-L-001, RP-L-002

### RS-F-033 · Sin herramientas ni acceso a datos
**Enunciado.** La invocación al proveedor no debe incluir herramientas ni ningún dato de la tabla `solicitudes`.
**Justificación.** RP-R-003 y ADR-0005.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-R-003, RP-F-018

### 4.5 Contenido y páginas públicas

### RS-F-034 · Páginas estáticas
**Enunciado.** Las rutas `/`, `/nosotros`, `/servicios` y `/politica-de-datos` deben generarse estáticamente en construcción.
**Justificación.** RP-NF-004 y RP-NF-005.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-004, RP-NF-005, RP-F-002, RP-F-003, RP-F-004, RP-L-002

### RS-F-035 · Segmentación en inicio
**Enunciado.** La página de inicio debe presentar los tres tipos de prestador como bloques diferenciados con enlace a la sección correspondiente de `/servicios`.
**Justificación.** RP-F-001.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-001

### RS-F-036 · Llamado a la acción
**Enunciado.** Toda página pública debe incluir un botón «Agende su cita» que enlace a `/solicitar`, presente en la barra de navegación y al final del contenido.
**Justificación.** RP-F-005.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-005

### RS-F-037 · Autorización de datos en el formulario
**Enunciado.** El formulario de `/solicitar` debe incluir una casilla de autorización desmarcada por defecto, con el texto de autorización y el enlace a `/politica-de-datos`.
**Justificación.** RP-L-001; un consentimiento premarcado no es expreso.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-L-001

### RS-F-041 · Envío condicionado a la autorización
**Enunciado.** El botón de envío de `/solicitar` debe permanecer deshabilitado mientras la casilla de autorización no esté marcada.
**Justificación.** RP-L-001; el servidor valida de todos modos (RS-F-004), la interfaz evita el rechazo.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-L-001

### RS-F-038 · Página no encontrada
**Enunciado.** El sistema debe servir una página 404 con el mismo sistema visual y un enlace a inicio.
**Justificación.** Completa el sitemap del PRD.
**Prioridad.** Deseable
**Verificación.** Demostración
**Traza.** RP-NF-006

### 4.6 Datos

### RS-D-001 · Tabla `solicitudes`
**Enunciado.** El sistema debe persistir las solicitudes con las columnas `id`, `token`, `nombre`, `correo`, `telefono`, `tipo_prestador`, `momento`, `descripcion`, `cita_inicio` (timestamptz), `cita_estado`, `sincronizacion`, `google_event_id`, `meet_link`, `autorizacion_datos`, `autorizacion_fecha`, `notas_gestor` y `creada_en`.
**Justificación.** RP-F-006 y RP-L-001.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-006, RP-L-001

### RS-D-002 · Índice único parcial
**Enunciado.** La base de datos debe tener un índice único sobre `cita_inicio` con la condición `cita_estado <> 'cancelada'`.
**Justificación.** RP-F-008 y RP-F-012: sin la condición, una hora cancelada quedaría bloqueada para siempre.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-008, RP-F-012

### RS-D-003 · Enumeraciones
**Enunciado.** La base de datos debe restringir `tipo_prestador` a {ips, profesional_independiente, objeto_social_diferente}, `momento` a {habilitacion_inicial, novedad, hallazgo, cierre_servicio}, `cita_estado` a {agendada, cancelada, atendida, no_asistio} y `sincronizacion` a {ok, pendiente}.
**Justificación.** Los valores vienen del glosario; la base los protege aunque el código falle.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-006, RP-F-014

### RS-D-004 · Tabla `conversaciones`
**Enunciado.** El sistema debe persistir las conversaciones con `id`, `session_id`, `mensajes` (jsonb), `derivo_a_solicitud` y `creada_en`.
**Justificación.** RP-F-020.
**Prioridad.** Deseable
**Verificación.** Inspección
**Traza.** RP-F-020

### RS-D-005 · Tabla `limites_ip`
**Enunciado.** El sistema debe persistir los contadores de consumo con `ip_hash` (clave), `ambito` (asistente o acceso), `ventana_inicio` y `conteo`.
**Justificación.** En despliegue sin servidor un contador en memoria se multiplica por instancia.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-019, RP-F-013

### RS-D-006 · IP hasheada
**Enunciado.** El sistema debe almacenar la dirección IP únicamente como SHA-256 de la IP concatenada con la sal `IP_HASH_SALT`.
**Justificación.** La IP es dato personal bajo la Ley 1581 de 2012.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-L-001

### RS-D-007 · Tabla `configuracion`
**Enunciado.** El sistema debe persistir la configuración editable como pares `clave` (clave primaria), `valor` (jsonb) y `actualizado_en`.
**Justificación.** RP-F-019; tres claves no justifican columnas propias.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-019

### RS-D-008 · Migraciones versionadas
**Enunciado.** Todo cambio de esquema debe aplicarse mediante migraciones SQL versionadas en `compartido/bd/migraciones/`.
**Justificación.** Reproducibilidad entre entornos.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-005

### RS-D-009 · Retención de conversaciones
**Enunciado.** El sistema debe eliminar las conversaciones con más de 365 días de antigüedad mediante una tarea programada diaria.
**Justificación.** Principio de finalidad y temporalidad de la Ley 1581 de 2012.
**Prioridad.** Deseable
**Verificación.** Prueba
**Traza.** RP-L-001, RP-F-020

### 4.7 No funcionales

### RS-NF-001 · Registro de usted en el copy
**Enunciado.** Todo texto de interfaz, de invitación y de respuesta del asistente debe dirigirse al visitante en usted, en registro neutro.
**Justificación.** RP-NF-001.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-001

### RS-NF-013 · Registro en el prompt del asistente
**Enunciado.** El archivo `identidad.md` debe instruir explícitamente al asistente a responder en usted, aunque el contenido de `servicios.md` y `faq.md` esté redactado en tuteo.
**Justificación.** `CLAUDE.md` señala al asistente como el punto donde más fácil se filtra el registro equivocado.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-001

### RS-NF-002 · Diseño adaptable
**Enunciado.** Toda página pública debe renderizarse sin desplazamiento horizontal desde 360 px de ancho.
**Justificación.** RP-NF-002.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-NF-002

### RS-NF-003 · Objetivos táctiles
**Enunciado.** Los controles interactivos de `/solicitar` y del asistente deben tener al menos 44 × 44 px.
**Justificación.** RP-NF-002 y WCAG 2.2 criterio 2.5.8.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-002, RP-NF-003

### RS-NF-004 · Contraste y teclado
**Enunciado.** Las páginas públicas deben obtener cero errores en una auditoría automatizada con axe-core y permitir completar la solicitud solo con teclado.
**Justificación.** RP-NF-003.
**Prioridad.** Obligatorio
**Verificación.** Análisis
**Traza.** RP-NF-003

### RS-NF-005 · Fuentes autoalojadas
**Enunciado.** Lora y Source Sans 3 deben cargarse con `next/font` y no desde servidores de terceros en tiempo de ejecución.
**Justificación.** RP-NF-004 y privacidad del visitante.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-004, RP-NF-006

### RS-NF-006 · Rendimiento de inicio
**Enunciado.** La página de inicio debe obtener una puntuación de rendimiento mayor o igual a 90 en Lighthouse móvil.
**Justificación.** RP-NF-004.
**Prioridad.** Deseable
**Verificación.** Análisis
**Traza.** RP-NF-004

### RS-NF-007 · Tokens de diseño
**Enunciado.** Los colores, tipografías, radios y sombras deben provenir exclusivamente de `ghycs-tokens.css`; no se admiten valores hexadecimales en componentes.
**Justificación.** RP-NF-006.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-006

### RS-NF-008 · Cabeceras de seguridad
**Enunciado.** El sistema debe enviar `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff` y `Referrer-Policy: strict-origin-when-cross-origin` en todas las respuestas.
**Justificación.** Superficie mínima para un sitio que recibe datos personales.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-L-001

### RS-NF-009 · Protección CSRF
**Enunciado.** Las acciones que modifican estado desde `/admin` deben ejecutarse como acciones de servidor de Next.js con verificación de origen.
**Justificación.** Las acciones de servidor incluyen la verificación de `Origin`; evita implementar tokens propios.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-013

### RS-NF-010 · Secretos por variable de entorno
**Enunciado.** Toda credencial o secreto debe proveerse exclusivamente por variables de entorno, sin copia alguna en el repositorio.
**Justificación.** Un despliegue con configuración incompleta debe fallar en el arranque, no ante el primer prospecto.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-NF-007

### RS-NF-014 · Validación del entorno al arrancar
**Enunciado.** `compartido/config/env.ts` debe validar con Zod todas las variables de entorno al arrancar y abortar el arranque si alguna falta o es inválida.
**Justificación.** Un despliegue con configuración incompleta debe fallar en el arranque, no ante el primer prospecto.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-NF-007

### RS-NF-011 · Aviso de credencial de Google
**Enunciado.** `/admin` debe mostrar un aviso cuando la última llamada a Google Calendar haya fallado por autenticación.
**Justificación.** El refresh token expira en silencio si la aplicación no está en *Production* o pasa 6 meses sin uso.
**Prioridad.** Obligatorio
**Verificación.** Demostración
**Traza.** RP-F-016, RP-NF-007

### RS-NF-015 · Entregabilidad del dominio
**Enunciado.** El dominio remitente debe estar verificado en Resend con registros SPF, DKIM y DMARC antes de habilitar el envío en producción.
**Justificación.** Sin verificación, los correos a una IPS con filtros corporativos caen en spam; es la causa más frecuente de fallo en este tipo de proyecto.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-021, RP-F-022

### RS-NF-016 · Registro de correos sin datos personales
**Enunciado.** El sistema debe registrar el identificador de cada envío devuelto por Resend junto al identificador de la solicitud, sin incluir la dirección de correo del prospecto en el log.
**Justificación.** Permite rastrear un envío en el panel de Resend sin duplicar datos personales en los logs.
**Prioridad.** Deseable
**Verificación.** Inspección
**Traza.** RP-L-001

### RS-NF-012 · Registro de eventos
**Enunciado.** El sistema debe registrar en logs estructurados la creación y cancelación de solicitudes, los fallos de integración y los rechazos por límite, sin incluir datos personales del prospecto.
**Justificación.** Operación y depuración compatibles con la Ley 1581 de 2012.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-L-001, RP-NF-007

### 4.8 Diseño y arquitectura

### RS-R-001 · Pila tecnológica
**Enunciado.** El sistema debe implementarse con Next.js (App Router) y TypeScript en modo estricto, Tailwind CSS 4, PostgreSQL, Drizzle ORM y Zod.
**Justificación.** Un solo despliegue; Drizzle expresa el índice único parcial sin SQL manual en el esquema.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-005, RP-F-008

### RS-R-002 · Capas por módulo
**Enunciado.** Cada módulo de `src/modulos/` debe organizarse en las capas `dominio`, `aplicacion`, `infraestructura` y `ui` descritas en §3.1.
**Justificación.** Dependencias hacia el dominio; el dominio se prueba sin infraestructura.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-006, RP-F-017

### RS-R-003 · Dominio sin dependencias externas
**Enunciado.** Los archivos de `dominio/` no deben importar `next`, `react`, `drizzle-orm`, `googleapis` ni el SDK del proveedor del modelo.
**Justificación.** §3.1.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-F-007, RP-F-017

### RS-R-004 · Puertos en el dominio, adaptadores en infraestructura
**Enunciado.** Toda dependencia externa (repositorio, calendario, modelo de lenguaje, limitador, reloj) debe declararse como interfaz en `dominio/puertos.ts` e implementarse en `infraestructura/`.
**Justificación.** Permite probar los casos de uso con implementaciones falsas y cambiar de proveedor sin tocar el dominio.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-NF-007

### RS-R-005 · Un caso de uso por archivo
**Enunciado.** Cada caso de uso debe ser un archivo en `aplicacion/` que exporte una función constructora que recibe sus puertos y devuelve `ejecutar(comando)`.
**Justificación.** Sin contenedor de inyección; la composición es explícita en `componer.ts`.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-006

### RS-R-006 · Reglas de negocio en el dominio
**Enunciado.** Las transiciones de `cita_estado`, la regla de cancelación, el rango de urgencia por `momento` y el cálculo de disponibilidad deben implementarse en `dominio/` y no en casos de uso, componentes ni consultas.
**Justificación.** Un `if` de negocio fuera del dominio no se prueba de forma aislada y se duplica.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-007, RP-F-011, RP-F-014, RP-F-015

### RS-R-007 · Verificación de fronteras
**Enunciado.** El proyecto debe incluir una regla de ESLint que prohíba las importaciones contrarias a la tabla de §3.1 y ejecutarla en integración continua.
**Justificación.** Una arquitectura que no se verifica se erosiona en semanas.
**Prioridad.** Obligatorio
**Verificación.** Prueba
**Traza.** RP-NF-005

### RS-R-008 · Resultados tipados
**Enunciado.** Los casos de uso deben devolver `Resultado<T, E>` con `E` como unión de errores tipados, sin lanzar excepciones para el flujo de negocio.
**Justificación.** §3.3; los errores esperables (409, 429) son parte del contrato, no fallos.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-008, RP-F-019

### RS-R-011 · Traducción de errores a HTTP
**Enunciado.** Los manejadores de ruta deben traducir cada variante de `E` de un `Resultado` a un código HTTP definido en una tabla única del módulo.
**Justificación.** Los errores esperables (409, 429, 503) son parte del contrato; la tabla evita que cada ruta improvise.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-008, RP-F-019

### RS-R-009 · Pruebas por capa
**Enunciado.** El proyecto debe tener pruebas unitarias del dominio y de los casos de uso con puertos falsos (Vitest) y una prueba de extremo a extremo del flujo de solicitud (Playwright) que se ejecuten en integración continua.
**Justificación.** Los criterios de aceptación del PRD exigen verificación por prueba.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-006, RP-F-011

### RS-R-010 · Plantillas de correo sin dependencia de interfaz
**Enunciado.** Las plantillas de correo deben ser funciones puras en `infraestructura/plantillas-correo.ts` que reciben datos de la solicitud y devuelven asunto, texto plano y HTML, sin importar React ni componentes de `ui/`.
**Justificación.** Tres correos no justifican React Email; texto plano y HTML garantizan lectura en cualquier cliente.
**Prioridad.** Obligatorio
**Verificación.** Inspección
**Traza.** RP-F-021, RP-F-022

## 5. Verificación

| Método | Significa en este proyecto |
|---|---|
| Prueba | Caso automatizado en Vitest o Playwright que falla si el requisito no se cumple |
| Demostración | Recorrido manual registrado en el issue de la funcionalidad |
| Inspección | Revisión de código o contenido contra una lista de comprobación en la PR |
| Análisis | Informe de herramienta (Lighthouse, axe-core) adjunto al issue |

Un requisito se considera verificado cuando su método está ejecutado y el resultado enlazado desde el issue correspondiente.

## 6. Matriz de trazabilidad

Generada por `validar_requisitos.py --matriz`. Todo `RP-*` Obligatorio tiene al menos un `RS-*`.

| PRD | SRD |
|---|---|
| RP-F-001 | RS-F-035 |
| RP-F-002 | RS-F-034 |
| RP-F-003 | RS-F-034 |
| RP-F-004 | RS-F-034 |
| RP-F-005 | RS-F-036 |
| RP-F-006 | RS-F-004, RS-F-006, RS-D-001, RS-D-003, RS-R-002, RS-R-005, RS-R-009 |
| RP-F-007 | RS-I-001, RS-I-006, RS-F-001, RS-F-002, RS-F-003, RS-F-005, RS-F-009, RS-R-003, RS-R-006 |
| RP-F-008 | RS-F-005, RS-F-007, RS-F-014, RS-D-002, RS-R-001, RS-R-008, RS-R-011 |
| RP-F-009 | RS-F-011 |
| RP-F-010 | RS-I-002, RS-I-003, RS-I-006 |
| RP-F-021 | RS-I-004, RS-I-011, RS-I-012, RS-F-042, RS-NF-015, RS-R-010 |
| RP-F-022 | RS-I-011, RS-F-043, RS-NF-015, RS-R-010 |
| RP-F-011 | RS-I-004, RS-I-010, RS-I-005, RS-F-045, RS-F-010, RS-F-012, RS-F-013, RS-R-006, RS-R-009 |
| RP-F-012 | RS-F-014, RS-D-002 |
| RP-F-013 | RS-F-015, RS-F-016, RS-F-017, RS-D-005, RS-NF-009 |
| RP-F-014 | RS-F-018, RS-F-019, RS-D-003, RS-R-006 |
| RP-F-015 | RS-F-021, RS-F-039, RS-F-022, RS-R-006 |
| RP-F-016 | RS-F-006, RS-F-008, RS-F-043, RS-F-019, RS-F-020, RS-F-023, RS-NF-011 |
| RP-F-017 | RS-I-008, RS-F-024, RS-R-002, RS-R-003 |
| RP-F-018 | RS-F-033 |
| RP-F-019 | RS-I-009, RS-F-025, RS-F-026, RS-F-027, RS-F-028, RS-F-029, RS-F-040, RS-F-030, RS-D-005, RS-D-007, RS-R-008, RS-R-011 |
| RP-F-020 | RS-F-031, RS-D-004, RS-D-009 |
| RP-L-001 | RS-F-004, RS-F-032, RS-F-037, RS-F-041, RS-D-001, RS-D-006, RS-D-009, RS-NF-008, RS-NF-016, RS-NF-012 |
| RP-L-002 | RS-F-032, RS-F-034 |
| RP-L-003 | — (excepción declarada en §7) |
| RP-L-004 | — (excepción declarada en §7) |
| RP-NF-001 | RS-NF-001, RS-NF-013 |
| RP-NF-002 | RS-NF-002, RS-NF-003 |
| RP-NF-003 | RS-NF-003, RS-NF-004 |
| RP-NF-004 | RS-F-034, RS-NF-005, RS-NF-006 |
| RP-NF-005 | RS-F-024, RS-F-034, RS-D-008, RS-R-001, RS-R-007 |
| RP-NF-006 | RS-F-038, RS-NF-005, RS-NF-007 |
| RP-NF-007 | RS-I-013, RS-I-007, RS-F-008, RS-F-044, RS-F-009, RS-F-027, RS-NF-010, RS-NF-014, RS-NF-011, RS-NF-012, RS-R-004 |
| RP-R-001 | — (excepción declarada en §7) |
| RP-R-002 | — (excepción declarada en §7) |
| RP-R-003 | RS-F-033 |

## 7. Requisitos de producto sin requisito de software

RP-L-003, RP-L-004, RP-R-001 y RP-R-002 son restricciones sobre el contenido o sobre la ausencia de funcionalidad. No producen software; se verifican por inspección en cada PR que toque contenido público o rutas. El validador los reporta como cubiertos por excepción declarada.

## 8. Pendientes

| ID | Pendiente | Requisitos afectados |
|---|---|---|
| TBD-1 | Comportamiento ante fallo de FreeBusy | RS-F-009 |
| TBD-2 | Cuenta del calendario (personal o de marca) | RS-I-006 |
| TBD-3 | Presupuesto mensual y modelo del asistente | RS-F-027, RS-I-008 |
| TBD-4 | Razón social y NIT | RS-F-034 |
| TBD-5 | Dominio remitente para Resend (por ejemplo `citas@ghycs.co`) | RS-I-011, RS-NF-015 |
