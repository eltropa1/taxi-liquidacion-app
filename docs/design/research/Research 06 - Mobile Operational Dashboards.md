# Research 06 — Mobile Operational Dashboards

## Objetivo de la investigación

Consolidar la investigación realizada sobre dashboards móviles operativos y traducir sus conclusiones al diseño de GeoTaxi.

Esta investigación reúne de forma coherente los aprendizajes ya trabajados en las sesiones de diseño sobre dashboards financieros, dashboards operativos, consenso global, traducción a GeoTaxi y modelo definitivo del Panel de Decisión Operativa.

El propósito no es describir pantallas aisladas.

El propósito es definir el modelo operativo que debe soportar la Home V2 de GeoTaxi.

---

## Estado del arte

La investigación sobre dashboards móviles financieros y operativos muestra un patrón consistente.

En contextos de alta presión, los mejores paneles no intentan mostrarlo todo.

Organizan la información para ayudar a decidir con rapidez.

Los patrones comunes identificados son:

- prioridad absoluta de la información útil para la acción;
- estructura estable y predecible;
- lectura rápida del estado actual;
- separación clara entre decisión, control y registro;
- reducción de ruido visual y cognitivo;
- adaptación al contexto operativo real;
- foco en continuidad de trabajo, no en exploración.

En entornos financieros, industriales, logísticos, clínicos o de control, el dashboard efectivo no compite con la tarea.

La soporta.

---

## Consenso encontrado

La investigación consolidada converge en un mismo principio: una home operativa existe para ayudar a decidir, no para decorar ni para acumular datos.

De ese consenso se derivan las siguientes conclusiones:

1. La Home no es una pantalla de inicio.
2. La Home es un Panel de Decisión Operativa.
3. La Home responde preguntas, no muestra datos.
4. Cada bloque responde una única pregunta.
5. Cada bloque tiene una única responsabilidad.
6. La estructura permanece estable.
7. El usuario nunca pierde el contexto.
8. La siguiente acción siempre es evidente.
9. La Home ayuda a decidir.
10. La Home transmite confianza.
11. La Home transmite calma operativa.
12. El Registro Operativo confirma las operaciones.
13. La atención del usuario es un recurso limitado.
14. La Home solo contiene información necesaria para la operación.
15. Toda nueva funcionalidad deberá justificar su presencia en la Home.

---

## Principios del Panel de Decisión Operativa

El Panel de Decisión Operativa de GeoTaxi se apoya en estos principios:

### 1. La Home es operativa, no narrativa

No cuenta una historia.

Sostiene la jornada.

### 2. La Home responde preguntas concretas

Cada bloque debe resolver una pregunta del taxista en el momento exacto en que la necesita.

### 3. La Home trabaja con estructura estable

La estructura general no debe cambiar por exceso de contexto, modo o contenido.

### 4. La Home protege el contexto

El usuario nunca debe sentirse desubicado ni obligado a reconstruir mentalmente el estado de la jornada.

### 5. La Home prioriza la siguiente acción

La interfaz debe llevar al usuario hacia la próxima decisión operativa sin fricción.

### 6. La Home confirma la operación

El Registro Operativo informa de lo que acaba de ocurrir y valida visualmente la acción realizada.

### 7. La Home protege la atención

La atención del taxista es limitada y debe reservarse para la operación, no para interpretar la interfaz.

### 8. La Home sólo contiene lo necesario

Si una información no ayuda a operar, no debe ocupar espacio en la Home.

---

## Adaptación específica a GeoTaxi

GeoTaxi convierte el consenso anterior en un modelo concreto para la jornada del taxista.

- La Home V2 será el centro operativo del producto.
- La Home V2 mostrará el estado actual de la jornada.
- La Home V2 mostrará una única acción principal.
- La Home V2 mostrará el estado económico operativo necesario para decidir.
- La Home V2 mostrará el control de los elementos que afectan a la operación.
- La Home V2 mostrará el Registro Operativo como confirmación inmediata.
- La Home V2 no competirá con pantallas secundarias.
- La Home V2 no se convertirá en un panel de consulta general.
- La Home V2 no acumulará información que no ayude a trabajar.
- La Home V2 mantendrá el flujo de trabajo sin romper el contexto.

---

## Reglas candidatas

