# ghycs_web

Sitio de **GHYCS — Gestores de Habilitación y Calidad en Salud**. Conecta a los prestadores de servicios de salud en Colombia con el gestor que los asesora y acompaña para cumplir las condiciones de habilitación y mejorar la calidad de su atención.

En producción: <https://ghycs.vercel.app>

## Qué hace

- **Sitio público**: presenta la oferta, responde dudas con un asistente y lleva a una sola acción, «Agende su cita».
- **Solicitud con cita**: el prestador elige una hora libre del calendario real del gestor, deja sus datos y autoriza su tratamiento. Recibe la invitación con videollamada y un correo de confirmación con su enlace privado.
- **Enlace privado**: el prestador consulta o cancela su cita sin crear cuenta. Al cancelar se retira el evento del calendario.
- **Administración (`/admin`)**: el gestor entra con su cuenta de Google, ve las solicitudes por urgencia, cierra citas y registra notas.

El comportamiento visible de cada flujo está descrito, paso a paso, en los [manuales](docs/manuals/README.md).

## Pila

| Pieza | Para qué |
|---|---|
| pnpm workspaces | Monorepo; la app vive en `apps/web`. |
| Next.js 16 (App Router) + React 19 | Sitio público y `/admin` en una sola app. |
| TypeScript + Zod | Tipos del dominio y validación en las fronteras. |
| Tailwind CSS v4 | Estilos sobre los tokens del sistema visual (`ds-bundle/`). |
| Turso (libSQL) + Drizzle | Solicitudes y sesiones, con migraciones versionadas. |
| Google Calendar API | Disponibilidad (FreeBusy) y eventos con videollamada. |
| Resend | Correo de confirmación con el enlace privado. |
| Better Auth + Google | Acceso del gestor, limitado a una lista de correos. |
| OpenRouter | Asistente público, que responde solo con los manuales del prestador. |
| Vitest + jsdom + axe-core | Casos de uso, contratos de puertos y render accesible. |

El detalle y sus razones están en [`docs/tech-stack.md`](docs/tech-stack.md) y en los [ADR](docs/adr/).

## Empezar

Requisitos: Node 24 (la versión del CI) y pnpm 11.

```sh
pnpm install
cp .env.example apps/web/.env.local   # completa las variables; ver abajo
pnpm --filter @ghycs/web db:migrate   # con DATABASE_URL=file:local.db crea la base local
pnpm dev                              # http://localhost:3000
```

El arranque valida el entorno y falla nombrando cada variable que falte. Qué exige cada una está comentado en [`.env.example`](.env.example):

- **Base de datos**: `DATABASE_URL` y `DATABASE_AUTH_TOKEN`. En local basta `file:local.db`, sin token.
- **Google**: `GOOGLE_*`, un cliente OAuth con refresh token de calendario. Para una cuenta de prueba, corre `scripts/credenciales-google.sh`.
- **Acceso del gestor**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` y `CORREOS_SOCIOS`.
- **Correo**: `RESEND_API_KEY` y `CORREO_REMITENTE`, con un remitente de dominio verificado en Resend.
- **Asistente**: `OPENROUTER_API_KEY` es opcional. Sin ella, la burbuja avisa que el asistente no está disponible.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo. |
| `pnpm test` | Suite completa. Los contratos contra Google y Resend se omiten sin credenciales. |
| `pnpm typecheck` | Tipos. |
| `pnpm lint` | ESLint, incluidas las fronteras entre capas. |
| `pnpm build` | Build de producción. |

Para correr los contratos contra los servicios reales:

```sh
cd apps/web && set -a && . ./.env.local && set +a && pnpm exec vitest run contrato
```

## Estructura

```
apps/web/src/
  app/                 rutas: (publico), (gestor) y api/
  modulos/
    solicitudes/       dominio, aplicación (casos de uso), infraestructura (adaptadores) y ui
    acceso/            sesión del gestor y lista de acceso
  compartido/          ui, configuración de entorno y cliente de base de datos
docs/
  mission.md, tech-stack.md, roadmap.md   constitución del proyecto
  prd.md                                  requisitos
  adr/                                    decisiones de arquitectura
  manuals/                                oráculo del comportamiento visible
  agents/                                 guías de trabajo y de operación en producción
ds-bundle/             sistema visual: tokens, clases y guía de copy
CONTEXT.md             glosario del dominio
```

Cada módulo separa el dominio, la aplicación (casos de uso), la infraestructura (adaptadores de los puertos) y la presentación. ESLint impide importar entre capas en la dirección equivocada. Cada puerto tiene una suite de contrato que corre contra su falso en memoria y contra el adaptador real.

## Despliegue

Vercel despliega cada push a `main`, y el CI de GitHub Actions corre lint, tipos, pruebas y build. Las migraciones se aplican a mano a Turso antes del push que las necesite. Variables, credenciales y verificación en producción: [`docs/agents/produccion.md`](docs/agents/produccion.md).

## Cómo se trabaja

- La constitución es [`docs/mission.md`](docs/mission.md), [`docs/tech-stack.md`](docs/tech-stack.md) y [`docs/roadmap.md`](docs/roadmap.md). Lo que se implementa se alinea con ella.
- Un cambio que el usuario ve actualiza su manual en el mismo commit ([`docs/agents/manuales.md`](docs/agents/manuales.md)).
- El vocabulario del dominio es el de [`CONTEXT.md`](CONTEXT.md). Al visitante se le trata de usted.
- Los commits siguen Conventional Commits.
