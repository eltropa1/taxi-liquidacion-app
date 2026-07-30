# GEO Special Zones Resolver v1.0

> Estado: Approved

## 0. Propósito

Este documento describe la arquitectura del módulo de geolocalización administrativa de TaxiGeo (resolución de barrio, distrito y zona especial a partir de una coordenada GPS), el histórico de bugs encontrados y corregidos en 2026-07, y el catálogo de zonas especiales vigente.

No describe el dominio de negocio del viaje ni la persistencia del snapshot GEO (ver `docs/architecture/Critical vs Enrichment Domain Data Review v1.0.md` para eso).

## 1. Arquitectura

El módulo sigue el patrón puertos/adaptadores del resto del proyecto:

```
application/ports/runtime/geoLocationPort.ts              -> GeoLocationPort (interfaz)
application/ports/runtime/geoAdministrativeResolverPort.ts -> GeoAdministrativeResolverPort (interfaz)
application/ports/runtime/geoTypes.ts                      -> GeoLocationFix, GeoAddressSnapshot (tipos únicos)

infrastructure/runtime/ExpoGeoLocationPort.ts              -> implementación con expo-location
infrastructure/runtime/GeoAdministrativeResolverAdapter.ts -> adaptador fino sobre el motor

infrastructure/geocoding/engine/GeoAdministrativeResolver.ts -> motor de resolución (estático, sin estado)
infrastructure/geocoding/base/{neighborhoods,districts}.geo.ts -> geometrías oficiales (Ayuntamiento de Madrid)
infrastructure/geocoding/catalog/{neighborhoods,districts,specialZones}.catalog.ts -> catálogos id/nombre
```

El motor es **100% offline y determinista**: no llama a ninguna API externa, solo hace *point-in-polygon* (ray casting) contra geometrías embebidas en el bundle.

### 1.1. Prioridad de resolución

`GeoAdministrativeResolver.resolve(lat, lng)` calcula, en este orden:

1. **Zona especial** (`specialZone`) — prioridad más alta. Catálogo manual y acotado (aeropuertos, estaciones, hospitales...).
2. **Barrio** (`neighborhood`) — geometría oficial de los 131 barrios de Madrid.
3. **Distrito** (`district`) — derivado del barrio si existe; si no, resuelto por geometría propia (21 distritos).

Los tres campos son independientes: un punto dentro de una zona especial normalmente también tiene barrio y distrito asignados (la zona especial no los sustituye, los complementa).

### 1.2. Cuándo se dispara

`captureTripGeoEnrichment()` (`application/trips/tripGeoEnrichment.ts`) es el único punto de captura. Se invoca en modo *best-effort* (nunca bloquea el camino crítico de negocio) desde:

- `StartTrip.execute()` — snapshot `START`.
- `FinishTrip.execute()` — snapshot `END`.
- `CloseTrip.execute()` — snapshot `END`.

El resultado se persiste en la tabla `trip_geo_snapshots` (ver `SqliteTripGeoSnapshotRepository`).

### 1.3. Dónde se muestra

Pantalla de detalle del servicio registrado (`app/trip/edit.tsx`), sección **"Ubicación detectada"** → `GEO inicio` / `GEO fin`.

La etiqueta mostrada la calcula `resolveGeoZoneLabel()` (`presentation/trips/TripEditProjection.ts`), que prioriza `specialZone.name` sobre `neighborhood.name` sobre `district.name`.

La corrección manual (`Zona manual de recogida/destino`) usa `NeighborhoodSelector`, que desde esta versión lista también las zonas especiales (no solo barrios) — ver §4.

## 2. Historial de bugs corregidos (2026-07)

### 2.1. Coordenadas de zonas especiales incorrectas

Las coordenadas originales de T1, T2, T4 y la estación de Chamartín eran estimaciones a mano que no coincidían con las ubicaciones reales (verificado contra Wikipedia/fuentes GPS). En la práctica, T1, T4 y Chamartín tenían su punto real **fuera** de su caja delimitadora; T2 estaba dentro por un margen de ~200 m, fácilmente perdido por el ruido normal del GPS.

**Fix:** coordenadas re-verificadas por búsqueda web, cajas ensanchadas con margen de varios cientos de metros, y T1/T2/T3 fusionadas en una única zona (comparten edificio y viales de recogida; T4/T4S igual, comparten parada de taxi).

### 2.2. Bug estructural en `isPointInPolygon` (causa raíz real)

Incluso con las coordenadas corregidas, ninguna zona especial resolvía. La causa: `isPointInPolygon` decidía si `geometry` era un `GeoPolygon` (un único polígono, formato `anillo[]`) o un `GeoMultiPolygon` (`polígono[]`, donde cada polígono es `anillo[]`) mirando únicamente `geometry[0][0]`.

