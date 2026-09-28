# Revisar las solicitudes

- **Quién**: socio de GHYCS con sesión abierta.
- **Para qué**: ver qué solicitudes hay, cuáles atender primero y el detalle de cada una.
- **Estado**: Parcial · Now. Muestra las solicitudes reales, que se conservan tras reinicios y despliegues del sitio. En el sitio publicado la administración responde «no encontrada» hasta que exista la entrada con Google.
- **Requisitos**: RP-F-012, RP-F-014, RP-F-015, RP-F-016.

## El listado

Al entrar llega a **«Solicitudes»**. Es una tabla con una fila por solicitud:

- «Prestador»: nombre, como enlace al detalle.
- «Momento»: en qué situación llega el prestador.
- «Cita»: fecha y hora, en hora de Colombia.
- «Estado»: una o dos etiquetas:
  - «Agendada», «Cancelada», «Atendida» o «No asistió».
  - «Sin sincronizar», además, cuando la cita no quedó en el calendario y el prestador no recibió la invitación.

**El orden es por urgencia**, no por fecha de llegada. Arriba van los cierres de servicio, luego los hallazgos, luego las novedades y al final las habilitaciones iniciales. Dentro de cada grupo, la cita más próxima va primero.

Todas las solicitudes se quedan en el listado, también las canceladas y las ya atendidas.

## Pasos

1. Recorra el listado de arriba abajo: ese es el orden en que conviene atender.
2. Busque las etiquetas que piden acción:
   - «Sin sincronizar»: siga [Resolver una invitación que no se envió](04-resolver-una-invitacion-no-enviada.md).
   - «Cancelada»: siga [Retomar una solicitud con la cita cancelada](07-retomar-una-solicitud-cancelada.md).
   - «Agendada» con la fecha ya pasada: la cita ocurrió y falta cerrarla ([Cerrar una cita](05-cerrar-una-cita.md)).
3. Toque el **nombre del prestador** para abrir el detalle.
4. En el detalle verá el nombre como título, las etiquetas de estado y los datos:
   - «Prestador», «Tipo de prestador», «Momento».
   - «Correo» y «Teléfono» para contactarlo.
   - «Cita»: fecha y hora.
   - «Descripción»: lo que el prestador escribió, o «Sin descripción.».
   - «Recibida»: el día en que llegó la solicitud.
5. Debajo están **«Cierre de la cita»** ([Cerrar una cita](05-cerrar-una-cita.md)) y **«Notas del gestor»** ([Registrar notas](06-registrar-notas.md)). Junto al correo está la opción de corregirlo y reenviar la confirmación ([Reenviar el enlace privado](10-reenviar-el-enlace-privado.md)).
6. Toque **«Volver a las solicitudes»** para regresar al listado.

## Caminos alternativos y problemas

| Lo que ve | Por qué | Qué hacer |
|---|---|---|
| En el celular la tabla no cabe | La tabla es más ancha que la pantalla. | Deslice la tabla hacia los lados, o gire el teléfono. |
| El listado está vacío | Aún no llegan solicitudes. | Nada que hacer. **⚠ Por definir**: mensaje para el listado vacío (hoy la tabla sale sin filas). |
| El listado crece mucho con solicitudes viejas | No hay filtros ni archivo. | **⚠ Por definir**: si hace falta filtrar por estado o archivar las cerradas. |
| «Página no encontrada» al abrir un detalle | La dirección de esa solicitud no existe (por ejemplo, un enlace mal copiado). | Vuelva al listado con la dirección `/admin` y ábrala desde ahí. |
| Busca a un prestador concreto | No hay buscador. | Use la búsqueda del navegador (Ctrl+F o «Buscar en la página»). |
