# Diseño preliminar del sitio

Estado: propuesta. Consolida las decisiones tomadas en la fase de planeación, antes de
escribir código. El vocabulario sigue `CONTEXT.md`; donde este documento se aparte del
glosario, gana el glosario.

## Objetivo

El sitio conecta al prestador con el gestor. Su unidad de trabajo es la **solicitud**:
el visitante llega, se convierte en prospecto al identificarse, y envía una solicitud de
asesoría o acompañamiento. Todo lo demás en el sitio existe para que esa solicitud
ocurra o para atenderla.

## Decisión de modelado: la solicitud es el agregado, la cita es un atributo

Se evaluaron tres opciones:

- **A.** Solicitud sin agenda: formulario y respuesta posterior. Elimina la integración
  de calendario, pero el prospecto se va sin fecha y la conversión depende del tiempo de
  respuesta del gestor.
- **B.** Cita como agregado: alto poder de conversión, pero desplaza a la solicitud del
  centro del modelo y contradice el glosario.
- **C.** Solicitud como agregado, cita como atributo. **Elegida.**

En C el prospecto describe su situación y elige horario en un mismo flujo. Lo que se
persiste es una solicitud que además trae hora agendada. La solicitud sobrevive a la
cancelación de la cita: si el prospecto cancela, la solicitud queda sin atender y el
gestor la ve, en lugar de desaparecer del sistema.

El término «cita de diagnóstico» queda descartado: «diagnóstico» está en los términos a
evitar bajo *autoevaluación*. La reunión se llama simplemente **la cita**.

## Idioma del sitio

El copy visible se dirige al prestador en **usted**, en registro neutro. El tuteo que
establece `CLAUDE.md` aplica a la comunicación con el equipo —issues, ADR, commits,
comentarios de código, este documento—, no al contenido del sitio.

El código y la base de datos usan el vocabulario del glosario. Las etiquetas de interfaz
pueden apartarse de él cuando el visitante no lo comparte: el botón puede decir «Agende
su cita» aunque la ruta sea `/solicitar` y la tabla `solicitudes`.

## Mapa de rutas

### Público

| Ruta | Contenido |
|---|---|
| `/` | Presentación, tipos de prestador atendidos, resumen de servicios, resumen del equipo |
| `/nosotros` | Identidad del gestor, enfoque, los tres socios, cobertura |
| `/servicios` | Portafolio: asesoría, acompañamiento, PAMEC |
| `/solicitar` | Situación del prestador, datos, elección de horario, autorización de datos |
| `/solicitar/confirmacion` | Confirmación inmediata; medición de conversión |
| `/solicitud/[token]` | Consulta y cancelación mediante enlace privado |
| `/politica-de-datos` | Tratamiento de datos personales (Ley 1581 de 2012) |
| `/404` | |

Widget de asistente flotante en todas las públicas.

### Privado

| Ruta | Contenido |
|---|---|
| `/login` | Un solo administrador; sin registro público ni recuperación por correo |
| `/admin` | Solicitudes, con las urgentes destacadas, más configuración del asistente |
| `/admin/solicitudes/[id]` | Detalle, estado de la cita, notas del gestor |
| `/admin/conversaciones` | Historial del asistente |

### API

`POST /api/solicitudes` · `POST /api/asistente` (streaming)

## Modelo de datos

```sql
solicitudes
  id, token uuid, nombre, correo, telefono,
  tipo_prestador   ips | profesional_independiente | objeto_social_diferente
  momento          habilitacion_inicial | novedad | hallazgo | cierre_servicio
  descripcion,
  cita_inicio      timestamptz,
  cita_estado      agendada | cancelada | atendida | no_asistio,
  google_event_id, meet_link,
  autorizacion_datos bool, autorizacion_fecha, notas_gestor, creada_en
  UNIQUE (cita_inicio) WHERE cita_estado <> 'cancelada'

conversaciones
  id, session_id, mensajes jsonb, derivo_a_solicitud bool, creada_en

limites_ip
  ip_hash pk, ventana_inicio timestamptz, conteo int

configuracion
  clave pk, valor jsonb, actualizado_en
```

### Los dos ejes de la solicitud

`tipo_prestador` y `momento` son independientes y ambos son necesarios. El primero dice
quién es; el segundo, por qué llega. Sin `momento`, el gestor ve una lista plana donde
una habilitación inicial y un cierre del servicio se ven igual, cuando el segundo es la
situación más grave y más urgente de las cuatro.

`/admin` ordena por urgencia, no solo por fecha: cierre del servicio primero, luego
hallazgo, luego novedad y habilitación inicial.

### Por qué el índice único lleva `WHERE`

Protege contra doble reserva sin bloquear para siempre el horario de una cita cancelada.

