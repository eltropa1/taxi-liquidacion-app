# Prioridad Operativa y Enriquecimiento de Datos v1.0

## 0. Propósito

Este documento define el principio oficial de TaxiGeo sobre la relación entre los datos necesarios para la operativa diaria y los datos que aportan valor adicional.

Su función es proteger la actividad económica del taxista como prioridad absoluta del sistema y evitar que capacidades de enriquecimiento bloqueen el uso normal del producto.

---

## 1. Motivación

TaxiGeo existe para registrar de forma rápida, estable y fiable la actividad real del taxista.

Durante la auditoría de estabilidad operativa se confirmó que el sistema debe distinguir entre:

- lo que es imprescindible para conservar correctamente la operativa;
- lo que aporta valor adicional pero no puede condicionar el trabajo diario.

Sin esta separación, cualquier capa del sistema podría convertir una mejora analítica, visual o técnica en un punto de fallo del flujo principal.

Eso sería incorrecto.

---

## 2. Principio oficial

> La operativa del taxista siempre tiene prioridad sobre el enriquecimiento de datos.

Este principio es vinculante para toda decisión de arquitectura, persistencia, dominio, aplicación, presentación e infraestructura.

Ningún dato de enriquecimiento puede degradar, retrasar o bloquear la operativa principal.

---

## 3. Categorías de datos

TaxiGeo distingue dos categorías oficiales de información.

### 3.1. Datos operativos

Los datos operativos son los datos imprescindibles para registrar correctamente la actividad del taxista.

Ejemplos:

- apertura de jornada;
- cierre de jornada;
- inicio de viaje;
- finalización de viaje;
- plataforma;
- importe;
- forma de pago;
- horas del viaje;
- cualquier dato indispensable para la liquidación.

Propiedades obligatorias:

- consistencia;
- atomicidad;
- persistencia garantizada;
- fiabilidad.

Regla:

si un dato operativo no puede persistirse, la operación debe fallar.

### 3.2. Datos de enriquecimiento

Los datos de enriquecimiento aumentan el valor del sistema, pero no son necesarios para que el taxista pueda seguir trabajando.

Ejemplos:

- GPS;
- snapshots;
- barrio;
- distrito;
- municipio;
- dirección;
- geocodificación;
- IA;
- OCR;
- fotografías;
- tráfico;
- meteorología;
- estadísticas avanzadas;
- cualquier información analítica futura.

Propiedades obligatorias:

- se intentan obtener;
- si se obtienen, se almacenan;
- si fallan, el viaje sigue siendo completamente válido.

Regla:

ningún fallo de enriquecimiento puede impedir abrir jornada, cerrar jornada, iniciar viaje, finalizar viaje, editar viaje o eliminar viaje.

---

## 4. Responsabilidades

### 4.1. Responsabilidad de los datos operativos

Los datos operativos deben sostener la verdad económica del taxista.

Por tanto, deben:

- validar que la operación es completa;
- garantizar que el hecho queda registrado;
- proteger la integridad de la liquidación;
- hacer fallar la operación cuando la persistencia crítica no sea posible.

### 4.2. Responsabilidad de los datos de enriquecimiento

Los datos de enriquecimiento deben ampliar la utilidad del sistema sin condicionar la operativa diaria.

Por tanto, deben:

- ejecutarse con estrategia best effort;
- tolerar fallos parciales;
- no introducir bloqueo funcional;
- no sustituir nunca la información operativa;
- no convertirse en requisito implícito de validez del viaje o de la jornada.

---

## 5. Ejemplos

### 5.1. Ejemplos de datos operativos

- registrar la apertura de jornada;
- persistir el cierre de jornada;
- guardar el inicio real de un viaje;
- guardar el final real de un viaje;
- almacenar el importe y la forma de pago;
- conservar la información necesaria para liquidar correctamente.

### 5.2. Ejemplos de datos de enriquecimiento

