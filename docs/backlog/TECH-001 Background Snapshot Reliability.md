# TECH-001 — Background Snapshot Reliability

## Estado

Pendiente

## Prioridad

Media

## Detectado durante

Corrección de las regresiones de operativa posteriores a la Arquitectura v1.0.

## Contexto

Para eliminar la latencia perceptible al iniciar un viaje se retiró la captura de geolocalización y el guardado del snapshot START del camino crítico de la operación.

La interfaz vuelve a responder inmediatamente, mejorando la experiencia de uso.

Actualmente la captura y persistencia del snapshot START se ejecutan en segundo plano.

## Motivo por el que no se implementa ahora

La prioridad absoluta de TaxiGeo es la operativa diaria.

La mejora de UX conseguida es más importante que convertir inmediatamente el procesamiento en segundo plano en un mecanismo completamente fiable.

No se desea introducir complejidad adicional durante la corrección de una regresión crítica.

## Riesgo conocido

Si la aplicación se cierra inmediatamente después de iniciar un viaje, existe la posibilidad de que el snapshot START no llegue a persistirse.

El viaje sí queda correctamente registrado.

El riesgo afecta únicamente a la captura del snapshot.

## Objetivo futuro

Diseñar un mecanismo general de tareas en segundo plano que permita ejecutar operaciones diferidas de forma fiable.

El sistema deberá garantizar:

- persistencia de tareas pendientes;
- reintentos cuando proceda;
- asociación inequívoca entre el viaje creado y su snapshot;
- independencia respecto a la velocidad de respuesta de la interfaz.

Este mecanismo deberá ser reutilizable para futuras operaciones asíncronas del proyecto.

## Decisión

Se acepta temporalmente este riesgo para priorizar la velocidad de la operativa diaria.

La incidencia queda registrada para ser abordada cuando se diseñe la infraestructura de procesamiento en segundo plano del proyecto.

## Observaciones

Esta incidencia no requiere ninguna acción inmediata y no bloquea el desarrollo ni la publicación de nuevas versiones.