### Por qué `ip_hash` y no la IP

Una dirección IP es dato personal bajo la Ley 1581 de 2012. SHA-256 con sal en variable
de entorno permite limitar el consumo sin almacenar el identificador.

## Flujo de creación de la solicitud

```
1. Validar carga útil y autorización de datos
2. FreeBusy: confirmar que el horario sigue libre
3. INSERT en solicitudes            ← el candado real está aquí
4. Crear evento en Google Calendar  (conferenceDataVersion: 1, sendUpdates: 'all')
5. Guardar google_event_id y meet_link
6. Responder → /solicitar/confirmacion
```

Si el paso 4 falla, la solicitud ya existe y no se pierde el prospecto: queda marcada
como pendiente de sincronizar y se destaca en `/admin`. El orden inverso —Google primero—
dejaría el sistema sin protección contra doble reserva.

El paso 2 no es el candado, solo evita ofrecer horarios que Google ya sabe ocupados. El
candado es el índice único; su violación se traduce a «ese horario acaba de ocuparse».

Nunca se confía en el horario que envía el cliente: se revalida en el servidor antes de
insertar.

## Disponibilidad y calendario

Google Calendar aporta **ocupación**, no disponibilidad. La disponibilidad la define el
sitio:

```
horarios ofrecidos = horario base − ocupación (FreeBusy)
```

El horario base —días hábiles, franjas, duración de 45 minutos— vive en variables de
entorno, no en base de datos. Al integrar FreeBusy se elimina la tabla de bloqueos y su
interfaz: el gestor bloquea su tiempo desde su propio calendario.

| Responsabilidad | Dueño |
|---|---|
| Candado contra doble reserva | Base de datos |
| Datos de la solicitud | Base de datos |
| Ocupación del gestor | Google Calendar (FreeBusy) |
| Invitación, recordatorio, enlace de videollamada | Google Calendar |

### Autenticación

Cuenta Gmail personal, un solo administrador. El consentimiento OAuth se hace una vez
desde un script local; en producción solo se intercambia el refresh token por access
token. Variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`,
`GOOGLE_CALENDAR_ID`. Alcances mínimos: `calendar.events` y `calendar.readonly`.

Tres trampas conocidas:

- La aplicación debe publicarse en **Production** en Google Cloud. En estado *Testing* el
  refresh token expira a los siete días y la agenda se cae en silencio.
- El token también expira tras seis meses sin uso. `/admin` muestra un aviso si la última
  llamada a Google falló.
- Sin `conferenceDataVersion: 1` el evento se crea sin enlace de videollamada y sin error.

`requestId` usa el token de la solicitud: reintentar tras un tiempo de espera agotado no
duplica la conferencia.

## Asistente

Responde preguntas básicas sobre el servicio del gestor. No interpreta la Resolución 3100
de 2019 ni ninguna otra norma, no indica qué estándares aplican a un prestador concreto,
no da plazos ni cifras, no promete resultados. Cuando la pregunta cruza ese límite,
deriva a `/solicitar`: ese análisis es precisamente el servicio que se vende.

Esa frontera coincide con el ADR-0002 y lo refuerza: si los propios anclas normativos
tienen citas sin confirmar, el asistente no puede repetirlas.

### Arquitectura

En el mismo Next.js, sin servicio aparte: es una llamada HTTP con transmisión por flujo,
no una tubería de datos.

Sin RAG ni base vectorial. El conocimiento son 2.000–4.000 tokens que caben en el prompt
del sistema, se concatenan en tiempo de construcción y se cachean como prefijo estable.

```
content/asistente/
  README.md      guía de trabajo; no entra al prompt
  identidad.md   tono y límites; lo mantiene desarrollo
  servicios.md   portafolio; lo escribe el gestor
  faq.md         25-30 preguntas reales; lo escribe el gestor
