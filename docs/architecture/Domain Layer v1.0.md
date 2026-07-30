# Domain Layer v1.0

## 0. Propósito

Este documento define la capa de dominio oficial de TaxiGeo 1.0.

Su función es establecer qué representa el dominio, cómo debe organizarse y qué reglas debe respetar cualquier modelo de dominio presente o futuro.

No describe implementación.

No describe persistencia física.

No describe UI.

No describe infraestructura.

Este documento existe para proteger el conocimiento del negocio como fuente de verdad del sistema.

---

## 1. Misión del dominio

El dominio representa el negocio de TaxiGeo tal como debe ser entendido, protegido y evolucionado por el sistema.

En TaxiGeo, el dominio existe para describir la realidad operativa del taxista y las reglas que la hacen consistente, no para acomodar la forma en que la aplicación está construida.

### 1.1. Qué representa

El dominio representa:

- hechos del negocio;
- identidades estables;
- reglas puras;
- invariantes;
- relaciones semánticas;
- conocimiento valioso del producto;
- modelos que deben sobrevivir a cambios tecnológicos.

### 1.2. Por qué es la fuente de verdad

El dominio es la fuente de verdad porque:

- modela el negocio, no la implementación;
- conserva el lenguaje oficial del producto;
- define qué significa cada concepto;
- protege las reglas que no deben duplicarse;
- permite que la infraestructura cambie sin redefinir el negocio.

Si una decisión técnica contradice al dominio, la decisión técnica es incorrecta.

Si una pantalla contradice al dominio, la pantalla es incorrecta.

Si una persistencia contradice al dominio, la persistencia debe cambiar.

### 1.3. Responsabilidades del dominio

El dominio debe:

- modelar conceptos del negocio;
- validar reglas puras;
- proteger invariantes;
- expresar conocimiento parcial cuando el negocio lo permite;
- conservar identidad estable;
- ofrecer un lenguaje ubicuo coherente;
- aislar decisiones de negocio del detalle técnico;
- ser pequeño, explícito y verificable.

### 1.4. Responsabilidades que nunca tendrá

El dominio nunca debe:

- conocer React;
- conocer Expo;
- conocer React Native;
- conocer SQLite;
- conocer SQL;
- conocer navegación;
- conocer UI;
- conocer hooks;
- conocer infraestructura;
- conocer providers de React;
- conocer detalles de red, archivos o dispositivos;
- conocer migraciones físicas;
- conocer componentes visuales;
- conocer pantallas;
- depender de Application;
- depender de Presentation;
- depender de Infrastructure.

---

## 2. Filosofía del dominio

La capa de dominio de TaxiGeo sigue una disciplina estricta:

- el dominio modela negocio, no base de datos;
- el dominio modela significado, no estructura física;
- el dominio modela reglas, no pantallas;
- el dominio modela identidad, no almacenamiento;
- el dominio modela continuidad, no transporte técnico;
- el dominio no se adapta a la limitación de una librería;
- el dominio nunca se subordina a la infraestructura;
- el dominio nunca depende de otra capa.

### 2.1. Principios innegociables

1. La realidad del negocio prevalece sobre el código.
2. El modelo del dominio prevalece sobre el modelo técnico.
3. Una regla vive una sola vez.
4. Una identidad es estable durante todo el ciclo de vida del objeto.
5. Lo derivable no debe convertirse en conocimiento primario.
6. Lo opcional no debe destruir la identidad del hecho.
7. Lo visual no redefine el negocio.
8. Lo técnico no redefine el significado.
9. Las dependencias siempre apuntan hacia dentro.
10. El dominio debe permanecer pequeño y con límites nítidos.

### 2.2. Relación con los documentos oficiales del producto

Este documento debe leerse junto con:

- `docs/domain/Trip Domain v2.md`
- `docs/persistence/Persistent Model v1.0.md`
- `docs/persistence/Persistence Architecture v1.0.md`
- `docs/architecture/Project Structure v1.0.md`

