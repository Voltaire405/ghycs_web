# El gestor entra con su cuenta de Google vía Better Auth

El acceso a `/admin` se hace con Better Auth y el inicio de sesión social de Google. Solo entran los correos de una lista blanca definida por entorno; cualquier otra cuenta de Google se rechaza aunque se autentique. Se descarta la cuenta local con contraseña guardada como hash Argon2id.

El gestor ya vive en Google: su calendario es la fuente de la disponibilidad (ADR-0004) y las citas llevan videollamada de Google. Entrar con esa misma cuenta le ahorra una contraseña más, delega en Google la verificación en dos pasos y el freno a la fuerza bruta, y elimina el código propio de hash, sesión y límite de intentos.

## Consecuencias

Better Auth guarda usuarios y sesiones en Postgres con su adaptador de Drizzle, así que suma tablas al esquema. El inicio de sesión pide solo los permisos de identidad (correo y perfil); el acceso al calendario sigue en su propia credencial de servidor, para que la disponibilidad no dependa de que un socio tenga la sesión abierta.

La lista blanca contiene los correos de los tres socios, cada uno con su propia cuenta; no hay roles (RC-5 del PRD): quien está en la lista ve todo, y nadie más entra.