```

El contenido vive en el repositorio y se actualiza por commit. El historial de git es la
trazabilidad: si el asistente responde algo incorrecto, se sabe qué versión lo produjo.

Los comentarios HTML de las plantillas se eliminan al ensamblar el prompt; si se cuelan,
el modelo los lee como instrucciones.

### Control de consumo

Dos capas, ambas con estado durable en Postgres —un contador en memoria se multiplica por
el número de instancias en despliegue sin servidor:

- Por IP hasheada, ventana de una hora. Parametrizable desde `/admin`, con rango duro
  validado en el servidor (1–60). Sin ese rango, el control desaparece el día que alguien
  escriba 10000.
- Tope diario global. Es el que protege el presupuesto, porque las IP rotan. Al alcanzarlo
  el asistente se apaga y `/solicitar` sigue funcionando.

`asistente_activo` en `configuracion` es el interruptor para apagar el widget sin
desplegar. La configuración se cachea en memoria con TTL de 30–60 segundos.

### Superficie de riesgo

El asistente no lee la tabla de solicitudes ni crea reservas. Agendar sería la
funcionalidad obvia y es la que agrega riesgo sin beneficio: `/solicitar` ya son dos
clics. Con alcance estrecho y sin herramientas conectadas, el peor caso de un intento de
manipulación es una respuesta rara, no una fuga.

### Privacidad

El widget muestra un aviso al abrirse. El asistente no solicita datos personales; si el
prospecto los escribe, no los repite ni los confirma. Las conversaciones se guardan para
mejorar el servicio y para leer qué falta en `/servicios`.

## Sistema visual

Azul petróleo con Lora y Source Sans 3. Archivos: `ghycs-tokens.css`, `fonts.ts`,
`ghycs-guia-estilos.html`.

| Uso | Valor | Contraste sobre blanco |
|---|---|---|
| Titulares | `#0b3b3c` | 12,3:1 |
| Cuerpo | `#2f4746` | 10,4:1 |
| Texto de apoyo | `#5f7373` | 5,1:1 |
| Enlaces | `#17756e` | 5,5:1 |
| Blanco sobre acción `#115e59` | — | 7,5:1 |
| `#2a9187` | — | 3,8:1 — solo bordes y rellenos |

Lora en `h1`–`h3`; Source Sans 3 de `h4` hacia abajo y en toda la interfaz. Ancho de
línea de 68 caracteres en textos largos.

**No hay verde en el sistema.** El estado de éxito usa el petróleo de marca: un verde
junto a un teal se confunde de un vistazo. Rojo para lo destructivo, ámbar para
advertencia, azul para informativo.

Los neutrales llevan matiz petróleo en lugar de ser grises puros.

## Fuera de alcance

Registro de prestadores y cuentas públicas. El enlace con token opaco autentica sin
necesidad de contraseña.

CMS y panel de contenido. El contenido cambia pocas veces al año; se actualiza por commit.

Pagos, facturación y términos comerciales. La primera cita no tiene costo.

Roles y gestión de usuarios. Un solo administrador.

Recordatorio propio y sincronización bidireccional con Google. Los recordatorios los
envía Calendar. Las respuestas del asistente a la invitación no llegan a la base de datos
sin webhooks, y eso no se justifica para el volumen esperado.

Cobertura de transporte especial de pacientes, por ADR-0001.

Listado exhaustivo del marco normativo, por ADR-0002.

Acreditación, fuera de la oferta actual del gestor.

## Riesgos abiertos

**El contenido del asistente es el camino crítico.** Vale lo que valgan `servicios.md` y
`faq.md`. Con cinco preguntas genéricas, el asistente improvisa sobre la Resolución 3100
de 2019, que es justo el escenario a evitar. El material existe en el WhatsApp y las
llamadas del gestor; hay que transcribirlo.

**Entregabilidad del correo.** Es donde más se cae este tipo de proyecto. Dominio propio
verificado con SPF, DKIM y DMARC; sin eso, los correos a una IPS caen en spam.

**Modo oscuro sin revisión visual.** Está implementado con `prefers-color-scheme`. Si
nadie lo revisa, conviene borrarlo y fijar el tema claro: un modo oscuro sin control de
calidad se ve peor que no tenerlo.

**Cierre del servicio y tiempo de espera.** Ofrecerle el próximo horario libre dentro de
seis días a quien tiene un servicio cerrado es una mala respuesta a una urgencia real.
Por ahora basta con destacar esas solicitudes en `/admin`; un flujo aparte sería
sobreingeniería sin datos que lo respalden.

**El eje `momento` no está validado con el gestor.** Sale del glosario, no de una
conversación con los socios. Conviene confirmar que las cuatro situaciones cubren lo que
llega en la práctica.

## Decisiones que conviene elevar a ADR

- La solicitud es el agregado y la cita un atributo suyo (opción C).
- El sitio se dirige al prestador en usted; el tuteo aplica solo al equipo.
- La disponibilidad se calcula contra FreeBusy; no hay tabla de bloqueos.
- El asistente no interpreta la norma ni accede a datos de solicitudes.
- No hay verde en el sistema visual; el éxito usa el color de marca.

## Pendiente de definir

- ¿La cita la atiende siempre el mismo socio o rotan? Define si el calendario es de una
  cuenta personal o de una cuenta de la marca. Con rotación, los otros dos socios entran
  como invitados al mismo evento; no se buscan intersecciones entre tres calendarios.
- Presupuesto mensual del asistente. Calibra el límite por IP y el tamaño del modelo.
- Razón social y NIT para el pie de página, si la sociedad ya está constituida.
- Tailwind v4 (configuración en CSS) o v3 (`tailwind.config.ts`).
