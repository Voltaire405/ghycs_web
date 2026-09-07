# PRD — Sitio web de GHYCS

| Campo | Valor |
|---|---|
| Documento | Product Requirements Document (requisitos de producto y de partes interesadas) |
| Norma de referencia | ISO/IEC/IEEE 29148:2018, cláusula 9.3 (StRS) y 9.4 (BRS), adaptadas a un solo documento |
| Versión | 0.1 · 2026-09-06 |
| Estado | Borrador para revisión con el gestor |
| Documento derivado | `SRD.md` (requisitos de software); cada `RS-*` traza a uno o más `RP-*` de este documento |
| Vocabulario | `CONTEXT.md` gobierna los términos; este documento no redefine ninguno |

## 1. Propósito y alcance

Este documento fija **qué** debe lograr el sitio web de GHYCS y **para quién**, en la primera etapa del proyecto. No describe cómo se construye: eso es materia del SRD.

El sitio conecta al prestador con el gestor. Su unidad de trabajo es la **solicitud**: el visitante llega, se identifica como prospecto y envía una solicitud de asesoría o acompañamiento con la cita ya agendada. Todo requisito de este documento existe para que esa solicitud ocurra o para que el gestor la atienda.

## 2. Contexto de negocio

### 2.1 El gestor

GHYCS es una marca de tres socios que acompaña a prestadores de servicios de salud en Colombia en el cumplimiento de las condiciones de habilitación y en la mejora de la calidad. Presta asesoría (orientación experta sobre un punto concreto) y acompañamiento (proceso completo hasta la visita de habilitación). PAMEC es su segunda línea de servicio. La acreditación queda fuera de su oferta.

### 2.2 Objetivos de negocio

| ID | Objetivo | Indicador de la primera etapa |
|---|---|---|
| ON-1 | Recibir solicitudes con cita agendada sin intervención manual del gestor | Solicitudes creadas por semana |
| ON-2 | Filtrar antes de la cita: que el prospecto llegue clasificado por tipo de prestador y momento | Porcentaje de solicitudes con ambos ejes diligenciados |
| ON-3 | Sostener la confianza que exige una compra regulada | Ninguna afirmación normativa sin respaldo en el sitio ni en el asistente |
| ON-4 | Reducir el tiempo del gestor en atención de primer contacto | Consultas resueltas por el asistente sin derivar |

### 2.3 Público objetivo

- **IPS.** Persona jurídica cuyo objeto social es prestar servicios de salud.
- **Profesional independiente.** Persona natural que presta servicios de salud por cuenta propia.
- **Entidad con objeto social diferente.** Su objeto principal no es la salud, pero presta servicios de salud.

Fuera del público objetivo, por el ADR-0001: el servicio de transporte especial de pacientes.

### 2.4 Momentos en que llega el prestador

Habilitación inicial, novedad, hallazgo de una visita de habilitación y cierre del servicio. El cierre del servicio es la situación más grave y más urgente de las cuatro; el producto debe distinguirla.

## 3. Partes interesadas

| Parte | Interés | Cómo participa en el producto |
|---|---|---|
| Visitante / prospecto / prestador | Entender la oferta y obtener una cita sin fricción | Usa el sitio público y el asistente; envía la solicitud |
| Gestor (los tres socios) | Recibir solicitudes clasificadas, atender citas, no perder prospectos | Usa `/admin`; alimenta el contenido del asistente; bloquea su tiempo en su calendario |
| Administrador técnico | Operar el sitio con un solo usuario y sin panel de contenido | Despliega; edita contenido por commit |
| Autoridad de datos personales (SIC) | Cumplimiento de la Ley 1581 de 2012 | Impone la autorización expresa y la política de tratamiento |

## 4. Restricciones y supuestos

### 4.1 Restricciones de partes interesadas

- **RC-1.** El copy visible del sitio se dirige al prestador en usted, registro neutro, según `CLAUDE.md`.
- **RC-2.** El sitio no enumera el marco normativo ni cita artículos, según el ADR-0002.
- **RC-3.** La disponibilidad se calcula contra la ocupación del calendario del gestor; no existe tabla de bloqueos, según el ADR-0004.
- **RC-4.** El asistente no interpreta la norma ni accede a datos de solicitudes, según el ADR-0005.
- **RC-5.** El gestor opera con una sola cuenta administrativa; no hay roles.

### 4.2 Supuestos

