# GeoTaxi Operational Loop v1.0

## Objetivo del documento

GeoTaxi no se diseña alrededor de pantallas.

Se diseña alrededor del ciclo de trabajo real de un taxista.

La Home V2 representa visualmente ese ciclo operativo.

---

## Concepto

Durante una jornada el taxista repite decenas de veces el mismo patrón mental.

GeoTaxi debe adaptarse a ese patrón.

Nunca obligar al taxista a adaptarse a la aplicación.

---

## El Operational Loop

El ciclo operativo completo es el siguiente:

### 1. Orientación

Responder inmediatamente:

- ¿Qué día es?
- ¿Qué fecha es?
- ¿La jornada está abierta?
- ¿Existe un viaje activo?

---

### 2. Acción

Responder:

¿Qué debo hacer ahora?

Mostrar una única acción principal.

Ejemplos:

- Abrir jornada.
- Iniciar viaje.
- Finalizar viaje.

---

### 3. Decisión

Responder:

¿Cómo voy hoy?

Aquí vive el estado económico operativo.

- Objetivo.
- Recaudación.
- Progreso.
- Porcentaje.
- Diferencia restante.

Este bloque existe para ayudar a tomar decisiones.

No para mostrar estadísticas.

---

### 4. Control

Responder:

¿Todo está bajo control?

Aquí viven:

- Servicios.
- Efectivo.
- Tarjeta.
- App.
- Propinas.
- Plataformas.

Este bloque verifica la operación.

No dirige la siguiente acción.

---

### 5. Registro Operativo

Responder:

¿Qué acaba de ocurrir?

Este bloque cumple dos funciones:

- Registro vivo de la jornada.
- Confirmación inmediata de que la operación se ha realizado correctamente.

Diferenciar claramente este Registro Operativo del Historial Histórico de la aplicación.

---

## Regreso al ciclo

Al terminar cualquier operación el usuario debe volver automáticamente al inicio del Operational Loop.

Ejemplo:

Finalizar viaje

↓

Guardar

↓

Home actualizada

↓

Nuevo estado

↓

Nueva acción disponible

No mostrar pantallas intermedias innecesarias.

No romper el flujo.

---

## Principios fundamentales

- El ciclo nunca debe romperse.
- La Home es un Panel de Decisión Operativa.
- Cada bloque responde una única pregunta.
- Cada bloque tiene una única responsabilidad.
- El usuario nunca debe perder el contexto.
- La siguiente acción siempre debe ser evidente.
- La interfaz debe desaparecer y dejar protagonismo al trabajo.
- El Operational Loop tiene prioridad sobre la organización técnica del software.

---

## Baseline de referencia

La Home V2 aprobada es la manifestación visual y arquitectónica oficial del Operational Loop.

Su jerarquía de lectura queda fijada como referencia del producto:

1. Contexto Operativo.
2. Progreso de la Jornada.
3. Acción Principal.
4. Registro Operativo.

Cualquier evolución futura debe mantener este ciclo operativo y documentar explícitamente cualquier cambio aprobado.

---

## Consecuencias para el diseño futuro

Cualquier nueva funcionalidad deberá responder primero:

¿Interviene dentro del Operational Loop?

Si la respuesta es sí:

Se integra respetando el ciclo.

Si la respuesta es no:

Debe vivir fuera de la Home.

---

## Relación con otros documentos

Este documento complementa:

- GeoTaxi Interaction Principles v1.0
- GeoTaxi UX Architecture v1.0
- Las investigaciones de `docs/design/research/`

No los sustituye.

---

## Estado

Estado actual:

🟢 Aprobado

Documento fundacional del sistema de diseño de GeoTaxi.
