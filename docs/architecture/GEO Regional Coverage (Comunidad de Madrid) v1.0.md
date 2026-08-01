# GEO Regional Coverage (Comunidad de Madrid) v1.0

> Estado: Approved

## 0. Propósito

Este documento describe la ampliación de cobertura GEO más allá del municipio de Madrid: resolución a nivel de **municipio** para el resto de la Comunidad de Madrid, y la decisión de arquitectura tomada para poder escalar esa misma idea a España entera sin cambiar de modelo.

Complementa `docs/architecture/GEO Special Zones Resolver v1.0.md`, que sigue siendo la referencia para zonas especiales, barrio y distrito dentro de la capital.

## 1. Motivación

Antes de esta versión, el motor GEO (`GeoAdministrativeResolver`) solo sabía resolver barrio y distrito dentro del municipio de Madrid. Un viaje con origen o destino en cualquier otro municipio de la Comunidad (Torrejón de Ardoz, Getafe, Alcalá de Henares...) quedaba sin ninguna zona resuelta (`neighborhood`, `district` y `specialZone` todos vacíos).

Se decidió cubrir el resto de la Comunidad de Madrid **a nivel de municipio, sin detalle de barrio**: es la granularidad que aporta valor real para un taxímetro sin disparar el coste de mantener 179 catálogos de barrio adicionales. Si en el futuro se necesita detalle de barrio en un municipio concreto (p. ej. si empiezan a operar sistemáticamente en Torrejón de Ardoz), se añade ese municipio de la misma forma en que ya está Madrid capital — sin rehacer nada de lo existente.

## 2. Fuente de datos

[`es-atlas`](https://github.com/martgnz/es-atlas) (martgnz, CC-BY 4.0), que procesa y publica en TopoJSON las líneas límite municipales oficiales del **Instituto Geográfico Nacional (IGN)**. A diferencia del repositorio predecesor `martgnz/municipios` (deprecado y sin metadatos: geometrías sin nombre ni código), `es-atlas` incluye para cada municipio su código INE y nombre oficial.

Se descargó `es/municipalities.json` (topología nacional completa, 8.213 municipios, 1,8 MB), se filtraron los 179 municipios cuyo código INE empieza por `28` (provincia de Madrid) y se decodificaron sus arcos a coordenadas `[lng, lat]` con `topojson-client` (usado solo como herramienta de conversión puntual, no es una dependencia de la app).

**Atribución requerida por la licencia CC-BY 4.0:** © Instituto Geográfico Nacional de España — ver cabecera de `municipalities.geo.ts`.

## 3. Resultado

`infrastructure/geocoding/base/municipalities.geo.ts` — 179 municipios de la Comunidad de Madrid (incluida la capital, id `28079`), **56 KB**. Cada entrada: `{ id, name, geometry }`, mismo formato `GeoMultiPolygon` que barrios y distritos.

`infrastructure/geocoding/catalog/municipalities.catalog.ts` — catálogo id/nombre derivado directamente de la geometría (no duplicado a mano), más una lista ordenada para UI.

## 4. Integración en el resolver

`GeoAdministrativeResolver.resolve()` añade un cuarto nivel de resolución, **solo como respaldo**:

```
1. Zona especial   (siempre se intenta)
2. Barrio          (solo capital)
3. Distrito        (derivado del barrio, o resuelto directo si no hay barrio)
4. Municipio       (solo si NO hay barrio NI distrito)
```

Dentro de la capital, barrio y distrito ya dan el nivel de detalle equivalente o mejor, así que el municipio no se resuelve ahí (evita recorrer 179 polígonos en el caso más frecuente, que es un viaje dentro de Madrid capital).

`GeoAddressSnapshot.municipality` es el nuevo campo opcional (`application/ports/runtime/geoTypes.ts`).

### 4.1. UI

- `resolveGeoZoneLabel()` (`presentation/trips/TripEditProjection.ts`): prioridad `specialZone → neighborhood → district → municipality`.
- Corrección manual (`NeighborhoodSelector`): la lista de zonas seleccionables ahora incluye, además de zonas especiales y barrios, los 178 municipios de la Comunidad de Madrid distintos de la propia capital (Madrid capital ya está representada por sus barrios).
- `resolveEffectiveNeighborhoodName()` busca el id en los tres catálogos (barrio, zona especial, municipio).

## 5. Rendimiento

El caso más costoso (punto fuera de la capital: recorre los 131 barrios y 21 distritos sin match antes de caer a los 179 municipios) se midió en **~0,175 ms de media** por resolución. `captureTripGeoEnrichment()` ya ejecuta esto de forma asíncrona y best-effort, sin bloquear el camino crítico — el coste es irrelevante en cualquier escenario real.

## 6. Decisión de arquitectura: escalar a España entera

Surgió la pregunta de si cubrir toda España exigiría cambiar de modelo (por ejemplo, pasar de datos embebidos a una API de geocodificación externa) para no penalizar el peso o la velocidad de la app.

**Investigación:** la misma fuente (`es-atlas`) publica los 8.213 municipios de España completos en un único fichero de **1,8 MB** (TopoJSON). Convertido al formato interno de la app (mismo proceso que para Madrid), el resultado sería del orden de **2,7 MB** — trivial para el tamaño de bundle de una app móvil, y sigue permitiendo resolución 100% offline, determinista y sin coste por petición.

**Decisión: no hace falta cambiar de modelo.** El patrón embebido + ray casting escala a nivel nacional sin más que:

1. Repetir exactamente el proceso de este documento con el fichero completo de `es-atlas` en vez de filtrar solo por provincia `28`.
2. Mantener el barrio/distrito de detalle fino solo donde aporte valor real (hoy: Madrid capital), ampliable ciudad a ciudad bajo demanda — igual que ya se hizo aquí con la Comunidad de Madrid.

**Se descarta** una API de geocodificación externa (Google, Mapbox, Nominatim...) para este caso de uso: introduciría dependencia de red, latencia, coste por petición y pérdida de determinismo, sin resolver ningún problema real que el modelo actual no resuelva ya a este tamaño de datos.

**No se implementa todavía la cobertura nacional completa** porque no hay una necesidad operativa actual fuera de la Comunidad de Madrid. Queda registrada como decisión tomada y camino conocido, no como trabajo pendiente urgente — ver `docs/backlog/TECH-002 GEO Special Zones Catalog Coverage.md` para el criterio de cuándo ampliar.

## 7. Cobertura de test

`infrastructure/geocoding/engine/__tests__/GeoAdministrativeResolver.test.ts` fija, con 4 municipios verificados (Torrejón de Ardoz, Getafe, Alcalá de Henares, Móstoles), que la coordenada real resuelve al municipio esperado y que barrio/distrito quedan vacíos fuera de la capital. También fija que un punto dentro de la capital (Sol) no resuelve municipio.

`presentation/trips/__tests__/TripEditProjection.test.ts` fija la prioridad de etiqueta (`municipality` solo aparece cuando no hay barrio) y la resolución manual de un id de municipio.