Las conclusiones consolidadas de esta investigación pueden transformarse en reglas futuras para `GeoTaxi UI Guidelines`.

Todavía no son reglas oficiales.

- La Home será un Panel de Decisión Operativa.
- La Home responderá preguntas operativas, no mostrará datos acumulados sin contexto.
- Cada bloque de la Home responderá una única pregunta.
- La estructura de la Home permanecerá estable.
- El Registro Operativo confirmará las operaciones realizadas.
- La Home sólo contendrá información necesaria para operar.
- Toda nueva funcionalidad deberá justificar su presencia en la Home.
- La Home deberá proteger la atención del usuario.
- La Home deberá transmitir confianza y calma operativa.
- La siguiente acción siempre deberá ser evidente.

---

## Impacto esperado

| Principio | Impacto sobre la Home V2 |
|---|---|
| La Home no es una pantalla de inicio. | La Home V2 dejará de entenderse como entrada genérica y pasará a ser el centro operativo real del taxista. |
| La Home es un Panel de Decisión Operativa. | La Home V2 organizará su contenido para ayudar a decidir qué hacer ahora. |
| La Home responde preguntas, no muestra datos. | Cada bloque de la Home V2 estará vinculado a una pregunta operativa concreta. |
| Cada bloque responde una única pregunta. | La Home V2 mantendrá bloques con responsabilidad única y clara. |
| Cada bloque tiene una única responsabilidad. | La Home V2 evitará mezclar estados, acciones y consulta en el mismo bloque. |
| La estructura permanece estable. | La Home V2 conservará una arquitectura persistente para reducir aprendizaje y carga cognitiva. |
| El usuario nunca pierde el contexto. | La Home V2 mantendrá siempre visible el estado operativo relevante. |
| La siguiente acción siempre es evidente. | La Home V2 señalará con claridad qué debe hacer el taxista a continuación. |
| La Home ayuda a decidir. | La Home V2 mostrará información útil para tomar decisiones, no para explorar. |
| La Home transmite confianza. | La Home V2 reducirá incertidumbre y mostrará un estado comprensible en todo momento. |
| La Home transmite calma operativa. | La Home V2 minimizará ruido y fricción durante la jornada. |
| El Registro Operativo confirma las operaciones. | La Home V2 usará el Registro Operativo como validación inmediata de lo sucedido. |
| La atención del usuario es un recurso limitado. | La Home V2 filtrará todo lo que no contribuya a la operación inmediata. |
| La Home solo contiene información necesaria para la operación. | La Home V2 excluirá información secundaria, histórica o analítica que no ayude a trabajar. |
| Toda nueva funcionalidad deberá justificar su presencia en la Home. | La Home V2 no crecerá por acumulación; sólo incorporará lo que aporte valor operativo real. |

---

## Estado de la investigación

Estado actual:

🟢 Aprobada

---

## Decisiones adoptadas

Las siguientes decisiones quedan aprobadas:

✓ La Home no es una pantalla de inicio.

✓ La Home es un Panel de Decisión Operativa.

✓ La Home responde preguntas, no muestra datos.

✓ Cada bloque responde una única pregunta.

✓ Cada bloque tiene una única responsabilidad.

✓ La estructura permanece estable.

✓ El usuario nunca pierde el contexto.

✓ La siguiente acción siempre es evidente.

✓ La Home ayuda a decidir.

✓ La Home transmite confianza.

✓ La Home transmite calma operativa.

✓ El Registro Operativo confirma las operaciones.

✓ La atención del usuario es un recurso limitado.

✓ La Home solo contiene información necesaria para la operación.

✓ Toda nueva funcionalidad deberá justificar su presencia en la Home.

Estas decisiones quedan aprobadas para su futura incorporación a `GeoTaxi UI Guidelines v1.0`.

---

## Conclusiones finales

Esta investigación consolida el modelo de dashboard móvil que GeoTaxi necesita para su producto.

Su resultado define la base científica y metodológica para el diseño de `GeoTaxi Home V2`.

El Panel de Decisión Operativa se convierte así en la referencia oficial para estructurar la Home como soporte real del trabajo del taxista, manteniendo foco, contexto, calma operativa y evidencia clara de la siguiente acción.

---

## Próximos pasos

La siguiente investigación oficial será:

`Research 07 — Forms & Data Entry`
