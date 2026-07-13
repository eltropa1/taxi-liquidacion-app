# Record Notes and Attachments Architecture Proposal v1.0

## 1. Estado

Estado: Approved.

Este documento ha sido revisado y aprobado como propuesta arquitectonica coherente con la arquitectura vigente.

Segun `Documentation Lifecycle v1.0`, `Approved` significa que el documento esta validado como coherente, pero no se promueve a `Normative` porque no sustituye a un documento rector ni define por si solo todas las reglas obligatorias del sistema.

## 2. Decision aprobada

GeoTaxi adoptara un patron transversal de notas y adjuntos para registros editables.

La decision aprobada mantiene:

- `RecordNote` y `RecordAttachment` como entidades separadas;
- asociacion transversal mediante `ownerType` y `ownerId`;
- catalogo cerrado de propietarios en Domain/Application;
- una nota principal editable por propietario en MVP;
- multiples adjuntos por propietario;
- archivos gestionados por GeoTaxi en filesystem interno;
- metadatos en SQLite, nunca blobs grandes;
- funcionamiento offline;
- operaciones de adjuntos independientes del guardado principal;
- reconciliacion ante desalineacion SQLite/filesystem;
- propietario inicial `registered_service` con `ownerId = String(trip.id)`;
- extensibilidad posterior a gastos y otras entidades;
- no crear tabla `services`;
- no anadir columnas nuevas de adjuntos en `trips`.

## 3. Contexto

GeoTaxi necesita permitir que registros editables incorporen notas, comentarios, imagenes, fotos y archivos adjuntos.

La primera integracion prevista es `Detalle del servicio`, pero la capacidad debe ser reutilizable para gastos, incidencias, movimientos economicos y otros registros administrativos.

El stack actual verificado es:

- Expo `~54.0.30`;
- React Native `0.81.5`;
- SQLite mediante `expo-sqlite` `~16.0.10`;
- filesystem mediante `expo-file-system` `~19.0.21`;
- compartir mediante `expo-sharing` `~14.0.8`;
- AsyncStorage solo para configuraciones simples;
- plataforma declarada en `app.json`: Android;
- no existe carpeta iOS en el repositorio;
- no estan instalados `expo-image-picker`, `expo-camera` ni `expo-document-picker`.

La tabla `trips` conserva columnas legacy `ticketPhotoUri` y `notes`, pero no deben usarse como patron futuro.

## 4. Problema

Notas y adjuntos son enriquecimiento. Aportan contexto documental, pero no hacen existir el hecho operativo ni el hecho economico.

El riesgo principal es acoplar esta capacidad a `Trip`, `Service` o `Expense` mediante columnas especificas, generando deuda, duplicacion y bloqueo del camino critico.

## 5. Objetivos

- Definir un patron transversal reutilizable.
- Mantener notas y adjuntos fuera del camino critico.
- Funcionar offline.
- Evitar columnas `photo1`, `photo2`, `fileUri` o equivalentes en entidades operativas.
- Permitir archivos locales gestionados por GeoTaxi.
- Preparar exportacion, backup y sincronizacion futura.
- Mantener Application como coordinadora y Infrastructure como adaptador tecnico.
- Persistir referencias estables de almacenamiento, no URIs absolutas del sandbox.

## 6. No objetivos

FUERA DE ALCANCE:

- implementar codigo;
- instalar dependencias;
- crear migraciones reales;
- crear tablas;
- definir UI visual definitiva;
- crear backend o sincronizacion remota;
- crear tabla `services`;
- modificar `Detalle del servicio`;
- modificar el Bottom Sheet;
- resolver la politica tecnica final de backup/publicacion.

## 7. Requisitos funcionales

- Un registro puede tener una nota principal editable.
- Una nota vacia o formada solo por espacios elimina la nota existente.
- Un registro puede tener multiples adjuntos hasta el limite MVP aprobado.
- Un adjunto puede proceder de camara, galeria o selector de archivo.
- Un adjunto puede abrirse o compartirse si el sistema lo permite.
- Un adjunto puede eliminarse individualmente.
- Eliminar un propietario debe coordinar la limpieza de sus notas, metadatos y archivos dependientes.
- Fallos de adjuntos no deben bloquear guardar un servicio, corregir economia, registrar gasto ni otras operaciones criticas.

