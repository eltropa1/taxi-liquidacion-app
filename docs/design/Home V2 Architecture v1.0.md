# Home V2 Architecture v1.0

## 1. Propósito

Este documento define la arquitectura oficial de la Home V2 de GeoTaxi.

La Home es el Centro Operativo del Taxista.

No es un dashboard.

No es una pantalla de estadísticas.

No es una pantalla de inicio.

Refleja el trabajo del taxista.

No dirige el trabajo.

---

## 2. Filosofía General

- La estructura permanece estable.
- Cada bloque responde una única pregunta.
- Cada bloque tiene una única responsabilidad.
- La información primaria nunca se sacrifica por información secundaria.

---

## 3. Estados

La Home tiene dos modos principales.

### Jornada cerrada

Este estado se menciona en este documento únicamente.

Su desarrollo completo quedará documentado en una versión posterior.

### Jornada abierta

Este documento define completamente este estado.

Es el estado operativo normal de la Home.

---

## 4. Arquitectura oficial de la Jornada abierta

La Home abierta está compuesta por cinco bloques, en este orden:

1. Barra de Contexto Operativo.
2. Progreso de la Jornada.
3. Acción Principal.
4. Registro Operativo.
5. Navegación inferior.

---

### 4.1 Barra de Contexto Operativo

**Responsabilidad**

Responder únicamente a la pregunta: "¿En qué contexto operativo estoy?"

No responde:

- ¿Cómo voy?
- ¿Qué debo hacer ahora?
- ¿Qué acaba de ocurrir?

Esas preguntas pertenecen a otros bloques.

**Contenido aprobado**

- Fecha operativa.
- Hora de inicio de la jornada.

**Estructura**

Una única fila horizontal.

Distribución:

- Fecha operativa alineada a la izquierda.
- Hora de inicio alineada a la derecha precedida por el texto `Inicio`.

**Reglas de diseño**

- La barra mantiene siempre la misma altura.
- Utiliza únicamente la altura mínima necesaria.
- No contiene títulos.
- No contiene iconografía.
- No contiene tarjetas.
- No contiene separadores decorativos.
- No contiene información económica.
- No contiene información del viaje.
- No contiene indicadores redundantes.
- No compite visualmente con el bloque Progreso de la Jornada.

**Objetivo visual**

- Proporcionar orientación inmediata.
- Transmitir calma operativa.
- Permanecer visualmente silenciosa.
- Desaparecer frente al contenido principal de la Home.

---

### 4.2 Progreso de la Jornada

**Pregunta que responde**

¿Cómo voy hoy?

**Responsabilidad**

Permitir conocer inmediatamente el estado económico de la jornada.

**Arquitectura interna aprobada**

**Zona izquierda** `aprox. 1/3`

- Recaudación acumulada.

Debe ser el elemento visual más importante de toda la Home.

**Zona derecha** `aprox. 2/3`

- Objetivo.
- Importe restante.
- Barra de progreso.

**Reglas**

- Utiliza únicamente la altura mínima necesaria.
- No incluye estadísticas secundarias.

---

### 4.3 Acción Principal

**Pregunta que responde**

¿Qué acción puedo realizar ahora?

Este documento desarrolla únicamente la arquitectura de la Home cuando la jornada está abierta.

**Reglas**

- Existe una única acción principal.
- Nunca varias.
- Según el contexto:
  - Nuevo servicio.
  - Finalizar servicio.
- Debe situarse inmediatamente debajo del bloque de progreso.
- Utiliza únicamente la altura mínima necesaria.

La acción `Abrir jornada` pertenece exclusivamente a la arquitectura de la Home en estado Jornada Cerrada y será documentada en una versión posterior.

---

### 4.4 Registro Operativo

**Responsabilidad**

Mostrar el trabajo realizado durante la jornada.

**Reglas**

- Reutiliza íntegramente `Operational Lists Standard v1.0`.
- Reutiliza íntegramente `Dominio Visual v1.0`.
- Este documento no redefine:
  - estructura de fila;
  - densidad;
  - iconografía;
  - colores;
  - jerarquía;
  - interacción.
- Todo ello pertenece a los documentos específicos.
- Ocupa automáticamente todo el espacio restante de la pantalla.

---

### 4.5 Navegación inferior

**Responsabilidad**

Acceder al resto de módulos.

**Reglas**

- No compite con el Centro Operativo.
- Mantiene la navegación global de la aplicación.

---

## 5. Regla de arquitectura

Todos los bloques superiores utilizan únicamente la altura mínima necesaria para cumplir su misión.

La Navegación Inferior reserva una altura fija.

El Registro Operativo ocupa automáticamente todo el espacio restante comprendido entre la Acción Principal y la Navegación Inferior.

---

## 6. Decisiones aprobadas

- La Home es un Centro Operativo.
- La Home refleja el trabajo del taxista.
- La Home no dirige el trabajo.
- La Home no actúa como un menú de opciones.
- La estructura permanece estable durante la jornada.
- El Registro Operativo confirma el trabajo realizado.
- El Resumen Operativo no forma parte de la Home permanente.
- La cifra dominante de la Home es la recaudación acumulada.
- La acción principal se sitúa debajo del bloque de progreso.
- Solo la Acción Principal utiliza una tarjeta.
- Solo el Registro Operativo ocupa el espacio desplazable.
- Las acciones secundarias se trasladan a la pantalla Más.
- El Registro Operativo utiliza chips de plataforma en lugar de fondos de color.
- Durante un servicio únicamente cambia la acción principal.
- La barra superior pasa a denominarse Barra de Contexto Operativo.

---

## 7. Baseline oficial

La Home V2 queda aprobada y congelada como baseline visual y arquitectónica del proyecto.

Desde este momento es la referencia oficial para cualquier desarrollo futuro relacionado con la pantalla principal.

**Condiciones para cualquier cambio futuro**

- justificar la necesidad del cambio;
- mantener la filosofía del Centro Operativo;
- no romper la jerarquía visual aprobada;
- actualizar la documentación correspondiente si el cambio se aprueba.

---

## 8. Evolución de la Home

Ningún nuevo bloque podrá incorporarse a la Home sin justificar objetivamente:

- ¿Por qué existe?
- ¿Qué problema resuelve?
- ¿Qué decisión mejora?
- ¿Qué esfuerzo elimina?

Si no supera este filtro, no debe incorporarse al Centro Operativo.