- **SU-1.** El gestor mantiene su ocupación real en un único calendario de Google.
- **SU-2.** El gestor redacta y mantiene el contenido del asistente (`servicios.md`, `faq.md`).
- **SU-3.** La primera cita no tiene costo y se realiza por videollamada.
- **SU-4.** El volumen esperado es de decenas de solicitudes al mes, no de miles.

## 5. Requisitos de producto

Convenciones: cada requisito tiene un identificador único `RP-<categoría>-<n>`, un enunciado singular con «debe», justificación, prioridad (**Obligatorio** o **Deseable**) y método de verificación (Inspección, Análisis, Demostración o Prueba). Las categorías son F (funcional), NF (no funcional), L (legal y normativo) y R (restricción).

### 5.1 Presentación de la oferta

### RP-F-001 · Reconocimiento del tipo de prestador
**Enunciado.** El sitio debe permitir que el visitante identifique, desde la página de inicio, a cuál de los tres tipos de prestador del público objetivo pertenece.
**Justificación.** ON-2. La segmentación temprana mejora la calidad de la solicitud y la conversión.
**Prioridad.** Obligatorio
**Verificación.** Demostración

### RP-F-002 · Portafolio de servicios
**Enunciado.** El sitio debe describir la asesoría, el acompañamiento y el PAMEC indicando en qué consiste cada uno, qué recibe el prestador y cuánto suele tomar.
**Justificación.** ON-3. Un prestador que contrata un servicio regulado necesita entregables concretos antes de agendar.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-F-003 · Identidad del gestor
**Enunciado.** El sitio debe presentar a los tres socios con nombre, profesión, tarjeta profesional cuando aplique y trayectoria verificable.
**Justificación.** ON-3. La habilitación se contrata por confianza; quién firma el acompañamiento decide la contratación.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-F-004 · Cobertura y modalidad
**Enunciado.** El sitio debe indicar el territorio que cubre el gestor y si la atención es virtual, presencial o mixta.
**Justificación.** Es una de las primeras preguntas de quien llega desde fuera de Antioquia.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-F-005 · Acción principal única
**Enunciado.** Cada página pública debe conducir al visitante hacia la creación de una solicitud como acción principal.
**Justificación.** ON-1. El sitio produce solicitudes; toda otra acción es secundaria.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### 5.2 Solicitud y cita

### RP-F-006 · Creación de la solicitud
**Enunciado.** El sitio debe permitir que el prospecto envíe una solicitud con sus datos de contacto, el tipo de prestador, el momento en que llega, una descripción de su situación y la hora de la cita, en un único flujo.
**Justificación.** ON-1 y ADR-0003. La solicitud es la unidad de trabajo y nace con la cita agendada.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-007 · Disponibilidad real
**Enunciado.** El sitio debe ofrecer al prospecto únicamente horas en las que el gestor está disponible según su horario de atención y la ocupación de su calendario.
**Justificación.** ADR-0004. Una cita sobre un compromiso real del gestor destruye la confianza que el sitio busca construir.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-008 · Una cita por hora
**Enunciado.** El sitio debe impedir que dos solicitudes queden con la misma hora de cita.
**Justificación.** ADR-0003. La doble reserva es el fallo más visible y más costoso de un sistema de citas.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-009 · Confirmación inmediata
**Enunciado.** Tras enviar la solicitud, el sitio debe mostrar al prospecto la fecha y la hora de la cita y anunciarle que recibirá una invitación por correo.
**Justificación.** Evita el reenvío del formulario y permite medir la conversión.
**Prioridad.** Obligatorio
**Verificación.** Demostración

### RP-F-010 · Invitación con videollamada
**Enunciado.** El prospecto debe recibir por correo una invitación de calendario que incluya la fecha, la hora y el enlace de la videollamada.
**Justificación.** SU-3. La cita es virtual; el enlace es parte de la cita, no un paso adicional.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-021 · Correo de confirmación
**Enunciado.** El prospecto debe recibir por correo, además de la invitación de calendario, una confirmación de la solicitud con la fecha, la hora y el enlace para cancelar.
**Justificación.** La invitación de Google puede fallar o filtrarse; la confirmación es el canal que el gestor controla y donde vive el enlace de cancelación.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-022 · Aviso al gestor
**Enunciado.** El gestor debe recibir por correo un aviso de cada solicitud nueva con el tipo de prestador, el momento y la hora de la cita.
**Justificación.** Es el canal que funciona aunque el calendario falle; permite reaccionar a un cierre del servicio sin entrar a `/admin`.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-011 · Cancelación sin cuenta
**Enunciado.** El prospecto debe poder cancelar su cita desde un enlace privado sin crear cuenta ni contraseña.
**Justificación.** Sin este mecanismo cada cancelación llega por WhatsApp y se gestiona a mano.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-012 · La solicitud sobrevive a la cancelación
**Enunciado.** Cuando el prospecto cancela la cita, el sitio debe conservar la solicitud como trabajo pendiente visible para el gestor.
**Justificación.** ADR-0003. Lo más valioso que produce el sitio es un prospecto identificado que ya contó qué necesita.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### 5.3 Atención por el gestor