Ese valor es **siempre un array en ambos formatos** (una coordenada `[lng, lat]` en un `GeoPolygon`; un anillo completo en un `GeoMultiPolygon`), así que la comprobación nunca podía distinguir los dos casos — y trataba erróneamente cualquier `GeoPolygon` simple como si ya fuera un `GeoMultiPolygon`, corrompiendo la iteración del anillo (`polygon[0]` pasaba a ser una coordenada `[lng, lat]` en vez de un anillo, y `isPointInRing` recibía basura).

Los barrios y distritos nunca se vieron afectados porque sus geometrías (`neighborhoods.geo.ts`, `districts.geo.ts`) ya vienen en formato `GeoMultiPolygon` real (incluso para un único polígono). Las zonas especiales, en cambio, se definen como `GeoPolygon` simple (una sola caja, sin envolver en un nivel extra de polígono) — por eso el bug solo afectaba a `specialZone` y llevaba, en la práctica, **sin funcionar nunca**.

**Fix:** la comprobación de formato baja un nivel más (`geometry[0][0][0]`), que sí distingue correctamente ambos casos. Ver `GeoAdministrativeResolver.ts`, método `isPointInPolygon`.

### 2.3. La UI descartaba `specialZone`

Independientemente del bug anterior, la capa de presentación (`resolveTripEditSnapshotZones` en `TripEditProjection.ts`) solo leía `snapshot.neighborhood`, ignorando `specialZone` por completo. Aunque el motor resolviera la zona especial correctamente, la pantalla nunca la mostraba.

**Fix:** nueva función `resolveGeoZoneLabel()` que prioriza `specialZone.name` → `neighborhood.name` → `district.name`.

### 2.4. Duplicación de tipos

`GeoAddressSnapshot` estaba definido dos veces: en `application/ports/runtime/geoTypes.ts` (puerto de aplicación) y en `infrastructure/geocoding/models/GeoAddressSnapshot.ts` (interno del motor), estructuralmente compatibles pero no la misma fuente.

**Fix:** se eliminó la definición de infraestructura; el motor importa el tipo único desde la capa de aplicación, respetando la regla de dependencia (infraestructura puede depender de aplicación, nunca al revés).

## 3. Cobertura de test

`infrastructure/geocoding/engine/__tests__/GeoAdministrativeResolver.test.ts` fija, para cada zona especial del catálogo, que su coordenada real de referencia resuelve al `id` esperado. Incluye un test dedicado a la regresión de §2.2 (formato `GeoPolygon` simple sin envolver).

`presentation/trips/__tests__/TripEditProjection.test.ts` y `RegisteredServiceDetailProjection.test.ts` fijan que `specialZone` tiene prioridad sobre `neighborhood` en la etiqueta mostrada, y que la corrección manual resuelve tanto ids de barrio como de zona especial.

Antes de 2026-07 no existía ningún test para el motor de resolución ni para el catálogo de zonas especiales — es la razón por la que los bugs de §2.1 y §2.2 pasaron desapercibidos.

## 4. Catálogo vigente de zonas especiales

Todas las coordenadas de referencia están verificadas contra Wikipedia / fuentes GPS a fecha 2026-07. Las cajas se dimensionan con margen suficiente para tolerar el ruido normal del GPS, y se verificó por script que ninguna caja se solapa con otra.

| id | Nombre | Coordenada de referencia |
|---|---|---|
| `MAD_AIRPORT_T1_T2_T3` | Aeropuerto T1 / T2 / T3 | 40.4661, -3.5704 |
| `MAD_AIRPORT_T4` | Aeropuerto T4 / T4S | 40.4918, -3.5936 |
| `MAD_ATOCHA` | Estación de Atocha | 40.4065, -3.6893 |
| `MAD_CHAMARTIN` | Estación de Chamartín | 40.4721, -3.6827 |
| `MAD_NUEVOS_MINISTERIOS` | Nuevos Ministerios | 40.4466, -3.6925 |
| `MAD_PRINCIPE_PIO` | Estación de Príncipe Pío | 40.4211, -3.7204 |
| `MAD_IFEMA` | IFEMA | 40.4678, -3.6172 |
| `MAD_HOSPITAL_LA_PAZ` | Hospital La Paz | 40.4809, -3.6874 |
| `MAD_HOSPITAL_GREGORIO_MARANON` | Hospital Gregorio Marañón | 40.4195, -3.6712 |
| `MAD_HOSPITAL_12_OCTUBRE` | Hospital 12 de Octubre | 40.3762, -3.6985 |
| `MAD_HOSPITAL_RAMON_Y_CAJAL` | Hospital Ramón y Cajal | 40.4872, -3.6939 |

Fuente: `infrastructure/geocoding/catalog/specialZones.catalog.ts`.

### Ampliación futura

El catálogo es manual y acotado por diseño — no hay ningún proceso automático que lo mantenga sincronizado con nuevas ubicaciones. Añadir una zona nueva requiere: coordenada real verificada, caja con margen razonable, y comprobación de que no se solapa con las cajas existentes (puede hacerse con un script ad-hoc como el usado en 2026-07, o extendiendo el test de `GeoAdministrativeResolver.test.ts`).
