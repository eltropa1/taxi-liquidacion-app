# GeoTaxi UX Architecture v1.0

## 1. Objetivo

Este documento transforma los `Interaction Principles` en una arquitectura de experiencia de usuario para GeoTaxi.

La UX de GeoTaxi se diseña alrededor de las decisiones que toma un taxista durante su jornada, no alrededor de las funcionalidades de la aplicación.

---

## 2. Metodología oficial de diseño

Toda pantalla de GeoTaxi debe diseñarse siguiendo este orden obligatorio:

1. Interaction Principles
2. UX Architecture
3. Wireframes
4. Validación UX
5. Sistema UI
6. Mockups de alta fidelidad
7. Implementación

Ninguna pantalla debe implementarse sin disponer previamente de wireframes aprobados.

---

## 3. Principio fundamental

La Home de GeoTaxi no es un panel de indicadores.

Es un panel de decisiones.

Toda la información mostrada debe ayudar al taxista a tomar su siguiente decisión durante la jornada.

---

## 4. Decisiones principales del taxista

La arquitectura UX debe responder, como mínimo, a estas decisiones principales:

### ¿Puedo empezar a trabajar?

Decisión asociada: abrir jornada.

Información necesaria:

- estado actual de la jornada;
- acceso claro a la acción de apertura;
- confirmación de que el sistema está listo para operar;
- ausencia de bloqueos operativos.

---

### ¿Qué debo hacer ahora?

Decisiones asociadas:

- iniciar viaje;
- finalizar viaje;
- cerrar jornada.

Información necesaria:

- estado operativo actual;
- acción principal disponible;
- contexto inmediato de la jornada;
- señales claras sobre qué acciones están activas y cuáles no.

---

### ¿Cómo voy hoy?

Decisiones asociadas:

- objetivo;
- recaudación;
- progreso.

Información necesaria:

- referencia visible del objetivo del día;
- acumulado actual;
- comparación suficiente para entender el avance;
- lectura rápida del estado general de la jornada.

---

### ¿Qué acabo de hacer?

Decisión asociada: historial operativo.

Información necesaria:

- última acción realizada;
- registro reciente de movimientos;
- confirmación visual de actividad reciente;
- acceso claro al detalle histórico cuando sea necesario.

---

### ¿Necesito corregir algo?

Decisiones asociadas:

- editar;
- añadir viaje manual;
- revisar jornada.

Información necesaria:

- acceso rápido a correcciones permitidas;
- identificación de elementos editables;
- contexto suficiente para evitar errores;
- claridad sobre el alcance de cada corrección.

---

## 5. Clasificación de la información

La información de GeoTaxi se divide en dos categorías.

### Información operativa

Es la información que el taxista consulta de forma continua durante la jornada.

Pertenece a esta categoría todo lo necesario para decidir qué hacer ahora.

Esta es la única información que debe vivir en la Home.

### Información de consulta

Incluye:

- estadísticas;
- histórico;
- análisis;
- configuración;
- y cualquier otro contenido no necesario para la decisión inmediata.

Esta información no pertenece a la Home.

Debe vivir en pantallas o secciones específicas de consulta.

---

## 6. Roadmap UX

La evolución de UX de GeoTaxi seguirá estas fases pendientes:

### Fase 1

Diseño de wireframes de todos los estados operativos.

### Fase 2

Validación UX.

### Fase 3

Sistema UI.

### Fase 4

Mockups de alta fidelidad.

### Fase 5

Implementación.

---

## 7. Próximo trabajo

El siguiente documento oficial será:

`GeoTaxi Wireframes v1.0`

Ese documento contendrá exclusivamente los wireframes funcionales de todos los estados operativos.