Esos documentos fijan que el core inicial de TaxiGeo se centra en:

- `Trip`
- `Workday`

Y en módulos de soporte estrictamente necesarios:

- `money`
- `distance`
- `platform`
- `payment`
- `visual`
- `date-time`
- `identity`

Los demás conceptos no deben inflar el núcleo sin una justificación equivalente a la de los agregados persistentes principales.

---

## 3. Organización oficial

La capa de dominio se organiza por subdominio y por responsabilidad semántica.

La forma oficial es:

```text
src/domain/
├── trips/
├── workdays/
├── money/
├── distance/
├── platform/
├── payment/
├── visual/
├── date-time/
└── identity/
```

### 3.1. Estructura interna recomendada de un subdominio

Un subdominio puede organizarse así, pero solo si existen conceptos reales que lo justifiquen.

```text
src/domain/trips/
├── entities/
├── value-objects/
├── services/
├── events/
├── specifications/
├── policies/
├── factories/
├── errors/
└── index.ts
```

Ninguna de estas carpetas es obligatoria.

No deben crearse carpetas vacías.

No deben crearse "por arquitectura".

La estructura exacta depende de la complejidad real del subdominio y de la existencia de conceptos reales que la justifiquen.

### 3.2. Cuándo crear cada carpeta

- `entities/`: cuando existe una identidad estable con ciclo de vida propio.
- `value-objects/`: cuando un concepto se define por su valor y no por su identidad.
- `services/`: cuando una regla pura no pertenece naturalmente a una sola entidad o value object.
- `events/`: cuando un hecho del dominio merece ser expresado como acontecimiento explícito.
- `specifications/`: cuando una condición de dominio se reutiliza y merece nombre propio.
- `policies/`: cuando una decisión del negocio combina reglas, contexto o preferencia del producto.
- `factories/`: cuando la creación es compleja o requiere invariantes de construcción.
- `errors/`: cuando el dominio necesita representar fallos propios con semántica clara.

### 3.3. Organización por subdominio

#### `trips/`

Representa el viaje como hecho operativo conservado.

Debe contener toda la semántica del viaje y solo la semántica del viaje.

#### `workdays/`

Representa la jornada como unidad operativa de memoria.

Debe mantener su identidad estable y sus reglas de apertura, cierre y continuidad.
Una jornada no se reinterpreta por sus viajes individuales ni por el cruce de medianoche.

#### `money/`

Representa importes, cobros, tarifas, redondeos y reglas monetarias puras.

#### `distance/`

Representa distancias y medidas espaciales puras.

#### `platform/`

Representa plataformas como identidad de negocio y clasificación operativa.

#### `payment/`

Representa métodos de pago y reglas semánticas asociadas al cobro.

#### `visual/`

Representa el lenguaje visual oficial del producto como contrato de representación estable del negocio.

No debe convertirse en lógica de UI.

No decide pantallas.

No contiene componentes React.

No sustituye a Presentation.

Solo define la identidad visual estable del negocio cuando esa identidad forma parte del lenguaje de TaxiGeo.

#### `date-time/`

Representa instantes, intervalos, zonas horarias y operaciones temporales puras.

En TaxiGeo, este subdominio también fija la semana operativa oficial:

- respeta el día configurable de inicio semanal;
- no cruza el límite de un mes calendario;
- puede devolver periodos menores de 7 días cuando la frontera mensual lo exige.
Historial debe consumir esta autoridad temporal y no recalcular semanas de forma local.
La vertical Historial Semana reutiliza esta autoridad temporal para la semana operativa certificada.
La vertical Historial Quincena reutiliza esta autoridad temporal para la ventana calendario de 1-15 y 16-fin de mes.
La vertical Historial Mes reutiliza la misma autoridad y agrupa el mes por semanas oficiales del dominio.
La vertical Historial Año reutiliza la misma autoridad y agrupa el año por meses calendario.
La vertical Historial con rango personalizado también debe consumir esta autoridad temporal y solo ajustar su ventana explícita, nunca reinterpretar jornadas ni semanas.
La exportación histórica debe tomar el dataset ya resuelto por Historial y no volver a decidir periodos por su cuenta.