## 8. Requisitos no funcionales

- Funcionamiento offline.
- Persistencia tolerante a fallo.
- No depender permanentemente de URIs temporales de pickers.
- No persistir URIs absolutas basadas en `FileSystem.documentDirectory`.
- No guardar blobs grandes en SQLite.
- Evitar logs con rutas o nombres sensibles cuando no sean necesarios.
- Mantener limites centralizados en Domain/Application o configuracion de implementacion, no dispersos por UI.
- Mantener archivos internos bajo control de la app mediante `storageKey`.

## 9. Alternativas evaluadas

### 9.1. Columnas directas dentro de `trips`

Descartado.

Repite el problema legacy de `ticketPhotoUri` y `notes`, no escala a gastos ni incidencias, y confunde Trip, Service y documentacion posterior.

### 9.2. Tabla especifica por entidad

Descartado para MVP.

Reduce ambiguedad de FK, pero duplica repositorios, migraciones y UI para cada nuevo registro editable.

### 9.3. Tablas transversales con asociacion polimorfica

Recomendado.

Permite `ownerType` + `ownerId`, evita columnas por entidad y sirve para servicios, gastos y otros movimientos.

Riesgo: SQLite no puede imponer FK polimorfica directa. Se compensa con catalogo cerrado en Domain/Application, validacion del propietario, indices y borrado coordinado por caso de uso.

### 9.4. Abstraccion de entidad padre `record`

No recomendado para MVP.

Puede ser elegante a futuro, pero exige introducir una identidad global nueva y reinterpretar entidades existentes antes de que haya suficientes tipos reales.

### 9.5. Blobs dentro de SQLite

Descartado.

Incrementa el tamano de la base de datos, complica backup parcial, empeora rendimiento y no aprovecha el filesystem del dispositivo.

### 9.6. Archivos en filesystem con metadatos en SQLite

Recomendado.

SQLite conserva identidad, propietario y metadatos; filesystem conserva bytes. Es el patron apropiado para React Native/Expo offline.

## 10. Arquitectura recomendada

Usar dos entidades transversales separadas:

- `RecordNote`: nota principal editable asociada a un propietario.
- `RecordAttachment`: adjunto asociado a un propietario.

Ambas comparten una asociacion polimorfica controlada:

- `ownerType`;
- `ownerId`.

Los archivos fisicos se copian al almacenamiento interno administrado por GeoTaxi. La app no debe depender de la URI temporal devuelta por un picker ni persistir la URI absoluta donde se resuelve el archivo.

SQLite debe persistir `storageKey`, una referencia estable y relativa administrada por GeoTaxi.

Ejemplo:

```text
attachments/registered_service/<ownerId>/<attachmentId>.<ext>
```

`AttachmentFileStoragePort` resuelve internamente `storageKey` a una URI fisica concreta. Domain, Application y UI no conocen `FileSystem.documentDirectory`.

## 11. Modelo conceptual

### 11.1. RecordOwnerType

`RecordOwnerType` es un catalogo cerrado o registro explicito de tipos admitidos.

Tipos iniciales:

- `registered_service`;
- `expense`;
- `administrative_movement`;
- `incident`.

Domain y Application no deben aceptar texto arbitrario.

La extensibilidad futura se hara ampliando explicitamente este catalogo.

### 11.2. RecordOwner

Representa el propietario semantico del enriquecimiento.

Campos:

- `ownerType`;
- `ownerId`.

Application debe:

- validar que `ownerType` pertenece al catalogo;
- validar la forma del identificador;
- comprobar la existencia del propietario cuando corresponda;
- impedir asociaciones a tipos desconocidos.

### 11.3. RecordNote

Campos minimos:

- `id`;
- `ownerType`;
- `ownerId`;
- `body`;
- `createdAt`;
- `updatedAt`.

MVP: una nota principal por propietario.

El cuerpo se normaliza eliminando espacios externos.

Una nota vacia o formada solo por espacios equivale a eliminar la nota existente.

Si no existia nota, no se crea una fila vacia.

`UNIQUE(ownerType, ownerId)` protege la unicidad.

Las notas pueden mantener id SQLite autoincremental en MVP porque no necesitan identidad previa a una operacion de filesystem.

### 11.4. RecordAttachment

Campos minimos:

