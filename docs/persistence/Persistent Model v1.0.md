# Persistent Model v1.0

## Propósito

Este documento define el modelo persistente definitivo de TaxiGeo desde el punto de vista del dominio.

Su función es establecer qué hechos del negocio deben conservarse para poder reconstruir íntegramente la memoria operativa del sistema.

No describe implementación, tecnología ni estructura física.

## Alcance

El modelo persistente de TaxiGeo conserva únicamente los conceptos que representan hechos operativos reales del negocio.

En este modelo existen dos agregados persistentes principales:

- `Workday`
- `Trip`

Los demás conceptos del producto se resuelven como:

- información derivada;
- catálogos de identidad;
- proyecciones de lectura;
- capacidades de cálculo;
- o infraestructura.

## Aggregate: Workday

### Identidad

`Workday` posee una identidad propia e independiente del día natural en el calendario.

Esa identidad representa una jornada real de actividad operativa del conductor, es decir, un tramo concreto de trabajo que TaxiGeo decide conservar como unidad de memoria operativa.

La identidad de la jornada no debe inferirse de la fecha, porque una jornada puede cruzar medianoche.

Permanece estable durante toda la vida de la jornada porque la jornada no deja de ser el mismo hecho operativo aunque cambien su estado de cierre, su duración o la cantidad de viajes asociados.

Esa identidad permite reconstruir todas las operaciones pertenecientes a la jornada porque actúa como referencia común para agrupar, consultar e interpretar los viajes que ocurrieron dentro de ese mismo tramo de trabajo.

### Información que debe conservar

La jornada debe conservar únicamente la información que define su existencia como unidad operativa:

- instante de inicio;
- instante de cierre, cuando exista.

### Información que no debe persistirse porque es derivable

No debe persistirse como conocimiento primario:

- si la jornada está abierta o cerrada;
- si la jornada es la actual;
- su duración;
- cualquier interpretación basada solo en el instante de inicio o cierre.

### Información que pertenece realmente a otro Aggregate

La jornada no contiene información de viajes.

Los viajes pertenecen a su propio agregado y solo se relacionan con la jornada por referencia.

### Relaciones entre Aggregates

- una jornada puede agrupar muchos viajes;
- un viaje puede estar asociado a una jornada;
- la jornada no depende del contenido interno de los viajes para existir.

## Aggregate: Trip

### Identidad

`Trip` posee identidad propia y estable durante toda su vida.

Esa identidad no cambia si el viaje se completa, se corrige o se enriquece con nueva información.

### Información que debe conservar

El viaje debe conservar todo aquello que describe el hecho operativo singular ocurrido en la realidad:

- su cronología:
  - instante de inicio;
  - instante de fin, cuando exista;
- su clasificación operativa:
  - plataforma, cuando exista;
  - tipo de servicio, cuando exista;
  - etiqueta libre de clasificación, cuando exista;
- su economía:
  - importe del viaje;
  - método de pago;
  - importe efectivamente cobrado, cuando exista;
- su asociación a jornada, cuando corresponda.

### Información que no debe persistirse porque es derivable

No debe persistirse como parte del modelo conceptual:

- el estado del viaje si puede inferirse de su cronología y de su economía;
- si el viaje está en progreso, pendiente de información o completado;
- diferencias calculadas entre importe y cobro;
- resúmenes, totales o agregaciones;
- cualquier lectura temporal por día, semana o mes;
- cualquier representación visual de la clasificación;
- cualquier interpretación de negocio que pueda reconstruirse a partir de la información anterior.

### Información que pertenece realmente a otro Aggregate

La jornada no pertenece al viaje.

El viaje solo conserva una referencia a la jornada cuando necesita expresar que ocurrió dentro de ella.

La clasificación del viaje también se apoya en información y catálogos del dominio que no redefinen al viaje:

- la plataforma;
- el tipo de servicio;
- el método de pago.

Esa información forma parte del viaje como descripción operativa conservada; no constituye un agregado independiente ni desplaza la identidad del viaje.

### Relaciones entre Aggregates

- un viaje puede pertenecer a una jornada;
- una jornada puede contener muchos viajes;
- un viaje puede estar parcialmente conocido;
- un viaje puede completarse o corregirse sin perder identidad;
- la clasificación y la economía del viaje no redefinen su identidad.

## Información fuera del modelo persistente

No forman parte del modelo persistente definitivo del dominio:

- estadísticas;
- objetivos;
- resúmenes;
- proyecciones de lectura;
- identidad visual;
- geocodificación administrativa;
- geolocalización cruda;
- trazas de posición;
- capturas de interfaz;
- metadatos técnicos de infraestructura;
- reglas de presentación.

Si alguno de esos conceptos se usa en el producto, debe vivir en su propio dominio o quedar como dato derivado, pero no como núcleo persistente del viaje o de la jornada.

# Evolución del modelo

El modelo persistente actual no incorpora todavía conceptos específicos para sincronización o múltiples dispositivos porque no forman parte del dominio operativo del MVP.

Cuando esas capacidades pasen a formar parte del producto, deberán incorporarse mediante un dominio específico de sincronización, sin contaminar el modelo persistente del dominio operativo.

Este modelo no impide esa evolución. Simplemente no la define todavía.

# Reglas de diseño

1. Cada Aggregate debe tener una única identidad estable.
2. La persistencia debe guardar hechos del negocio, no interpretaciones.
3. Todo lo derivable debe calcularse fuera del modelo persistente.
4. Ningún Aggregate debe duplicar información que pertenece a otro Aggregate.
5. Las relaciones entre Aggregates deben hacerse por identidad, nunca por mezcla de responsabilidades.
6. La persistencia debe conservar el conocimiento parcial sin obligar a completar un hecho antes de tiempo.
7. La ausencia de información opcional no debe invalidar la identidad del hecho conservado.
8. La información de catálogo o referencia debe permanecer separada de los hechos operativos.
9. La representación física futura debe respetar la semántica del dominio, no imponerse sobre ella.
10. Cualquier nuevo dato persistente deberá justificarse por su valor para reconstruir el dominio, no por conveniencia técnica.