#### `identity/`

Representa identidades, claves y referencias estables cuando son realmente transversales.

### 3.4. Sobre subdominios no core

TaxiGeo no debe crear raíces de dominio para conceptos que no tengan justificación equivalente a `Trip` o `Workday`.

`Trip` y `Workday` son los agregados persistentes principales del core inicial.

El resto de módulos iniciales son soporte del lenguaje del dominio, no competidores del core.

Por tanto, en la capa de dominio inicial no deben convertirse en raíces permanentes:

- `summaries`
- `goals`
- `geo`

Si aparecen en el producto, deberán resolverse como:

- proyecciones;
- servicios de lectura;
- capacidades derivadas;
- infraestructura técnica;
- o futuros dominios explícitamente aprobados.

---

## 4. Entidades

Una entidad es un objeto del dominio con identidad propia y continuidad a lo largo del tiempo.

La entidad no se define por sus atributos.

Se define por su identidad y por la continuidad de su significado.

### 4.1. Cuándo crear una entidad

Crear una entidad cuando:

- exista una identidad estable;
- el objeto pueda evolucionar sin dejar de ser el mismo;
- el negocio necesite distinguirlo de otros objetos parecidos;
- su vida no pueda explicarse solo por el valor de sus atributos;
- el ciclo de vida importe más que el estado puntual.

### 4.2. Qué responsabilidades tiene

Una entidad puede:

- conservar identidad;
- proteger reglas propias;
- evolucionar dentro de los límites del dominio;
- emitir cambios relevantes;
- coordinar su propio estado.

### 4.3. Qué nunca debe contener

Una entidad nunca debe contener:

- código de UI;
- acceso a persistencia;
- lógica de infraestructura;
- decisiones de transporte;
- conocimiento de la base de datos;
- formatos de pantalla;
- comportamiento técnico ajeno al negocio.

### 4.4. Ejemplos en TaxiGeo

- `Trip`
- `Workday`

Estos son los agregados persistentes principales y, por tanto, las entidades de negocio más importantes del core inicial.

---

## 5. Value Objects

Un value object es un concepto del dominio definido por su valor, no por su identidad.

### 5.1. Propiedades oficiales

- es inmutable;
- se valida al crearse;
- se compara por valor;
- no tiene ciclo de vida independiente;
- existe para representar significado puro;
- no contiene efectos secundarios.

### 5.2. Reglas

Un value object debe:

- expresar un concepto claro;
- proteger una restricción semántica;
- evitar estados inválidos;
- simplificar las reglas del dominio;
- ser pequeño y estable.

Un value object no debe:

- existir solo para "organizar archivos";
- duplicar una entidad;
- esconder una regla trivial;
- crecer hasta parecer un agregado;
- mezclar significado de negocio con formato técnico.

### 5.3. Ejemplos aplicados a TaxiGeo

Ejemplos de value objects plausibles o necesarios:

- `Money`
- `Distance`
- `PlatformIdentity`
- `PaymentMethodIdentity`
- `DateTimeRange`
- `TripChronology`
- `TripEconomics`
- `VisualIdentity`

### 5.4. Comparación por valor

Dos value objects son iguales si representan el mismo valor semántico, aunque sean instancias distintas.

La identidad de un value object no depende de memoria, referencia o ubicación física.

### 5.5. Inmutabilidad

La mutación directa de un value object debe evitarse.

Si cambia el valor, debe crearse una nueva instancia válida.

Esto protege la consistencia del dominio y evita estados intermedios difíciles de razonar.

---

## 6. Agregados

Un agregado es un límite de consistencia del dominio.

Su misión es proteger un conjunto de reglas relacionadas como una unidad coherente.

### 6.1. Aggregate Root