- `id`;
- `ownerType`;
- `ownerId`;
- `attachmentKind`;
- `mimeType`;
- `originalName`;
- `storageKey`;
- `sizeBytes`;
- `createdAt`;
- `status`;
- `source`;
- `description`.

`id` debe ser estable y generado antes de comenzar la importacion, preferiblemente UUID o identificador equivalente independiente del autoincremento SQLite.

`description` es nullable y se mantiene porque aporta contexto humano opcional sin depender del nombre del archivo.

`internalName` no forma parte del modelo persistido. `id` y `storageKey` ya proporcionan identidad interna estable.

`source` debe admitir: `camera`, `gallery`, `document`, `import`.

## 12. Asociacion con propietarios

La asociacion debe ser polimorfica y controlada:

```text
ownerType TEXT NOT NULL
ownerId TEXT NOT NULL
```

`ownerId` debe almacenarse como texto para admitir ids numericos actuales y posibles ids UUID futuros.

Para servicios registrados, el propietario inicial aprobado es:

```text
ownerType = registered_service
ownerId = String(trip.id)
```

Esto reconoce que conceptualmente se adjunta al Service, pero fisicamente el registro vive hoy en `trips`.

Si en el futuro existe una tabla `services`, una migracion podra reasignar `registered_service:<tripId>` a una identidad de servicio sin reinterpretar adjuntos de Trip operativo.

## 13. Almacenamiento fisico

Los archivos deben copiarse a un directorio interno administrado por GeoTaxi.

SQLite debe persistir solo `storageKey`.

Ejemplo conceptual:

```text
attachments/registered_service/<ownerId>/<attachmentId>.<ext>
```

Infrastructure puede resolver temporalmente:

```text
FileSystem.documentDirectory/geotaxi/<storageKey>
```

Esa URI absoluta no forma parte del contrato persistido.

La extension debe derivarse de MIME type o nombre original cuando sea razonablemente confiable.

No debe dependerse de URIs temporales porque:

- pueden expirar;
- pueden depender de permisos externos;
- pueden apuntar a proveedores de documentos;
- pueden dejar de estar disponibles offline;
- pueden cambiar en restauraciones, reinstalaciones, migraciones o futuros mecanismos de backup.

## 14. Identidad previa a la copia

El `attachmentId` debe existir antes de comenzar la importacion.

Secuencia aprobada:

1. Application genera `attachmentId`.
2. Application valida propietario, limites y metadatos declarados.
3. Application construye `storageKey` temporal y final.
4. Infrastructure copia el archivo al area temporal administrada.
5. Application persiste o actualiza metadatos de importacion.
6. Infrastructure confirma el archivo en su `storageKey` final.
7. Application marca el adjunto como `ready` o compensa el fallo.

No debe insertarse primero una fila autoincremental solo para poder nombrar el archivo.

## 15. Validacion de archivos

Antes de importar, cuando la informacion este disponible, Application debe comprobar:

- tamano declarado;
- tipo admitido;
- extension razonable;
- limite de adjuntos por propietario.

Despues de copiar, Infrastructure/Application deben comprobar:

- que el archivo existe;
- tamano real;
- que no supera el limite;
- coherencia razonable entre extension, MIME declarado y tipo admitido.

MVP no garantiza seguridad absoluta por MIME o extension.

No se requiere inspeccion binaria avanzada en MVP.

## 16. Consistencia SQLite/filesystem

SQLite puede hacer rollback de metadatos; filesystem no.

La estrategia aprobada es consistencia eventual con compensacion.

Crear adjunto:

1. Generar `attachmentId`.
2. Copiar archivo a ubicacion temporal interna reconocible.
3. Persistir metadato con estado `pending` y `storageKey`.
4. Mover o confirmar archivo a `storageKey` final.
5. Verificar existencia y tamano real.
6. Actualizar estado a `ready`.
7. Si falla, marcar `failed` o limpiar temporal.

Eliminar adjunto:

1. Marcar metadato como `deleting`.
2. Intentar borrar archivo fisico.
3. Borrar metadato o conservar marca recuperable si la eliminacion queda incompleta.
4. Reconciliacion posterior limpia desalineaciones.

Eliminar propietario no debe quedar bloqueado por fallo de filesystem.

## 17. Estados

Estados aprobados:

