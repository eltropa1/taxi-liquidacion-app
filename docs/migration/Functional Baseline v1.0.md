# Functional Baseline v1.0

## Alcance

Este documento describe únicamente el comportamiento observable para el usuario en el prototipo actual de TaxiGeo 1.0.

No recoge detalles de implementación, arquitectura ni persistencia. Su objetivo es fijar la paridad funcional mínima que debe conservarse durante la migración.

## Convenciones

- `Estado actual`: cómo se presenta hoy la funcionalidad.
- `Mantener igual`: si el comportamiento visible debe conservarse tal cual durante la migración.
- `Prioridad`: `Alta`, `Media` o `Baja` según impacto operativo.

## Pantallas

| Pantalla | Ruta | Estado actual | Comportamiento observable | Prioridad | Mantener igual |
|---|---|---|---|---|---|
| Arranque | Inicio de app | Activa | La app muestra un indicador de carga hasta que puede continuar. | Alta | Sí |
| Hoy / liquidación diaria | `/` | Activa | Es la pantalla principal. Muestra estado del día, viajes del día, metas, resúmenes y acciones principales. | Alta | Sí |
| Metas | `/goals` | Activa | Permite ver y editar metas diarias, semanales y mensuales. | Alta | Sí |
| Edición de viaje | `/trip/edit` | Activa | Permite revisar y corregir un viaje existente. | Alta | Sí |
| Nuevo viaje | `/trip/new` | Placeholder | Solo muestra el texto `NUEVO VIAJE`. | Baja | Sí |
| Resumen | `/summary` | Placeholder | Solo muestra el texto `app-summary-index`. | Baja | Sí |
| Detalle de resumen | `/summary/detail` | Placeholder | Solo muestra el texto `app-summary-detail`. | Baja | Sí |
| Configuración | `/settings` | Placeholder | Solo muestra el texto `app-settings-index`. | Baja | Sí |

## Navegación

- La app arranca en la pantalla principal.
- La pantalla principal permite ir a `Metas`.
- La pantalla principal permite abrir la edición de un viaje tocando un viaje finalizado del historial.
- La pantalla principal permite abrir el flujo de finalización o de alta manual de viaje en un modal.
- La pantalla de metas permite volver atrás.
- La pantalla de edición de viaje permite volver atrás.
- Las pantallas `Nuevo viaje`, `Resumen`, `Detalle de resumen` y `Configuración` no tienen acceso visible desde la navegación principal actual.
- No hay barra inferior, menú lateral ni navegación por pestañas visible.

## Flujos De Usuario

### 1. Inicio de jornada

- El usuario abre la app.
- Ve el estado del día de trabajo.
- Si no hay jornada abierta, la pantalla le indica que abra una.
- Si hay jornada abierta, puede iniciar viajes.
- Al abrir una jornada, la app la considera activa para registrar viajes.

### 2. Registro de un viaje en curso

- Con una jornada abierta, el usuario pulsa `Iniciar viaje`.
- El viaje pasa a estado activo.
- Mientras el viaje está activo, la acción principal cambia a `Finalizar viaje`.

### 3. Finalización de un viaje

- Con un viaje activo, el usuario pulsa `Finalizar viaje`.
- La app abre un modal con importe, forma de pago y tipo de viaje.
- El modal recuerda la última forma de pago y el último tipo de viaje usados como valores iniciales.
- Al guardar, el viaje queda cerrado y aparece en el historial del día.

### 4. Alta manual de viaje

- El usuario pulsa `Añadir viaje manual`.
- La app abre el mismo modal de edición/fin con valores iniciales vacíos y hora actual.
- El usuario puede completar importe, pago y tipo de viaje.

### 5. Edición de viaje existente

- El usuario toca un viaje cerrado del historial.
- La app abre la pantalla de edición.
- El usuario puede corregir horas, importes, forma de pago, tipo de viaje y zonas manuales.

### 6. Consulta de métricas