### RP-F-013 · Acceso del gestor
**Enunciado.** El sitio debe restringir el acceso a la administración a una única cuenta autenticada.
**Justificación.** RC-5.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-014 · Listado por urgencia
**Enunciado.** La administración debe listar las solicitudes ordenadas primero por la urgencia del momento en que llega el prestador y luego por fecha de cita.
**Justificación.** ON-2 y §2.4. Un cierre del servicio no puede verse igual que una habilitación inicial.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-015 · Detalle y notas
**Enunciado.** La administración debe permitir al gestor ver el detalle de una solicitud, cambiar el estado de su cita y registrar notas.
**Justificación.** Cierra el ciclo de atención sin herramientas externas.
**Prioridad.** Obligatorio
**Verificación.** Demostración

### RP-F-016 · Aviso de sincronización fallida
**Enunciado.** La administración debe destacar las solicitudes cuya invitación de calendario no pudo crearse.
**Justificación.** Si falla el calendario, la solicitud existe pero el prospecto no recibió invitación; el gestor debe actuar.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### 5.4 Asistente

### RP-F-017 · Respuestas sobre la oferta
**Enunciado.** El asistente debe responder preguntas sobre la oferta del gestor usando exclusivamente el contenido que el gestor redacta.
**Justificación.** ON-4 y ADR-0005.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-018 · Derivación a la solicitud
**Enunciado.** Cuando una pregunta exceda la oferta del gestor o requiera interpretar la norma, el asistente debe declinar responderla y dirigir al visitante a crear una solicitud.
**Justificación.** ADR-0005. Determinar qué le aplica a un prestador es el servicio que se vende.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-019 · Control de consumo
**Enunciado.** El gestor debe poder limitar el número de consultas por visitante y apagar el asistente sin necesidad de un despliegue.
**Justificación.** Protege el presupuesto y da un interruptor de emergencia.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-F-020 · Historial de conversaciones
**Enunciado.** El gestor debe poder leer las conversaciones del asistente para identificar qué preguntan los visitantes.
**Justificación.** Es la fuente para mejorar `/servicios` y el FAQ.
**Prioridad.** Deseable
**Verificación.** Demostración

### 5.5 Legal y normativo

### RP-L-001 · Autorización expresa
**Enunciado.** El sitio debe obtener la autorización expresa e informada del prospecto para el tratamiento de sus datos personales antes de crear la solicitud.
**Justificación.** Ley 1581 de 2012 y Decreto 1377 de 2013.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### RP-L-002 · Política de tratamiento de datos
**Enunciado.** El sitio debe publicar la política de tratamiento de datos personales con finalidad, responsable, derechos del titular y canal de atención.
**Justificación.** Ley 1581 de 2012, artículo 17 (deber de adoptar una política).
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-L-003 · Sin afirmaciones normativas
**Enunciado.** Ninguna página del sitio ni respuesta del asistente debe citar artículos, plazos, tarifas o listados de estándares de la normatividad de habilitación.
**Justificación.** ADR-0002. Los anclas normativos tienen citas sin verificar; una cifra desactualizada en el sitio compromete al gestor.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-L-004 · Sin apariencia oficial
**Enunciado.** El sitio debe evitar cualquier texto o elemento visual que sugiera aval, certificación o vínculo con el Ministerio de Salud o las secretarías de salud.
**Justificación.** El gestor asesora para el cumplimiento; no certifica ni autoriza.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### 5.6 No funcionales

