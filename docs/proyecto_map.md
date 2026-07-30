# Mapa del Proyecto - GeoTaxi

## Navegacion actual

```ts
app/_layout.tsx
app/(tabs)/_layout.tsx
app/(tabs)/index.tsx
app/(tabs)/summary.tsx
app/(tabs)/history.tsx
app/(tabs)/goals.tsx
app/(tabs)/settings.tsx
app/trip/new.tsx
app/trip/edit.tsx
```

## Bloque Metas actual

```ts
src/hooks/useGoalsScreen.ts
src/hooks/goalsScreenLoaders.ts
src/presentation/goals/GoalsProjection.ts
src/presentation/goals/GoalsScreenProjection.ts
src/infrastructure/runtime/AsyncStorageGoalStorage.ts
src/application/runtime/GoalService.ts
src/application/ports/runtime/goalStoragePort.ts
```

## Historia y jornada

```ts
src/application/history/HistoricalQueryService.ts
src/application/history/historicalPeriodResolvers.ts
src/application/history/historicalQueryTypes.ts
src/presentation/history/HistoryScreenProjection.ts
src/application/workdays/CloseWorkday.ts
src/infrastructure/persistence/repositories/SqliteWorkdayRepository.ts
src/domain/date-time/operationalWeek.ts
src/application/runtime/SummaryService.ts
```

## Persistencia relevante

```sql
workdays(goalPolicyId)
trip_geo_snapshots
record_notes
record_attachments
```

## GEO / Zonas especiales

```ts
src/application/trips/tripGeoEnrichment.ts
src/infrastructure/geocoding/engine/GeoAdministrativeResolver.ts
src/infrastructure/geocoding/catalog/specialZones.catalog.ts
src/infrastructure/geocoding/catalog/neighborhoods.catalog.ts
src/presentation/trips/TripEditProjection.ts
src/components/forms/NeighborhoodSelector.tsx
app/trip/edit.tsx  (sección "Ubicacion detectada")
```

Ver `docs/architecture/GEO Special Zones Resolver v1.0.md` para arquitectura completa e historial de bugs.

## Lecturas clave

- Metas es una pantalla de configuracion versionada append-only.
- Historial resuelve contexto historico por goalPolicyId o por la politica vigente de la jornada.
- Home y Resumen consumen la meta vigente para el progreso operativo.
- Metas 2.0 queda como bloque activo y certificado en la navegacion por tabs.