El Aggregate Root es la única puerta de entrada al agregado.

Todo acceso y toda modificación deben pasar por él o por reglas internas controladas por él.

### 6.2. Qué protege un agregado

Un agregado protege:

- consistencia interna;
- invariantes;
- identidad;
- reglas de transición;
- límites de modificación.

### 6.3. Cómo evitar referencias innecesarias

Un agregado no debe contener más relaciones de las necesarias para representar su significado.

Regla práctica:

- si la referencia no es necesaria para la identidad o la consistencia, no debe persistirse como vínculo fuerte;
- si la relación puede resolverse por identidad, debe resolverse por identidad;
- si un agregado necesita conocer demasiado de otro, la frontera está mal definida.

### 6.4. Agregados iniciales de TaxiGeo

Los agregados persistentes principales iniciales son:

- `Trip`
- `Workday`

#### Por qué `Trip`

`Trip` es el concepto central del dominio de TaxiGeo.

Representa un viaje real ocurrido en la actividad operativa del conductor y conserva identidad propia a lo largo del tiempo.

#### Por qué `Workday`

`Workday` representa la unidad operativa de memoria donde se organizan los viajes.

Posee identidad propia, puede cruzar medianoche y no debe inferirse de la fecha.

### 6.5. Relación entre agregados

- una jornada puede agrupar muchos viajes;
- un viaje puede estar asociado a una jornada;
- la jornada no depende del contenido interno de los viajes para existir;
- el viaje conserva su identidad aunque evolucione;
- la asociación entre agregados debe hacerse por identidad, no por mezcla de responsabilidades.

---

## 7. Servicios de dominio

Un Domain Service representa una regla o coordinación pura que pertenece al dominio pero no encaja de forma natural en una sola entidad o value object.

### 7.1. Cuándo existen

Un Domain Service existe cuando:

- la regla es pura;
- la regla pertenece al negocio;
- ninguna entidad individual debería cargar con ella;
- la lógica tiene significado de dominio claro;
- la coordinación sigue siendo conceptual, no técnica.

### 7.2. Cuándo no existen

No deben existir Domain Services cuando:

- la lógica es trivial;
- la responsabilidad pertenece claramente a una entidad;
- el comportamiento es una simple función de utilería;
- la lógica solo agrupa pasos técnicos;
- la capacidad pertenece a aplicación o infraestructura.

### 7.3. Qué problemas resuelven

Resuelven:

- reglas que cruzan varias entidades;
- cálculos puros de negocio;
- decisiones semánticas del dominio;
- coordinación conceptual sin efectos técnicos.

### 7.4. Diferencia con Application Services

Domain Service:

- vive en `src/domain/<module>/services/`;
- expresa una regla pura;
- no depende de infraestructura;
- no coordina casos de uso completos.

Application Service:

- vive en `src/application/services/`;
- reutiliza capacidades entre casos de uso;
- puede coordinar dominio e infraestructura;
- existe por eficiencia de orquestación, no por significado puro.

### 7.5. Regla de separación

Si la lógica cambia por significado del negocio, suele pertenecer al dominio.

Si la lógica cambia por coordinación de casos de uso, suele pertenecer a application services.

Si la lógica cambia por transporte, integración o almacenamiento, pertenece a infraestructura.

---

## 8. Puertos de persistencia en Application

La persistencia se coordina desde Application mediante puertos.

El dominio no define repositorios.

El dominio no pide persistencia.

El dominio no sabe si será guardado.

### 8.1. Qué son

Los puertos de persistencia son abstracciones de Application.

No son implementaciones.

No son consultas SQL.

No son motores de almacenamiento.

### 8.2. Qué operaciones deben contener

Los puertos de aplicación que coordinan persistencia deben permitir operaciones como:

- obtener por identidad;
- guardar un agregado;
- listar por criterios de dominio cuando sea necesario;
- recuperar colecciones coherentes con el lenguaje del dominio.

### 8.3. Qué nunca deben contener