- `pending`: importacion en curso o interrumpida.
- `ready`: archivo disponible.
- `failed`: importacion fallida con limpieza o reintento posible.
- `missing`: el metadato esperaba un archivo que no existe.
- `deleting`: eliminacion fisica pendiente o interrumpida.

Transiciones validas:

```text
pending -> ready
pending -> failed
pending -> missing
ready -> deleting
ready -> missing
failed -> pending
failed -> deleting
missing -> deleting
deleting -> eliminado
deleting -> missing
```

Acciones permitidas:

- `ready`: abrir, compartir, describir, eliminar.
- `pending`: mostrar como importando o recuperable; no abrir como archivo normal.
- `failed`: mostrar error, permitir reintento o eliminar.
- `missing`: mostrar archivo ausente, permitir eliminar metadato o reintentar si existe fuente.
- `deleting`: ocultar de la lista normal o mostrar eliminacion pendiente.

Al arrancar, reconciliacion debe revisar `pending` antiguos, `deleting` interrumpidos y `ready` cuyo archivo no exista.

Un adjunto que no este `ready` no se presenta como archivo disponible normal.

## 18. Ciclo de vida

### Crear adjunto

Seleccionar o capturar -> generar id -> validar -> copiar a temporal -> persistir `pending` -> confirmar `storageKey` final -> marcar `ready`.

### Listar

Leer metadatos por propietario y proyectar estado, nombre, tipo, tamano y acciones disponibles.

### Abrir o compartir

UI solicita la accion a Application/port. Infrastructure resuelve `storageKey` a URI fisica. UI nunca manipula rutas fisicas.

### Eliminar adjunto

Operacion independiente del guardado principal del propietario.

### Eliminar propietario

El caso de uso del propietario debe coordinar la eliminacion de enriquecimientos dependientes sin permitir que el filesystem bloquee la eliminacion critica.

## 19. Eliminacion

La eliminacion de un propietario debe:

1. Identificar nota y adjuntos del propietario.
2. Eliminar o marcar la nota para eliminacion dentro del flujo de datos.
3. Marcar adjuntos como `deleting` o registrar una tarea compensatoria.
4. Eliminar el propietario y sus datos criticos conforme a su transaccion.
5. Intentar eliminar archivos fisicos.
6. Limpiar metadatos cuando sea seguro.
7. Reconciliar posteriormente cualquier resto.

Un error de filesystem no debe mantener artificialmente vivo un servicio, gasto o movimiento operativo.

`No dejar huerfanos` significa:

- coordinacion inmediata cuando sea posible;
- restos detectables y recuperables;
- limpieza eventual por reconciliacion.

No significa atomicidad imposible entre SQLite y filesystem.

## 20. Reconciliacion prudente

Debe existir un caso de uso de reconciliacion.

La reconciliacion debe limitarse al directorio administrado por GeoTaxi.

Nunca debe tocar archivos externos ni rutas no administradas.

La estrategia debe incluir:

- directorio temporal separado;
- marcas temporales reconocibles;
- antiguedad minima antes de eliminar temporales;
- cuarentena o registro previo para archivos finales sin metadatos;
- revision de `ready` con archivo ausente para marcar `missing`;
- revision de `deleting` para completar limpieza;
- revision de `pending` antiguos para marcar `failed` o `missing`.

La reconciliacion no debe borrar inmediatamente cualquier archivo sin metadatos, porque puede ser una importacion interrumpida o en curso.

Los tiempos exactos quedan como configuracion de implementacion.

## 21. Seguridad

Los adjuntos pueden contener documentos personales, matriculas, recibos, imagenes de clientes o datos sensibles.

Protecciones recomendadas:

- usar almacenamiento interno de la app, no rutas publicas;
- no loguear contenido ni rutas absolutas;
- borrar fisicamente al eliminar cuando sea posible;
- evitar nombres internos con datos personales;
- pedir permisos solo cuando la accion lo requiera;
- advertir si un archivo esta ausente o no se puede abrir;
- tratar MIME y extension como senales utiles, no como garantia absoluta;
- considerar impacto de `android:allowBackup="true"` en decisiones futuras de backup.

## 22. Limites MVP

Decisiones aprobadas para MVP:

