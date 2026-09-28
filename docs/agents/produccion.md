# Producción

Cómo operar el sitio publicado: desplegar, migrar la base, cambiar variables y renovar la credencial de Google, y cómo verificar cada cosa. Las CLI `vercel`, `turso` y `gh` están instaladas y con sesión iniciada en esta máquina: úsalas en vez de pedirle al usuario que opere los paneles.

## Estado actual: demo

- Sitio: `https://ghycs.vercel.app`, desplegado por Vercel en cada push a `main`.
- Calendario: el principal de `jlmarin.ing@gmail.com`, con el refresh token de **prueba**. Las citas y las invitaciones salen de esa cuenta, no de una de GHYCS.
- Lista de acceso a `/admin` (`CORREOS_SOCIOS`): solo `jlmarin.ing@gmail.com`.
- Correo de confirmación: Resend, cuenta `ghycs@micromegasoft.com`, clave de **prueba**. Sale de `GHYCS <ghycs@micromegasoft.com>` (`CORREO_REMITENTE`): el dominio `micromegasoft.com` está verificado en Resend, así que llega a cualquier destinatario.
- La app OAuth de Google sigue en **Testing**: el refresh token caduca a los 7 días. Google rechazó `ghycs.vercel.app` al verificar el branding, así que publicarla exige un dominio propio. Mientras no exista, el token se renueva a mano (ver [Credencial de Google](#credencial-de-google)).

## Vercel

Proyecto `ghycs` en el equipo `micromegasoft`. Todo comando lleva `--scope micromegasoft --project ghycs` y se corre **desde la raíz del repo**: desde `apps/web` la CLI no resuelve el proyecto y falla sin decir por qué. En zsh, escribe esas opciones literalmente en cada comando: una variable `$V` con ambas no se separa en palabras y la CLI las rechaza.

- Variables: las de Production están guardadas como **Secret**. `vercel env pull` no las devuelve y reemplazar una es `vercel env rm <NOMBRE> production --yes` seguido de `printf '%s' "$valor" | vercel env add <NOMBRE> production`. Pasa el valor por tubería, nunca en la línea de comandos ni en la salida.
- Una variable nueva no se aplica hasta desplegar de nuevo: `vercel redeploy <url-del-último-despliegue> --target production`. La URL sale de `vercel ls ghycs`.
- El build de Next valida el entorno con `leerEnv()`: una variable exigida que falte rompe el despliegue. Cárgala en Vercel **antes** del push que la exige.
- Por qué falló un despliegue: `vercel inspect <url> --logs`.
- Estado del despliegue de un commit, sin abrir el panel: `gh api repos/Voltaire405/ghycs_web/commits/<sha>/status --jq '.statuses[] | select(.context=="Vercel") | .state'`.

## Resend

`RESEND_API_KEY` y `CORREO_REMITENTE` están en Vercel (Production), en `apps/web/.env.local` y como secretos del repo para el contrato de CI. El remitente debe ser de un dominio verificado en la cuenta; se comprueba con `GET https://api.resend.com/domains` (campo `status: verified`). El contrato envía a `delivered@resend.dev`, que simula la entrega sin que nadie reciba nada.

## Turso

Base `ghycs`, URL `libsql://ghycs-voltaire405.aws-us-east-1.turso.io`. Las migraciones no corren al desplegar: una migración nueva en `apps/web/drizzle/` se aplica a producción a mano, antes del push que la necesita:

```sh
cd apps/web && TOKEN=$(turso db tokens create ghycs) \
  DATABASE_URL=libsql://ghycs-voltaire405.aws-us-east-1.turso.io DATABASE_AUTH_TOKEN=$TOKEN pnpm db:migrate
```

Para mirar datos: `turso db shell ghycs "<sql>"` (por ejemplo, `.tables`, o las filas de `user` y `session` tras un inicio de sesión).

## Credencial de Google

Un solo cliente OAuth sirve para FreeBusy, para crear citas (`calendar.freebusy` y `calendar.events`) y para el inicio de sesión del gestor. Su refresh token se genera con `scripts/credenciales-google.sh`, un wizard que **el usuario** corre en una terminal propia: pide datos por teclado y se detiene si no tiene terminal, así que no funciona con el prefijo `!` ni desde una herramienta. El wizard escribe `GOOGLE_*` en `apps/web/.env.local` y sube los secretos `GOOGLE_TEST_*` que usa CI. **No toca Vercel.**

Renovar el token de la demo (cada 7 días, o cuando CI falle con `invalid_grant`):

1. El usuario corre el wizard. En todas las etapas conserva los valores actuales, salvo la 5: ahí genera un refresh token nuevo con los dos permisos.
2. Comprueba los permisos del token nuevo: pide un access token con `.env.local` y revisa que el campo `scope` traiga `calendar.events` y `calendar.freebusy`.
3. Reemplaza `GOOGLE_REFRESH_TOKEN` en Vercel con el de `apps/web/.env.local` y vuelve a desplegar.

Las redirecciones autorizadas del cliente son OAuth Playground, `https://ghycs.vercel.app/api/auth/callback/google` y, para entrar en local, `http://localhost:3000/api/auth/callback/google`.

## Verificar

Al terminar un cambio que llega a producción, cubre las tres capas:

1. **CI**: `gh run watch <id> --exit-status` sobre la última ejecución del workflow `CI`. Con los secretos cargados, los contratos contra Google corren y no se omiten: el resumen debe decir «N passed», sin «skipped».
2. **Contratos contra Google y Resend en local**, antes del push, cuando cambia uno de sus adaptadores:
   ```sh
   cd apps/web && set -a && . ./.env.local && set +a && pnpm exec vitest run contrato
   ```
   Los eventos que crea el contrato del calendario se borran solos y no envían invitaciones.
3. **Humo en producción**, tras el despliegue:
   - `/`, `/solicitar` y `/login` responden 200; `/admin` responde 307 hacia `/login`.
   - `/solicitar?fecha=<día hábil a más de 24 h>` trae horas: cuenta las apariciones de `name="citaInicio"` en el HTML (las ocurrencias, no las líneas: el HTML viene en una sola). Si aparece «No es posible consultar la disponibilidad ahora», el token de Google falló.
   - `POST /api/auth/sign-in/social` con `{"provider":"google","callbackURL":"/admin"}` devuelve una URL de Google con `scope=email+profile+openid`.

No envíes una solicitud real como prueba: crea un evento en el calendario de la demo y manda una invitación. Si hace falta probar ese camino completo, pídeselo al usuario con un correo suyo.
