# Critical vs Enrichment Domain Data Review v1.0

## 0. Propósito

Este documento revisa el modelo del dominio de GeoTaxi a la luz de un hallazgo nuevo:

la apertura y continuidad del flujo de registro no deben quedar condicionadas por datos accesorios.

La cuestión no es técnica.

La cuestión es semántica y arquitectónica:

qué datos hacen existir un Servicio en el dominio y cuáles solo lo enriquecen.

Este documento no propone implementación.

No propone optimización.

No propone cambios de persistencia, UI o código.

Su objetivo es fijar el modelo correcto antes de cualquier adaptación.

---

## 1. Lectura arquitectónica del hallazgo

El problema observado durante el flujo de `Completar servicio` no es solamente de latencia.

El problema real es que la arquitectura actual todavía trata como obligatorios datos que, desde el modelo del negocio, son accesorios.

Eso distorsiona la realidad operativa del taxista.

El taxista puede registrar un servicio aunque no disponga todavía de:

- geolocalización;
- geocodificación;
- snapshot geográfico;
- barrio;
- distrito;
- estadísticas;
- proyecciones;
- cualquier dato derivado.

Por tanto, la validez del hecho económico no puede depender de la disponibilidad inmediata de esos datos.

La existencia del servicio debe depender solo del núcleo económico y operativo que lo define.

---

## 2. Respuesta a las preguntas arquitectónicas

### 2.1. ¿Cuáles son los datos realmente críticos para que un Servicio exista en el dominio de GeoTaxi?

Los datos críticos son los que permiten afirmar que el hecho económico fue registrado.

En el modelo actual, eso significa:

- identidad del registro;
- referencia al hecho operativo que se está conservando;
- instante real del hecho;
- asociación a la jornada, cuando el negocio la requiere;
- clasificación mínima del servicio;
- datos económicos esenciales del registro.

El núcleo económico imprescindible es:

- importe del servicio;
- forma de pago;
- relación inequívoca con el hecho registrado.

La clasificación operativa del servicio también forma parte del registro base porque permite entender qué tipo de prestación se ha documentado.

Lo que no es crítico para la existencia del servicio:

- posición GPS;
- barrio;
- distrito;
- dirección;
- geocodificación;
- snapshot GEO;
- estadísticas;
- resúmenes;
- objetivos;
- visualizaciones;
- etiquetas analíticas;
- cálculos derivados.

Conclusión:

un Servicio existe cuando queda registrado el hecho económico mínimo.

No existe porque ya se haya podido enriquecer.

### 2.2. ¿Qué datos son complementarios o de enriquecimiento?

Son complementarios todos los datos que amplían la lectura del servicio, pero no determinan su validez.

Clasificación propuesta:

| Categoría | Datos |
|---|---|
| Enriquecimiento espacial | GPS, geolocalización, geocodificación, snapshot geográfico, barrio, distrito, municipio, dirección |
| Enriquecimiento analítico | estadísticas, resúmenes, agregaciones, objetivos, métricas derivadas |
| Enriquecimiento visual | iconografía, etiquetas de presentación, proyecciones visuales, orden visual |
| Enriquecimiento administrativo secundario | zona manual de recogida o destino, información auxiliar de edición, metadatos de apoyo |
| Enriquecimiento económico derivado | importe cobrado cuando es distinto del importe base, propinas, diferencias calculadas, cualquier delta derivado |

Estos datos pueden ser valiosos.

Pero su valor es posterior o lateral respecto al hecho económico.

No deben determinar si el servicio puede registrarse.

### 2.3. ¿Existe actualmente alguna operación de enriquecimiento que esté bloqueando el flujo crítico del servicio?

Sí.

Hay varias.

Las relevantes son:

- captura de geolocalización en el cierre del servicio;
- resolución administrativa a partir de la posición;
- persistencia del snapshot GEO;
- refresco de resúmenes y proyecciones de pantalla antes de devolver el control a la UI;
- reconstrucción completa de datos de lectura que no son necesarios para que el servicio exista.

En el código actual, las operaciones más significativas son:

- `CloseTrip.execute`, que no devuelve el control hasta intentar geolocalización y snapshot GEO;
- `FinishTrip.execute`, que hace lo mismo después de persistir el núcleo crítico;
- `useTripActions.handleCloseActiveTrip`, que espera a que todo el flujo termine antes de mostrar el Bottom Sheet;
- `useTodayScreen.refreshData`, que recarga resúmenes, jornadas, listados y métricas antes de considerar estabilizada la pantalla;
- `SummaryService`, que recalcula agregados cuya existencia no es condición para registrar un servicio.

El punto importante no es solo que estas operaciones tarden.

El punto importante es que se han colocado en el camino semántico del registro.

### 2.4. ¿La arquitectura actual respeta el principio de que el registro del servicio tiene prioridad absoluta?

No lo respeta completamente.

Lo respeta parcialmente en el inicio del viaje, donde el snapshot START ya se trata como enriquecimiento posterior.

Pero deja de respetarlo en el cierre del servicio.

El incumplimiento aparece en tres niveles:

1. En Application, porque el caso de uso de cierre sigue esperando enriquecimiento GEO antes de terminar.
2. En Presentation/UI, porque la pantalla no recupera el control hasta después de refrescar datos accesorios.
3. En el modelo operativo, porque la apertura del Bottom Sheet se hace depender de cálculos y lecturas que no forman parte del hecho económico mínimo.

La consecuencia arquitectónica es clara:

la operativa crítica todavía está acoplada a información de enriquecimiento.

### 2.5. ¿Cuál sería un modelo arquitectónico más fiel al dominio?

