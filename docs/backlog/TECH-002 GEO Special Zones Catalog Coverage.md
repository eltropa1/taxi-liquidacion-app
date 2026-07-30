# TECH-002 — GEO Special Zones Catalog Coverage

## Estado

Pendiente

## Prioridad

Baja

## Detectado durante

Corrección del bug de detección de zonas especiales GEO (2026-07). Ver `docs/architecture/GEO Special Zones Resolver v1.0.md`.

## Contexto

El catálogo de zonas especiales (`infrastructure/geocoding/catalog/specialZones.catalog.ts`) es manual y acotado por diseño: cada zona requiere una coordenada real verificada y una caja delimitadora sin solapes con las existentes.

A fecha 2026-07 cubre 11 zonas: aeropuerto (T1/T2/T3, T4/T4S), dos estaciones de tren (Atocha, Chamartín), un intercambiador (Nuevos Ministerios), otra estación (Príncipe Pío), IFEMA y cuatro hospitales (La Paz, Gregorio Marañón, 12 de Octubre, Ramón y Cajal).

## Motivo por el que no se implementa ahora

No hay una lista cerrada de "todos los puntos de recogida frecuentes" — depende del uso real del taxista. Añadir zonas sin esa señal sería adivinar necesidades en vez de responder a ellas.

## Riesgo conocido

Ninguno funcional: si un punto no está en el catálogo, simplemente se resuelve como barrio/distrito (comportamiento normal, no un error).

## Objetivo futuro

Ampliar el catálogo cuando el usuario identifique puntos de recogida frecuentes no cubiertos. El procedimiento ya está probado:

1. Verificar la coordenada real (fuente fiable, no estimación a mano).
2. Definir una caja con margen suficiente para el ruido normal del GPS.
3. Comprobar que no se solapa con ninguna caja existente.
4. Añadir el caso al test `GeoAdministrativeResolver.test.ts`.

## Decisión

Se deja el catálogo abierto a ampliación bajo demanda. No bloquea desarrollo ni publicación.

## Observaciones

Esta incidencia no requiere ninguna acción inmediata.