- En la pantalla principal el usuario puede desplegar el detalle diario, las metas y el resumen semanal/mensual.
- El usuario puede cambiar la fecha con flechas día a día.

### 7. Exportación

- El usuario pulsa `Exportar viajes (CSV)`.
- La app genera un CSV con todos los viajes y abre la hoja de compartir del sistema.

## Reglas De Negocio Observables

- Solo se puede iniciar un viaje si hay una jornada abierta.
- Solo puede existir una jornada abierta a la vez.
- Una jornada puede cruzar medianoche.
- Las jornadas se cierran manualmente.
- El historial del día muestra viajes ordenados del más reciente al más antiguo.
- Un viaje en curso no es editable desde el historial.
- Las metas de importe pueden estar vacías y entonces se interpretan como `0`.
- Los importes admiten coma decimal en los campos visibles.
- El progreso de metas se oculta cuando la meta es `0`.
- Si no hay datos para una jornada o fecha, la app muestra totales a cero y estado vacío.
- En los resúmenes, las propinas se muestran separadas de la recaudación principal.
- Un viaje de tarjeta puede registrar un importe cobrado distinto del importe base.
- Un viaje en efectivo puede registrar una propina implícita como diferencia entre lo cobrado y el importe base.
- Un viaje de app se trata como pago no en efectivo en los resúmenes visibles.
- La selección de fecha no está limitada a fechas pasadas; el usuario puede avanzar o retroceder un día por pulsación.
- La app permite cerrar una jornada aunque exista un viaje activo; si eso ocurre, la acción principal de la pantalla desaparece hasta que se vuelva a abrir una jornada.

## Matriz Funcional

| Funcionalidad | Estado actual | Comportamiento observable | Prioridad | Mantener igual |
|---|---|---|---|---|
| Indicador de arranque | Activo | La app no muestra la pantalla principal hasta que termina la preparación inicial. | Alta | Sí |
| Estado de jornada | Activo | La pantalla principal muestra si hay jornada abierta y el inicio de esa jornada. | Alta | Sí |
| Abrir jornada | Activo | El usuario confirma la acción y la jornada queda abierta para registrar viajes. | Alta | Sí |
| Cerrar jornada | Activo | El usuario confirma la acción y la jornada queda cerrada; la pantalla deja de ofrecer la acción principal aunque exista un viaje activo. | Alta | Sí |
| Iniciar viaje | Activo | Solo aparece cuando hay jornada abierta y no hay viaje activo. | Alta | Sí |
| Finalizar viaje | Activo | Solo aparece cuando hay jornada abierta y existe un viaje activo. | Alta | Sí |
| Alta manual de viaje | Activo | Abre un modal para registrar un viaje sin depender de un viaje activo previo. | Alta | Sí |
| Edición de viaje | Activo | Permite corregir un viaje ya registrado. | Alta | Sí |
| Borrado de viaje | Activo | El usuario puede borrar un viaje desde la pantalla de edición tras confirmación. | Alta | Sí |
| Historial de viajes | Activo | Muestra los viajes de la fecha seleccionada o el estado vacío si no hay viajes. | Alta | Sí |
| Tocar viaje del historial | Activo | Solo los viajes cerrados abren la pantalla de edición. | Alta | Sí |
| Resumen diario | Activo | Muestra totales por plataforma, por tipo de pago y propinas del día. | Alta | Sí |
| Resumen semanal | Activo | Muestra total y desglose semanal cuando se despliega. | Media | Sí |
| Resumen mensual | Activo | Muestra total y desglose mensual cuando se despliega. | Media | Sí |
| Progreso de metas | Activo | Muestra estado textual, porcentaje y cantidad restante cuando la meta es mayor que cero. | Media | Sí |
| Metas económicas | Activo | Permite editar metas diarias, semanales y mensuales y conservarlas para sesiones posteriores. | Alta | Sí |
| Exportación CSV | Activo | Genera un CSV y abre compartir del sistema. | Media | Sí |
| Geolocalización en inicio de viaje | Activo | Al iniciar un viaje puede capturarse la ubicación sin bloquear el arranque visible. | Media | Sí |
| Geolocalización en fin de viaje | Activo | Al finalizar un viaje se intenta capturar la ubicación antes de cerrar la operación. | Media | Sí |
| Zonas automáticas | Activo | En edición se muestra una zona detectada automáticamente para recogida y destino si existe. | Media | Sí |
| Zonas manuales | Activo | En edición se puede cambiar la zona de recogida y la de destino mediante un selector. | Media | Sí |
| Selector de barrio | Activo | Incluye búsqueda por texto y selección de barrios del catálogo. | Media | Sí |
| Voz | Inexistente en UI | No hay acción visible, pantalla ni control de voz para el usuario. | Baja | No aplica |
| Estadísticas GEO por barrio/distrito | No expuesto | No hay pantalla visible para estas estadísticas; no forman parte del flujo actual del usuario. | Baja | No aplica |
| Pantalla nuevo viaje | Placeholder | Solo muestra un texto de marcador. | Baja | Sí |
| Pantalla resumen | Placeholder | Solo muestra un texto de marcador. | Baja | Sí |
| Pantalla detalle de resumen | Placeholder | Solo muestra un texto de marcador. | Baja | Sí |
| Pantalla configuración | Placeholder | Solo muestra un texto de marcador. | Baja | Sí |
| Soporte de tipo de viaje personalizado | Latente | Existe soporte de datos, pero no hay control visible para elegirlo en el flujo principal actual. | Baja | No aplica |
| Soporte de voz / dictado | Latente | Hay un servicio no expuesto al usuario en el estado actual. | Baja | No aplica |

