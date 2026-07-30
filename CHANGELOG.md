# Changelog
Todos los cambios relevantes de la aplicación **Taxi Liquidación** se documentan en este archivo.

El formato sigue una versión simplificada de *Keep a Changelog*  
y el versionado es semántico.


---
## [1.0.6] - 2026-07-30
### Fixed
fix(geo): make special zone detection actually work

- Zonas especiales (aeropuerto T1/T2/T3, T4/T4S, estaciones, hospitales)
  nunca se detectaban en la práctica: `isPointInPolygon` distinguía
  formato `GeoPolygon` de `GeoMultiPolygon` mirando `geometry[0][0]`,
  que es siempre un array en ambos casos. Corregido comprobando un
  nivel más de profundidad (`geometry[0][0][0]`).
- Coordenadas de T1, T2, T4 y Chamartín corregidas (estaban fuera o al
  borde de su caja delimitadora); T1/T2/T3 fusionadas en una zona
  (comparten edificio/viales), T4/T4S igual (comparten parada de taxi).
- La pantalla de detalle del servicio ("GEO inicio"/"GEO fin") ignoraba
  el campo `specialZone` del snapshot y solo mostraba el barrio.
  Corregido: la zona especial tiene ahora prioridad en la etiqueta.
- La corrección manual de zona ahora también permite elegir una zona
  especial, no solo un barrio.
- Catálogo ampliado con Nuevos Ministerios, Príncipe Pío, y los
  hospitales La Paz, Gregorio Marañón, 12 de Octubre y Ramón y Cajal.
- Eliminada la duplicación del tipo `GeoAddressSnapshot` entre
  aplicación e infraestructura.
- Añadidos tests de regresión para el motor de resolución GEO (no
  existía ninguno) y para la proyección de UI.
- Ver `docs/architecture/GEO Special Zones Resolver v1.0.md`.

### Fixed
fix(persistence): stop Fast Refresh from opening a second SQLite connection

- `getDatabase()` y `initializePersistenceDatabase()` guardaban su
  estado en variables de módulo, que Fast Refresh reinicia sin cerrar
  la conexión nativa previa, produciendo `database is locked`.
- Anclado a `globalThis` (sobrevive a la recarga de JS) y activado
  `PRAGMA journal_mode = WAL;` para mayor tolerancia general.
- Ver `docs/persistence/SQLite Connection Lifecycle v1.0.md`.

---
## [1.0.5] - 2026-03-01
### Added
feat(stats): align monthly summary with active workday month

- Monthly summary no longer depends solely on natural calendar month.
- If a workday is open, monthly statistics are anchored to the month
  of the workday startTime.
- If no workday is open, the current natural month is used.
- No changes to data model, trips, or aggregation logic.
- Maintains separation between date utils (pure) and domain logic (SummaryService).

This prevents month rollover from hiding statistics of an open workday
that belongs to the previous month.

---
## [1.0.5] - 2026-02-11
### Added
FASE 1 + FASE 2 COMPLETADAS

- Añadido campo workdayId al modelo Trip (nullable en esta fase).
- Añadida columna workdayId a la tabla trips (INTEGER, nullable).
- Integrada migración histórica en runMigrations().

Migración FASE 2:
- Detecta trips con workdayId IS NULL.
- Agrupa por día natural (YYYY-MM-DD).
- Crea workdays retrospectivos cerrados por cada día.
- Asigna workdayId a todos los trips correspondientes.
- Idempotente (solo afecta registros NULL).
- Usa last_insert_rowid() para obtener ID seguro.
- No modifica fechas, importes ni lógica de negocio.

Se elimina método temporal migrateTripsWithoutWorkday()
para evitar duplicación de lógica.

El sistema queda estructuralmente coherente
desde el primer viaje histórico hasta el presente.

---

## [1.0.0] - 2026-01-07
### Added
- Base funcional de la aplicación para uso diario del taxi.
- Registro de viajes con origen, destino, importe y forma de pago.
- Cierre de jornada con cálculo automático.
- Gestión de propinas e incentivos separados de la recaudación.
- Exportación de datos para revisión y control.

### Fixed
- Corrección en el cálculo de semanas y días de trabajo.
- Ajustes en la persistencia de datos para evitar inconsistencias.
- Correcciones menores de estabilidad en el flujo diario.