Nunca deben contener:

- SQL;
- detalles de SQLite;
- mapeo físico;
- lógica de negocio;
- lógica de presentación;
- decisiones de infraestructura;
- cálculos derivados que pertenecen al dominio;
- reglas de validación que no sean de persistencia.

### 8.4. Dónde viven

Los contratos viven en `src/application/ports/`.

Los casos de uso coordinan la carga y persistencia de agregados mediante esos puertos.

Infrastructure implementa esos puertos.

### 8.5. Regla de uso

Si un puerto o su implementación empieza a contener comportamiento de negocio, deja de ser un puerto de persistencia y se ha convertido en una fuga de responsabilidades.

---

## 9. Reglas de negocio

Las reglas de negocio viven en el dominio.

Nunca deben vivir de forma primaria en:

- pantallas;
- hooks;
- Application Services;
- repositorios;
- SQL;
- mappers;
- infraestructura técnica.

### 9.1. Cómo evolucionan

Las reglas evolucionan cuando el negocio cambia.

No deben evolucionar para acomodar una limitación técnica.

### 9.2. Cómo reutilizarlas

Las reglas se reutilizan mediante:

- value objects;
- entidades;
- domain services;
- policies;
- specifications;
- factories.

### 9.3. Cómo evitar duplicarlas

Una regla solo debe existir una vez.

Si la misma lógica aparece en dos lugares:

- una de las dos copias es incorrecta;
- o la frontera del modelo está mal definida.

---

## 10. Invariantes

Un invariante es una condición que debe mantenerse verdadera para que el modelo siga siendo válido.

### 10.1. Qué son

Los invariantes protegen la coherencia interna del dominio.

### 10.2. Cómo protegerlas

Las invariantes deben protegerse:

- al crear;
- al modificar;
- al reconstituir;
- al transformar estado;
- al aceptar una operación del negocio.

### 10.3. Qué ocurre cuando una operación las rompe

Si una operación rompe una invariante:

- la operación debe fallar;
- el estado no debe quedar parcialmente válido;
- el error debe expresarse con un error de dominio claro;
- la infraestructura no debe "arreglarlo" silenciosamente.

### 10.4. Ejemplos relevantes en TaxiGeo

- un `Trip` conserva identidad aunque evolucione;
- un `Workday` mantiene identidad aunque cruce medianoche;
- lo derivable no debe reemplazar la semántica esencial;
- la ausencia de información opcional no invalida la existencia del hecho.

Una operación que rompe una invariante no debe continuar silenciosamente.

Debe fallar con un error de dominio claro.

---

## 11. Eventos de dominio

Un evento de dominio representa algo significativo que ocurrió dentro del dominio.

### 11.1. Cuándo utilizarlos

Usar eventos de dominio cuando:

- el hecho tiene valor semántico propio;
- conviene desacoplar una reacción futura;
- el negocio necesita expresar que "algo ocurrió";
- el evento ayuda a mantener la claridad del modelo.

### 11.2. Cuándo no utilizarlos

No utilizarlos cuando:

- solo añaden ruido;
- duplican estado;
- complican innecesariamente un modelo simple;
- no existe ninguna reacción real al hecho;
- la operación puede resolverse sin ellos.

### 11.3. Regla de prudencia

En TaxiGeo, los eventos de dominio son opcionales.

No deben introducirse por moda ni por anticipación excesiva.

Si una capacidad futura no los necesita, no deben existir.

Evitar event-driven innecesario para un proyecto local como TaxiGeo.

---

## 12. Factories

Una factory crea objetos del dominio cuando la creación requiere reglas explícitas o complejidad relevante.

### 12.1. Cuándo crear una

Crear una factory cuando:

- la construcción es compleja;
- hay varias combinaciones válidas;
- se deben proteger invariantes de creación;
- la intención de creación merece nombre propio;
- la lógica de inicialización no debería quedar repartida en el código cliente.

### 12.2. Cuándo no crear una