- una nota principal por propietario;
- maximo 5 adjuntos por propietario;
- maximo 10 MB por adjunto;
- imagenes admitidas: JPEG, PNG, WebP;
- documentos admitidos: PDF;
- `expo-image-picker` sera la dependencia preferida para camara y galeria;
- `expo-document-picker` sera la dependencia preferida para seleccionar documentos;
- no se instalara `expo-camera` salvo necesidad posterior demostrada;
- no habra compresion en el primer MVP;
- el original se conserva si cumple tamano y tipo;
- no se permiten tipos genericos arbitrarios en el primer MVP.

Los limites deben centralizarse en configuracion o Domain/Application durante la implementacion.

Restricciones tecnicas:

- no guardar blobs grandes en SQLite;
- copiar archivos al sandbox interno;
- no depender de URI temporal;
- persistir `storageKey`, no URI fisica.

## 23. Backup y exportacion futura

Decision pendiente: politica tecnica final de backup/publicacion.

Queda establecido:

- los adjuntos son datos del usuario;
- exportacion y backup futuro deben contemplarlos;
- antes de publicar debe revisarse `android:allowBackup`;
- esta politica no se resolvera con cambios apresurados en este bloque.

## 24. Capas

### Domain

Define:

- `RecordOwner`;
- `RecordOwnerType`;
- `RecordNote`;
- `RecordAttachment`;
- `AttachmentStatus`;
- `AttachmentSource`;
- `AttachmentKind`;
- limites y reglas puras cuando corresponda.

Domain no conoce Expo, SQLite, `FileSystem.documentDirectory`, URIs absolutas ni detalles del sandbox.

### Application

Casos de uso:

- `GetRecordEnrichment`;
- `UpdateRecordNote`;
- `DeleteRecordNote`;
- `PrepareRecordAttachmentImport`;
- `ImportRecordAttachment`;
- `CompleteAttachmentImport`;
- `CompensateAttachmentImport`;
- `DeleteRecordAttachment`;
- `DeleteRecordEnrichmentForOwner`;
- `ReconcileRecordAttachments`.

Application coordina repositorios y almacenamiento de archivos.

Application no expone a UI detalles de SQLite ni filesystem.

### Ports

Puertos requeridos:

- `RecordNoteRepositoryPort`;
- `RecordAttachmentRepositoryPort`;
- `AttachmentFileStoragePort`.

`AttachmentFileStoragePort` opera con `storageKey` y devuelve URIs fisicas solo cuando una accion tecnica lo requiere.

Adaptadores de seleccion/captura pueden abstraerse si la arquitectura real lo justifica al implementar.

### Infrastructure

Implementa:

- repositorios SQLite;
- migraciones;
- resolucion de `storageKey`;
- directorios temporal y definitivo;
- adaptador `expo-file-system`;
- `expo-image-picker` y `expo-document-picker` cuando se instalen;
- reconciliacion fisica.

### Presentation/UI

Responsabilidades:

- modelos proyectados;
- estados visibles;
- acciones;
- errores;
- separacion del guardado principal.

UI nunca maneja rutas fisicas ni accede directamente a SQLite o filesystem.

## 25. Integracion inicial con servicios

`Detalle del servicio` debe asociar enriquecimientos a:

```text
ownerType = registered_service
ownerId = String(trip.id)
```

La pantalla puede mostrar `Notas y adjuntos` en modo consulta y correccion.

La edicion de notas y adjuntos debe ser independiente de `Guardar correcciones`.

Un fallo al adjuntar archivo no debe impedir corregir importe, pago, horas o zonas.

## 26. Extensibilidad a gastos

Cuando exista Expenses, la misma arquitectura debe usar:

```text
ownerType = expense
ownerId = String(expense.id)
```

No debe crearse una tabla de adjuntos especifica para gastos salvo necesidad futura demostrada.

## 27. Migraciones

Esquema conceptual:

```sql
CREATE TABLE record_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownerType TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  body TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(ownerType, ownerId)
);

CREATE TABLE record_attachments (
  id TEXT PRIMARY KEY,
  ownerType TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  attachmentKind TEXT NOT NULL,
  mimeType TEXT,
  originalName TEXT,
  storageKey TEXT NOT NULL UNIQUE,
  sizeBytes INTEGER,
  createdAt TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  CHECK(status IN ('pending', 'ready', 'failed', 'missing', 'deleting')),
  CHECK(ownerType IN ('registered_service', 'expense', 'administrative_movement', 'incident')),
  CHECK(sizeBytes IS NULL OR sizeBytes >= 0)
);

CREATE INDEX idx_record_notes_owner
  ON record_notes(ownerType, ownerId);

CREATE INDEX idx_record_attachments_owner
  ON record_attachments(ownerType, ownerId);

CREATE INDEX idx_record_attachments_status
  ON record_attachments(status);
```