- obtener GPS al iniciar o finalizar un viaje;
- generar un snapshot visual o técnico;
- resolver geocodificación inversa;
- clasificar barrio o distrito;
- extraer texto con OCR;
- generar una etiqueta analítica con IA;
- asociar imágenes, tráfico o meteorología.

---

## 6. Implicaciones para el diseño

Este principio obliga a diseñar el sistema con una frontera clara entre lo crítico y lo accesorio.

Implicaciones directas:

- las operaciones críticas deben tener contratos de persistencia estrictos;
- los enriquecimientos deben desacoplarse del camino crítico;
- los fallos técnicos de enriquecimiento no deben propagarse como fallos de negocio;
- la validación de datos operativos debe ser explícita;
- el almacenamiento de enriquecimiento debe ser tolerante a fallos;
- las decisiones de UI no pueden convertir una mejora informativa en condición de bloqueo.

Regla práctica:

si una información define si la operación existe, es operativa;
si solo mejora la lectura, el análisis o la evolución futura, es enriquecimiento.

---

## 7. Implicaciones para futuros desarrollos

Toda nueva capacidad debe clasificarse antes de diseñarse.

Si una capacidad afecta a la liquidación, a la continuidad del trabajo o a la validez del hecho operativo, debe tratarse como operativa.

Si una capacidad aporta contexto, análisis, ayuda visual o inteligencia auxiliar, debe tratarse como enriquecimiento.

Esto implica que:

- cualquier funcionalidad futura de análisis debe depender de la operativa, no al revés;
- cualquier IA, OCR, geocodificación o lectura automática debe ser complementaria;
- cualquier nueva fuente de datos debe integrarse sin comprometer el camino crítico;
- cualquier dato inicialmente accesorio que pase a ser imprescindible deberá revisarse y clasificarse de forma explícita en una decisión arquitectónica posterior.

---

## 8. Decisiones correctas e incorrectas

### 8.1. Decisiones correctas

- abrir una jornada aunque falle el GPS;
- cerrar un viaje aunque falle la geocodificación;
- guardar el importe y la forma de pago aunque no se pueda generar un snapshot;
- persistir datos operativos en una sola operación atómica;
- ejecutar OCR o IA después de guardar el viaje, sin bloquear el guardado;
- almacenar estadísticas solo cuando el núcleo operativo ya está garantizado.

### 8.2. Decisiones incorrectas

- impedir abrir jornada porque falló una llamada de geocodificación;
- considerar inválido un viaje porque no llegó un snapshot;
- bloquear la edición de un viaje por no poder calcular una estadística;
- tratar una fotografía como condición para persistir un cierre;
- mezclar datos analíticos con la validez de la liquidación;
- permitir que una mejora de enriquecimiento altere la semántica de la operativa.

---

## 9. Relación con la estabilidad operativa del MVP

Este principio formaliza el criterio de estabilidad operativa del MVP.

La prioridad del MVP es que el taxista pueda trabajar con rapidez, continuidad y fiabilidad.

Por eso:

- la operativa diaria debe permanecer estable incluso cuando falle un enriquecimiento;
- los datos necesarios para liquidar deben ser los únicos que condicionen el éxito de la operación;
- las capacidades de valor futuro deben crecer alrededor del núcleo operativo, no dentro de él;
- la evolución del producto debe proteger primero el trabajo real y después el valor analítico.

El principio de estabilidad operativa del MVP y este documento expresan la misma dirección arquitectónica:

primero se protege la operativa;
después se amplía el valor de los datos.

---

## 10. Documentos relacionados

- `docs/00-product-construction-principles.md`
- `docs/architecture/Architectural Decision Process v1.0.md`
- `docs/domain/Trip Domain v2.md`
- `docs/persistence/Persistence Architecture v1.0.md`
- `docs/persistence/Persistent Model v1.0.md`
- `docs/backlog/TECH-001 Background Snapshot Reliability.md`

