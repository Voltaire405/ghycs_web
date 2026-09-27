# Tech stack

Deriva de [mission.md](mission.md) y [roadmap.md](roadmap.md). Cada pieza dice para qué está; cambiar una se registra en un ADR.

| Pieza | Para qué |
|---|---|
| pnpm workspaces | Monorepo; la app vive en `apps/web`. |
| Next.js 16 (App Router, server actions) + React 19 | Sitio público y `/admin` en una sola app. |
| TypeScript + Zod | Tipos del dominio y validación en las fronteras (formularios, entorno). |
| Tailwind CSS v4 | Estilos; los tokens del sistema visual viven en la app y se derivan a `ds-bundle/`. |
| Turso (libSQL) + Drizzle | Persistencia de las solicitudes y de las sesiones del gestor, con migraciones versionadas; el índice único parcial garantiza una cita por hora (ADR 0003, ADR 0007). |
| Google Calendar API | FreeBusy para la disponibilidad (ADR 0004) y eventos con videollamada para la invitación. |
| Resend | Correo transaccional: confirmación de la solicitud con el enlace privado. |
| Better Auth + Google | Acceso del gestor a `/admin` con su cuenta de Google, limitado a una lista blanca de correos (ADR 0006). |
| Vitest + jsdom + axe-core | Pruebas de casos de uso, contratos de puertos y render accesible de páginas. |
| ESLint | Estilo y fronteras entre capas (`no-restricted-imports`). |