El cuerpo no vacio de `record_notes.body` es invariante de Application. SQLite puede reforzarlo en implementacion si encaja con el patron de migraciones.

No se recomienda FK polimorfica en SQLite.

La integridad debe resolverse en Application mediante validacion de propietario y casos de uso de borrado.

## 28. Riesgos

- Asociacion polimorfica puede dejar metadatos sin propietario si no se coordina el borrado.
- Filesystem y SQLite pueden desalinearse tras cierres abruptos.
- Permisos de camara/galeria/documentos requeriran configuracion especifica.
- `android:allowBackup="true"` puede incluir archivos internos en backups segun plataforma.
- Instalar pickers debe hacerse en un bloque separado y validarse en Android real.
- Validar MIME y extension no garantiza seguridad absoluta.

## 29. Decisiones pendientes

1. Backup/publicacion.
   Recomendacion: tratar adjuntos como datos del usuario para exportacion/backup futuro y revisar `android:allowBackup` antes de publicar.

2. Evolucion a multiples notas o historial.
   Recomendacion: mantener una nota principal en MVP y evaluar historial solo si aparece necesidad real.

3. Cuarentena de reconciliacion.
   Recomendacion: definir tiempos y visibilidad de cuarentena durante implementacion, manteniendo la regla de no borrar precipitadamente archivos finales sin metadatos.

## 30. Plan de implementacion

1. Crear tipos de dominio y puertos.
2. Crear migracion SQLite de notas y adjuntos.
3. Implementar repositorios.
4. Implementar adaptador de filesystem basado en `storageKey`.
5. Implementar casos de uso de Application.
6. Instalar y configurar `expo-image-picker` y `expo-document-picker` en bloque controlado.
7. Agregar reconciliacion y pruebas.
8. Integrar posteriormente en `Detalle del servicio`.
9. Extender a Expenses cuando exista.

## 31. Criterios de aceptacion arquitectonicos

1. No se modifican columnas de `trips` para notas o adjuntos.
2. No se crea tabla `services`.
3. `RecordOwnerType` es catalogo cerrado.
4. Una nota se asocia por `ownerType` + `ownerId`.
5. Nota vacia elimina nota existente y no persiste fila vacia.
6. Adjuntos se asocian por `ownerType` + `ownerId`.
7. `RecordAttachment.id` existe antes de copiar archivo.
8. Archivos se copian al almacenamiento interno administrado.
9. SQLite guarda `storageKey`, no URI absoluta.
10. SQLite guarda solo metadatos.
11. Fallos de adjuntos no bloquean guardados criticos.
12. Eliminar propietario no queda bloqueado por errores de filesystem.
13. Reconciliacion detecta `missing`, temporales y huerfanos con prudencia.
14. UI no accede directamente a SQLite ni filesystem.
15. UI nunca maneja rutas fisicas.
16. La arquitectura funciona offline.
17. El patron sirve para `registered_service` y `expense`.

## 32. Relacion con otros documentos

Relacionado con:

- `docs/architecture/Documentation Lifecycle v1.0.md`;
- `docs/architecture/GeoTaxi Operational Event Model v1.0.md`;
- `docs/architecture/Prioridad Operativa y Enriquecimiento de Datos v1.0.md`;
- `docs/architecture/Critical vs Enrichment Domain Data Review v1.0.md`;
- `docs/architecture/Application Layer v1.0.md`;
- `docs/architecture/Infrastructure Layer v1.0.md`;
- `docs/architecture/Persistence Layer v1.0.md`;
- `docs/architecture/Security Principles v1.0.md`;
- `docs/architecture/Project Structure v1.0.md`;
- `docs/design/Detalle del Servicio Registrado - Especificacion Funcional v1.0.md`.

Esta propuesta desarrolla la capacidad futura citada por `Detalle del servicio`, pero no modifica su especificacion funcional aprobada.