El modelo más fiel es aquel en el que el Servicio se entiende como un hecho económico registrado y no como un expediente completo.

Ese modelo separa dos capas semánticas:

#### Capa 1. Registro crítico

Conserva solo lo necesario para que el Servicio exista como verdad del negocio.

Incluye:

- identidad;
- fecha u hora del hecho;
- asociación al contexto operativo;
- clasificación mínima;
- importe;
- forma de pago;
- demás datos directamente necesarios para liquidar.

#### Capa 2. Enriquecimiento del servicio

Añade información útil, pero no constitutiva.

Incluye:

- geolocalización;
- barrio y distrito;
- snapshots;
- resúmenes;
- métricas;
- etiquetas visuales;
- cualquier información reconstruible después.

En este modelo:

- el Servicio puede existir sin enriquecimiento completo;
- el Servicio puede ser válido aunque parte de su documentación llegue después;
- el enriquecimiento nunca decide la validez del hecho;
- la ausencia de datos accesorios no invalida el registro.

La idea central no es acelerar nada.

La idea central es reflejar mejor la realidad operativa del taxista.

### 2.6. ¿Qué impacto tendría el cambio sobre dominio, casos de uso, persistencia, UI, eventos, repositorios y reglas de negocio?

#### Dominio

El dominio debe distinguir con más claridad entre:

- hecho económico esencial;
- documentación complementaria;
- derivación analítica.

El estado del servicio no debería tratarse como conocimiento primario si puede inferirse de la cronología y de la economía.

La geografía y la analítica deben quedar fuera del núcleo semántico del servicio.

#### Casos de uso

Los casos de uso deben expresar que registrar el servicio es una intención completa por sí misma.

La completitud del enriquecimiento no puede formar parte de la definición del éxito operativo.

La operación crítica debe finalizar cuando el hecho está registrado, no cuando todo lo accesorio ya ha sido calculado.

#### Persistencia

La persistencia debe seguir guardando hechos del negocio.

Debe dejar de tratar como requisito de validez lo que solo es lectura o enriquecimiento.

Los datos derivados y analíticos no deben convertirse en condición de existencia del registro.

#### UI

La UI no debe esperar a que el enriquecimiento termine para dejar continuar al taxista.

La interfaz puede mostrar información complementaria cuando llegue.

Pero no debe bloquear el flujo operativo por información no crítica.

#### Eventos

Si el sistema emite eventos, el evento del registro del servicio debe ser independiente del evento de enriquecimiento.

El hecho registrado y su documentación posterior no deben quedar fusionados semánticamente.

#### Repositorios

Los repositorios del hecho crítico deben persistir el registro esencial.

Los repositorios de enriquecimiento deben ser secundarios y tolerantes a fallo.

Un repositorio no debería convertirse en el lugar donde se decide si un servicio existe.

#### Reglas de negocio

La regla de negocio principal pasa a ser:

el Servicio es válido cuando el hecho económico mínimo ha quedado registrado.

Todo lo demás es extensible, completivo o analítico.

Las reglas accesorias no pueden impedir el registro.

### 2.7. ¿Este cambio constituye una optimización técnica o una mejora del modelo del dominio?

Constituye una mejora del modelo del dominio.

No es principalmente una optimización técnica por estas razones:

- el problema de fondo no es solo el tiempo de respuesta;
- el problema de fondo es la frontera semántica entre lo crítico y lo accesorio;
- la arquitectura actual está mezclando validez del hecho con completitud del enriquecimiento;
- el cambio necesario redefine qué significa que un Servicio exista en GeoTaxi.

La mejora de rendimiento sería una consecuencia posible.

Pero no es el objetivo arquitectónico principal.

El objetivo principal es modelar correctamente la realidad operativa.

---

## 3. Principio arquitectónico permanente propuesto

Se propone adoptar como principio permanente:

> El hecho económico del servicio tiene prioridad absoluta. Ningún dato accesorio puede impedir su registro, su continuidad ni su validez.

Versión corta:

> El Servicio existe por el hecho económico registrado; todo lo demás es enriquecimiento.

Este principio debe gobernar:

- dominio;
- casos de uso;
- persistencia;
- presentación;
- UI;
- eventos;
- repositorios;
- reglas de negocio.

---

## 4. Síntesis del cambio

Lo que cambia no es la velocidad del GPS.

Lo que cambia es la definición arquitectónica de lo que bloquea la existencia del servicio.

GeoTaxi debe representar el trabajo real del taxista:

- primero ocurre el hecho;
- después se completa su documentación;
- si falta lo accesorio, el servicio sigue existiendo;
- si falla el enriquecimiento, el taxista no debe quedar bloqueado.

Esa es la fidelidad correcta del dominio.

---

## 5. Conclusión

La arquitectura actual ya reconoce parcialmente la prioridad del hecho operativo, pero todavía no la aplica de forma consistente en el cierre y completado del servicio.

El problema no es un simple cuello de botella.

Es una frontera de modelo mal situada.

Por tanto, este cambio debe tratarse como una mejora del dominio, no como una optimización técnica.

---

## 6. Referencias revisadas

- `docs/architecture/Prioridad Operativa y Enriquecimiento de Datos v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`
- `docs/architecture/GeoTaxi Operational Event Model v1.0.md`
- `docs/domain/Trip Domain v2.md`
- `docs/persistence/Persistent Model v1.0.md`
- `src/application/trips/CloseTrip.ts`
- `src/application/trips/FinishTrip.ts`
- `src/hooks/useTripActions.ts`
- `src/hooks/useTodayScreen.ts`
- `src/application/runtime/SummaryService.ts`
- `src/application/trips/StartTrip.ts`
