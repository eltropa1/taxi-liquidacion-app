# Record Notes and Attachments UI Integration Notes v1.0

## Estado

Estado: Implementation Note.

Este documento describe la integracion tecnica realizada para `Detalle del servicio`.
No sustituye a `Record Notes and Attachments Architecture Proposal v1.0.md`.

## Alcance

La pantalla `Detalle del servicio` integra la seccion `Notas y adjuntos` para propietarios:

```text
ownerType = registered_service
ownerId = String(trip.id)
```

La seccion permite gestionar una nota principal y adjuntos independientes del guardado principal del servicio.

## Dependencias

Dependencias autorizadas instaladas:

- `expo-image-picker`;
- `expo-document-picker`.
- `expo-intent-launcher`.

Dependencia existente utilizada:

- `expo-sharing`.

No se instala `expo-camera`, compresion de imagenes ni gestor documental externo.

## Permisos

La camara y galeria se solicitan solo cuando el usuario elige `Tomar foto` o `Galeria`.

El selector de PDF usa el selector del sistema mediante `expo-document-picker`.

No se introducen permisos legacy amplios como parte de esta integracion.

## Reconciliacion

La pantalla no ejecuta reconciliacion global automatica en cada render.

La carga de enriquecimientos se limita al propietario actual. La reconciliacion transversal existente queda disponible para ejecucion controlada posterior.

## Apertura y comparticion

Compartir adjuntos usa `expo-sharing` con una URI resuelta por Application/Infrastructure.

Abrir adjuntos en Android usa `expo-intent-launcher` con:

- `ACTION_VIEW`;
- URI tecnica obtenida desde `AttachmentFileStoragePort`;
- MIME explicito persistido o derivado de metadatos validados;
- `FLAG_GRANT_READ_URI_PERMISSION`.

La UI no conoce `storageKey`, rutas fisicas ni authorities de `FileProvider`.

`Linking.openURL` no se usa en Android para abrir adjuntos porque no permite expresar de forma fiable MIME y permiso temporal de lectura para consumidores externos como Google Photos.

## Limitaciones conocidas

- Abrir adjuntos delega en Android mediante intent nativo resuelto por Application/Infrastructure.
- Compartir depende de disponibilidad del sistema.
- La camara del AVD puede limitar la validacion de captura real; galeria cubre la importacion real de imagenes y los tests cubren el resultado exitoso del picker de camara.
- La politica final de backup/publicacion de adjuntos sigue pendiente segun la propuesta aprobada.