No crear una factory cuando:

- basta con una construcción directa clara;
- el objeto es trivial;
- la abstracción añade más ruido que valor;
- solo se usa una vez;
- la creación no tiene semántica de negocio.

### 12.3. Regla

Una factory debe simplificar el dominio, no disfrazar complejidad accidental.

No debe convertirse en una capa adicional por costumbre.

---

## 13. Policies

Una policy expresa una decisión del negocio cuando la decisión depende de contexto, preferencia o regla compuesta.

### 13.1. Propósito

Las policies ayudan a:

- aislar decisiones de negocio;
- mantener nombres explícitos;
- separar la regla de su consumo;
- evitar duplicar lógica de evaluación.

### 13.2. Ejemplos

Ejemplos de policy plausibles en TaxiGeo:

- cómo clasificar una operación según contexto operativo;
- cómo decidir si un viaje puede considerarse completado;
- cómo determinar una transición válida en un flujo concreto.

### 13.3. Cuándo no usarla

No hace falta una policy si:

- la decisión es una simple condición;
- la regla es obvia y local;
- la extracción no aporta claridad;
- el nombre no mejora la comprensión.

---

## 14. Specifications

Una specification expresa una condición de dominio reutilizable y nombrable.

### 14.1. Cuándo utilizar Specification

Usar una specification cuando:

- la condición se repite;
- el nombre aporta claridad;
- la evaluación es puramente de dominio;
- la regla puede componerse con otras;
- la intención de la condición es importante.

### 14.2. Cuándo una simple función basta

Una función simple basta cuando:

- la condición es trivial;
- solo se usa una vez;
- no merece una abstracción propia;
- la claridad se perdería con una carpeta adicional.

### 14.3. Regla

No convertir cada condición en una specification.

Solo merece existir cuando la semántica gana claridad real.

---

## 15. Errores del dominio

Los errores del dominio modelan fallos semánticos del negocio.

### 15.1. Cómo modelarlos

Los errores deben:

- tener significado explícito;
- describir la causa del fallo;
- permitir reaccionar de forma clara;
- no depender del formato de una excepción técnica;
- no ocultar el origen del problema.

### 15.2. Qué nunca debe lanzar el dominio

El dominio nunca debe lanzar:

- errores de UI;
- errores de red;
- errores de base de datos;
- errores de permisos;
- errores de librería;
- errores genéricos que borren la semántica del fallo.

Tampoco debe lanzar errores de infraestructura para cubrir fallos del negocio.

### 15.3. Regla de tratamiento

Si el dominio no puede aceptar una operación, debe expresarlo como error de dominio claro.

La capa exterior decide cómo traducir ese error a la experiencia de usuario o a la mecánica técnica.

---

## 16. Dependencias permitidas

El dominio es la capa más protegida del sistema.

Su dependencia debe ser mínima y controlada.

### 16.1. Diagrama ASCII

```text
src/domain/
    ↓
    (solo depende de sí mismo y de primitives neutrales)

Application
Presentation
UI
Infrastructure
Expo
React
SQLite
```

```text
Permitido:
src/domain/<module> -> src/domain/<other-module>   [excepcional y documentado]
src/domain/<module> -> src/shared/                [solo primitives y utilidades verdaderamente neutras]

Prohibido:
src/domain/<module> -> src/application/
src/domain/<module> -> src/presentation/
src/domain/<module> -> src/ui/
src/domain/<module> -> src/infrastructure/
src/domain/<module> -> React / Expo / SQLite / framework packages
```

### 16.2. Qué puede importar el dominio

El dominio puede importar:

- tipos neutrales y primitives verdaderamente compartidos;
- otros módulos del dominio solo si existe una relación semántica estable y documentada;
- errores y value objects del mismo subdominio;
- helpers puros sin semántica de infraestructura.

Un subdominio no debe importar otro subdominio por defecto.

Las dependencias entre subdominios son excepcionales.

Se prohíben las dependencias circulares.