### RP-NF-001 · Registro de usted
**Enunciado.** Todo texto visible para el visitante, incluidas las respuestas del asistente, debe dirigirse a él en usted, en registro neutro.
**Justificación.** RC-1.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-NF-002 · Uso desde móvil
**Enunciado.** El visitante debe poder completar una solicitud desde un teléfono móvil sin ampliar la pantalla ni desplazarse horizontalmente.
**Justificación.** El profesional independiente llega mayoritariamente desde el celular.
**Prioridad.** Obligatorio
**Verificación.** Demostración

### RP-NF-003 · Accesibilidad
**Enunciado.** Las páginas públicas deben cumplir el nivel AA de WCAG 2.2.
**Justificación.** Contraste y navegación por teclado son parte de un sitio institucional de salud.
**Prioridad.** Obligatorio
**Verificación.** Análisis

### RP-NF-004 · Tiempo de carga
**Enunciado.** La página de inicio debe alcanzar un LCP menor o igual a 2,5 segundos en una conexión móvil 4G de referencia.
**Justificación.** Umbral «bueno» de Core Web Vitals; el sitio compite en búsqueda orgánica.
**Prioridad.** Deseable
**Verificación.** Análisis

### RP-NF-005 · Contenido por commit
**Enunciado.** El contenido de las páginas públicas y del asistente debe actualizarse mediante cambios en el repositorio, sin panel de administración de contenido.
**Justificación.** Cambia pocas veces al año; el historial de git es la trazabilidad.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-NF-006 · Sistema visual
**Enunciado.** El sitio debe aplicar el sistema visual definido: paleta azul petróleo, Lora en titulares y Source Sans 3 en cuerpo e interfaz.
**Justificación.** Coherencia con la guía de estilos aprobada; sin verde en el sistema.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-NF-007 · Continuidad ante fallos externos
**Enunciado.** Un fallo del proveedor del asistente o del proveedor de calendario no debe impedir que el visitante consulte las páginas públicas.
**Justificación.** Los servicios externos son dependencias, no el producto.
**Prioridad.** Obligatorio
**Verificación.** Prueba

### 5.7 Restricciones

### RP-R-001 · Sin registro público
**Enunciado.** El sitio no debe ofrecer creación de cuentas ni inicio de sesión a prestadores.
**Justificación.** El enlace privado cubre la única necesidad de autoacceso, que es cancelar.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-R-002 · Sin pagos
**Enunciado.** El sitio no debe incluir cobro, facturación ni pasarela de pagos.
**Justificación.** SU-3.
**Prioridad.** Obligatorio
**Verificación.** Inspección

### RP-R-003 · Sin agendamiento desde el asistente
**Enunciado.** El asistente no debe crear, consultar ni modificar solicitudes.
**Justificación.** ADR-0005.
**Prioridad.** Obligatorio
**Verificación.** Prueba

## 6. Criterios de aceptación de la primera etapa

La etapa se considera cumplida cuando, en el entorno de producción:

1. Un prospecto completa una solicitud desde un teléfono móvil y recibe la invitación con videollamada en menos de dos minutos.
2. El gestor ve esa solicitud en `/admin`, en la posición que corresponde a su momento.
3. El prospecto cancela desde el enlace privado y la solicitud sigue visible para el gestor.
4. El asistente responde una pregunta del FAQ y declina una pregunta normativa derivando a `/solicitar`.
5. Todo requisito **Obligatorio** de este documento tiene al menos un requisito del SRD que lo cubre y ese requisito está verificado.

## 7. Pendientes de decisión

| ID | Pendiente | Impacto |
|---|---|---|
| ~~TBD-1~~ | Cerrado en ADR-0004: si la consulta de ocupación falla no se ofrece ningún horario | RP-F-007, RP-NF-007 |
| TBD-2 | Si la cita la atiende siempre el mismo socio o rotan | Define si el calendario es de una cuenta personal o de marca |
| TBD-3 | Presupuesto mensual del asistente | Calibra RP-F-019 |
| TBD-4 | Razón social y NIT para el pie de página | RP-L-002, RP-F-003 |
| TBD-5 | Dominio remitente de los correos | RP-F-021, RP-F-022 |

## 8. Referencias

- `CONTEXT.md` — glosario de dominio.
- `docs/adr/0001` a `0005` — decisiones registradas.
- Ley 1581 de 2012 y Decreto 1377 de 2013 — protección de datos personales en Colombia.
- ISO/IEC/IEEE 29148:2018 — Systems and software engineering, Life cycle processes, Requirements engineering.
