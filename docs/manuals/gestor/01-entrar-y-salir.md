# Entrar y salir de la administración

- **Quién**: socio de GHYCS incluido en la lista de acceso.
- **Para qué**: abrir la administración para atender las solicitudes, y cerrarla al terminar.
- **Estado**: Disponible · Now.
- **Requisitos**: RP-F-013, RC-5 (ADR-0006).

## Antes de empezar

- Cada socio entra con **su propia cuenta de Google**, la misma de su calendario y sus videollamadas.
- Solo entran los correos de la **lista de acceso**. Cualquier otra cuenta de Google se rechaza aunque exista.
- No hay roles: quien entra ve y puede hacer todo.
- No hay contraseña propia del sitio. La verificación en dos pasos, si la tiene activa, es la de Google.

## Pasos para entrar

1. Abra la dirección de acceso del gestor: `/login` en el dominio del sitio. Guárdela en favoritos. El sitio público no muestra un enlace a la administración.
2. En «Acceso del gestor», toque **«Entrar con Google»**.
3. Google le muestra sus cuentas. Elija la de GHYCS que está en la lista de acceso. Si Google se lo pide, escriba su contraseña o apruebe la verificación en el celular.
4. La primera vez, Google le pide permiso para compartir su **nombre, correo y foto de perfil** con el sitio. Acepte. El sitio no pide acceso a su calendario ni a su correo.
5. Llega a **«Solicitudes»**, el listado de la administración. Continúa en [Revisar las solicitudes](03-revisar-las-solicitudes.md).

## Pasos para salir

1. Toque **«Salir»**, arriba a la derecha de cualquier pantalla de la administración.
2. Se cierra su sesión en el sitio y vuelve al sitio público. Su sesión de Google sigue abierta en el navegador.
3. En un equipo compartido, cierre también la sesión de Google.

## Caminos alternativos y problemas

| Lo que pasa | Por qué | Qué hacer |
|---|---|---|
| El sitio rechaza su cuenta después de elegirla en Google | Esa cuenta no está en la lista de acceso (por ejemplo, eligió su cuenta personal). | La pantalla «Acceso del gestor» muestra «No fue posible entrar con esa cuenta. Use la cuenta de Google de GHYCS que está en la lista de acceso.» Toque de nuevo «Entrar con Google» y elija la cuenta de GHYCS. |
| Un socio nuevo no puede entrar | Su correo no está en la lista de acceso. | La lista se cambia en la configuración del sitio, no desde la administración: pídale el cambio al administrador técnico. |
| Un socio deja GHYCS | Su correo sigue en la lista mientras no se retire. | Pida al administrador técnico que lo retire de la lista. Desde que se retira, cualquier pantalla de la administración lo devuelve a «Acceso del gestor» con el mensaje de rechazo, aunque tuviera la sesión abierta. |
| Abre una pantalla de la administración y lo lleva a «Acceso del gestor» | No tiene sesión abierta o su sesión venció. | Entre de nuevo con Google. Llega a «Solicitudes», no a la pantalla que intentaba abrir. La sesión dura siete días desde que entra. |
| Google no carga o falla la verificación | Problema con Google o con su conexión. | Espere unos minutos e intente de nuevo. Mientras tanto, el sitio público sigue recibiendo solicitudes. |
| Tocó «Cancelar» en la pantalla de permisos de Google | El sitio no recibió su identidad. | La pantalla muestra el mismo mensaje de rechazo. Vuelva a tocar «Entrar con Google» y acepte los permisos. |