Los módulos de soporte como `money`, `distance`, `date-time` e `identity` pueden actuar como lenguaje común.

`Trip` y `Workday` no deben contaminarse con detalles internos de subdominios futuros.

### 16.3. Qué nunca puede importar

El dominio nunca puede importar:

- Application;
- Presentation;
- UI;
- hooks;
- componentes React;
- navegación;
- providers;
- Infrastructure;
- repositorios concretos;
- SQLite;
- APIs del dispositivo;
- mappers físicos;
- servicios externos;
- scripts;
- configuraciones de runtime.

El dominio tampoco debe importar modelos de presentación, view models, DTOs, proyecciones, summaries, informes ni estructuras pensadas para pantalla o exportación.

### 16.4. Regla de independencia

Si una dependencia hace que el dominio necesite una librería concreta, esa dependencia está mal.

Si una dependencia hace que el dominio conozca un detalle técnico, esa dependencia está mal.

Si una dependencia hace que el dominio conozca una pantalla, esa dependencia está muy mal.

---

## 17. Evolución futura

La capa de dominio debe poder crecer sin perder claridad.

### 17.1. Cómo añadir nuevos subdominios

Solo se debe añadir un nuevo subdominio cuando exista:

- significado de negocio propio;
- reglas propias;
- necesidad de identidad propia o lenguaje propio;
- justificación documental suficiente;
- valor real para el producto.

### 17.2. Cómo dividir uno existente

Dividir un subdominio cuando:

- ha crecido demasiado;
- mezcla significados diferentes;
- contiene reglas que pertenecen a otro lenguaje;
- obliga a dependencias confusas;
- acumula responsabilidades no relacionadas.

### 17.3. Cómo evitar inflación del dominio

Evitar inflación significa:

- no convertir informes en dominios;
- no convertir pantallas en dominios;
- no convertir derivaciones en agregados;
- no convertir catálogos en entidades;
- no convertir capacidades técnicas en conceptos del negocio.

Una cosa puede derivarse del dominio sin pertenecer al dominio.

Derivación no equivale a propiedad.

### 17.4. Cómo mantener un núcleo pequeño

El núcleo debe permanecer pequeño para proteger:

- claridad;
- estabilidad;
- evolución;
- testabilidad;
- consistencia;
- gobernanza del lenguaje.

Si algo puede vivir fuera del core, debe vivir fuera del core.

---

## 18. Anti-patrones

Esta sección enumera errores frecuentes que deben evitarse de forma explícita.

### 18.1. Lógica en React

Error:

- poner reglas de negocio en componentes;
- calcular estados del dominio en pantallas;
- tomar decisiones de negocio en hooks de UI.

Consecuencia:

- duplicación;
- fragilidad;
- acoplamiento a la interfaz;
- imposibilidad de reutilizar la regla.

### 18.2. Lógica en repositorios

Error:

- convertir repositorios en servicios de negocio;
- decidir significado dentro de la persistencia;
- corregir datos silenciosamente en el acceso a datos.

Consecuencia:

- persistencia que manda sobre el dominio;
- reglas invisibles;
- comportamiento impredecible.

### 18.3. Lógica en SQLite

Error:

- depender de consultas para expresar negocio;
- usar el esquema como modelo semántico principal;
- construir reglas en SQL porque "ya está ahí".

Consecuencia:

- el dominio desaparece;
- la semántica queda atrapada en el motor;
- migrar se vuelve costoso.

### 18.4. Entidades anémicas

Error:

- entidades sin comportamiento;
- estado sin reglas;
- objetos usados solo como contenedores de datos.

Consecuencia:

- la lógica se dispersa;
- todo se mueve a servicios;
- el dominio pierde identidad.

### 18.5. Servicios gigantes

Error:

- un servicio que conoce demasiadas cosas;
- un servicio que mezcla coordinación, cálculo y acceso a datos;
- un servicio que se vuelve cajón de sastre.

Consecuencia:

- bajo mantenimiento;
- alta fragilidad;
- responsabilidad difusa.

### 18.6. Value objects innecesarios

Error:

- crear value objects para cualquier cosa;
- abstraer sin necesidad;
- multiplicar carpetas sin beneficio semántico.

Consecuencia:

- sobrearquitectura;
- ruido cognitivo;
- coste de mantenimiento innecesario.

### 18.7. Abuso de shared

Error:

- mover a shared lo que no se quiere ubicar;
- usar shared como contenedor de rechazo;
- esconder diferencias semánticas bajo una carpeta común.

Consecuencia:

- pérdida de fronteras;
- acoplamiento prematuro;
- dependencia indirecta difícil de rastrear.

### 18.8. Dependencia circular

Error:

- un subdominio importa a otro que a su vez importa al primero;
- la lógica se comparte por atajo en lugar de por diseño.

Consecuencia:

- acoplamiento fuerte;
- imposibilidad de refactorizar;
- arquitectura inestable.

### 18.9. Agregado gigante

Error:

- un agregado que intenta representar demasiados conceptos;
- un root que absorbe responsabilidades ajenas;
- una frontera demasiado amplia.

Consecuencia:

- consistencia difícil;
- rendimiento peor;
- evolución rígida.

### 18.10. Duplicación de reglas

Error:

- repetir la misma validación en varios niveles;
- copiar la misma lógica entre casos de uso;
- duplicar una regla en UI, dominio y persistencia.

Consecuencia:

- inconsistencias;
- bugs silenciosos;
- coste de mantenimiento alto.

### 18.11. Inflar el core con subdominios decorativos

Error:

- crear raíces de dominio para informes, resúmenes o capacidades derivadas sin justificación suficiente;
- convertir una proyección en un subdominio central;
- confundir soporte con núcleo.

Consecuencia:

- núcleo innecesariamente grande;
- pérdida de foco arquitectónico;
- dificultad para mantener el dominio pequeño.

### 18.12. Reglas sin nombre

Error:

- dejar lógica importante dispersa en condicionales;
- no extraer una regla que ya tiene significado propio.

Consecuencia:

- código opaco;
- mal lenguaje del negocio;
- dificultad para verificar el dominio.

### 18.13. Modelos de presentación como dominio

Error:

- usar view models, DTOs, proyecciones, summaries, informes o estructuras de exportación como si fueran dominio;
- confundir una representación derivada con un concepto del negocio;
- asumir que porque algo se calcula desde el dominio ya pertenece al dominio.

Consecuencia:

- fuga de responsabilidades;
- lenguaje confuso;
- contaminación del core con formas de salida.

---

## 19. Resumen normativo

La capa de dominio de TaxiGeo 1.0 debe cumplir estas reglas:

- modela el negocio, no la implementación;
- protege el lenguaje oficial del producto;
- mantiene el core inicial pequeño y centrado en `Trip` y `Workday`;
- usa módulos de soporte solo cuando aportan significado real;
- define entidades, value objects, agregados, policies, specifications, factories, services y errores con disciplina;
- nunca depende de Application, Presentation, UI o Infrastructure;
- nunca conoce React, Expo, SQLite ni el detalle físico del sistema;
- crece con prudencia y se divide cuando el significado cambia;
- evita sobrearquitectura y evita inflación del core.

`src/shared/` es excepcional y pequeño.

No es el lugar normal de reutilización.

No puede contener lógica de negocio.

No puede contener conceptos ambiguos.

Si algo tiene significado de negocio, pertenece a un subdominio.

Si algo pertenece a un caso de uso, pertenece a `src/application/`.

Si un modelo no ayuda a entender, proteger o evolucionar el negocio, no pertenece al dominio.

Si una abstracción no mejora el significado, no debe existir.

Si una ampliación rompe la claridad del núcleo, la ampliación es incorrecta.

TaxiGeo debe mantener un dominio pequeño, fuerte y estable durante años.