## Pantallas Placeholder

- `Nuevo viaje`: muestra `NUEVO VIAJE`.
- `Resumen`: muestra `app-summary-index`.
- `Detalle de resumen`: muestra `app-summary-detail`.
- `Configuración`: muestra `app-settings-index`.

## Funcionalidades Incompletas

- No existe un flujo real de `Nuevo viaje` como pantalla dedicada.
- No existe una vista funcional de `Resumen` ni de `Detalle de resumen`.
- No existe una pantalla funcional de `Configuración`.
- No existe entrada visible para voz.
- No existe un flujo visible para tipo de viaje personalizado desde la pantalla principal.
- No existe una vista visible de estadísticas GEO por barrio o distrito.

## Funcionalidades Experimentales

- Captura GEO de inicio y fin de viaje.
- Resolución automática de barrio y distrito a partir de la posición.
- Selector manual de barrio en edición de viaje.
- Medición de propinas separadas por tarjeta y efectivo.

## Errores Conocidos

- Si falla la preparación inicial, la app puede quedarse en la pantalla de carga.
- Si no se encuentra un viaje al abrir la edición, aparece un aviso y la app vuelve atrás.
- Si la hora de inicio o fin no tiene formato `HH:mm`, la edición avisa de forma explícita.
- Si la hora de fin es anterior a la de inicio, la edición avisa y no guarda.
- Si el importe cobrado de tarjeta es menor que el importe del viaje, la edición avisa y no guarda.
- Si el importe cobrado en efectivo es menor que el importe del viaje, la edición avisa y no guarda.
- Si se deniega la localización al finalizar un viaje, la operación puede fallar.
- Si no hay datos para una fecha, el usuario ve totales vacíos o cero en lugar de un error.

## Criterio De Paridad

- Debe mantenerse exactamente igual todo lo que el usuario puede ver y hacer hoy en las pantallas activas.
- Los placeholders deben conservar el mismo comportamiento visible hasta que exista una decisión funcional explícita para reemplazarlos.
- Las capacidades latentes o no expuestas no forman parte de la paridad visible, pero no deben introducirse como si ya fueran producto terminado.
