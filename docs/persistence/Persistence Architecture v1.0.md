# Persistence Architecture v1.0

## Propósito

Este documento define la arquitectura de persistencia de TaxiGeo desde el punto de vista del dominio.

Su función es explicar cómo se conecta el dominio con la persistencia sin convertir la persistencia en fuente de verdad del negocio.

No describe SQLite, SQL, tablas, columnas, índices ni migraciones.

## 1. Objetivos

La persistencia de TaxiGeo existe para conservar la memoria operativa del producto de forma fiel al dominio aprobado.

Sus objetivos son:

- conservar viajes y jornadas como hechos reales del negocio;
- permitir reconstruir Aggregates completos a partir de la información persistida;
- preservar conocimiento parcial sin perder identidad;
- mantener separada la información derivada de la información esencial;
- permitir que el dominio siga siendo la fuente de verdad;
- sostener la evolución futura del producto sin contaminar el modelo del negocio.

La persistencia no existe para decidir comportamiento.

Tampoco existe para reinterpretar el dominio ni para compensar limitaciones del prototipo.

## 2. Principios

1. El dominio nunca depende de la persistencia.
2. La persistencia representa al dominio, no al revés.
3. Los repositorios de Infrastructure reconstruyen Aggregates completos o parciales según el estado real conservado.
4. Nunca se persisten datos derivados como conocimiento primario.
5. La persistencia no contiene lógica de negocio.
6. La identidad del Aggregate pertenece al dominio y no a la forma física de almacenarlo.
7. La persistencia debe conservar hechos operativos, no interpretaciones.
8. La información de referencia o catálogo no redefine el Aggregate principal.
9. La ausencia de información opcional no invalida la identidad del hecho conservado.
10. Cada cambio persistido debe poder justificarse desde el dominio aprobado.

## 3. Responsabilidades

### Domain

El dominio define qué es un viaje, qué es una jornada y qué información forma parte de cada uno.

Puede:

- validar reglas del negocio;
- conservar identidad;
- expresar conocimiento parcial;
- evolucionar sin perder continuidad.

Nunca debe:

- conocer detalles de persistencia;
- depender de repositorios;
- decidir cómo se almacena la información;
- incorporar lógica técnica de lectura o escritura.

### Application

Application representa intenciones completas del negocio.

Puede:

- coordinar casos de uso;
- construir nuevos Aggregates desde reglas de dominio;
- pedir lecturas y escrituras a través de puertos de Application;
- decidir el orden de una operación de negocio.

Nunca debe:

- contener lógica persistente propia;
- reinterpretar el modelo del dominio;
- duplicar reglas del dominio;
- decidir detalles físicos de almacenamiento.

### Repository

El repositorio es la implementación de un puerto de Application en el límite entre la coordinación de negocio y la persistencia.

Puede:

- leer información persistida;
- reconstituir Aggregates;
- conservar Aggregates tras una creación o una modificación;
- ocultar la forma física de la persistencia al resto del sistema.

Nunca debe:

- tomar decisiones de negocio;
- alterar la semántica del dominio;
- inventar información;
- persistir datos derivados como si fueran esenciales;
- exponer detalles físicos hacia el dominio;
- definir contratos de persistencia desde el dominio.

### Mapper

El Mapper solo es necesario si hace falta traducir entre la forma persistida y la forma del dominio.

Puede:

- convertir representaciones persistidas en información apta para reconstituir Aggregates;
- convertir Aggregates en una representación persistible equivalente;
- concentrar reglas de transformación estructural que no son de negocio.

Nunca debe:

- calcular reglas del dominio;
- decidir qué significa un dato;
- modificar identidad;
- contener comportamiento del negocio;
- convertirse en un segundo modelo de dominio.

### Infrastructure

Infrastructure sostiene la mecánica necesaria para leer y escribir persistencia.

Puede:

- ejecutar lecturas;
- ejecutar escrituras;
- orquestar accesos técnicos;
- servir de soporte a repositorios de Infrastructure y mappers;

Nunca debe:

- decidir reglas del dominio;
- imponer el modelo físico al dominio;
- contener conocimiento de negocio;
- sustituir a Application o Domain.

## 4. Flujo de lectura

El flujo de lectura conceptual es:

**Persistencia física → Repository de Infrastructure → Aggregate → Application**

Secuencia:

1. La persistencia conserva la representación física de hechos ya registrados.
2. El Repository de Infrastructure recupera esa representación.
3. El Repository de Infrastructure reconstituye el Aggregate correspondiente.
4. El Aggregate vuelve a existir con la semántica del dominio.
5. Application consume ese Aggregate para continuar una intención del negocio.

Este flujo tiene una regla central:

- la persistencia nunca se interpreta sola;
- siempre se interpreta a través del dominio.

El resultado no es un registro técnico.

El resultado es un Aggregate con identidad y significado de negocio.

## 5. Flujo de escritura

La escritura persiste el estado válido del Aggregate en el momento de la operación.

Existen dos situaciones conceptuales:

### Creación de Aggregate

Ocurre cuando el dominio incorpora por primera vez un hecho operativo real.

El Aggregate nace en el dominio con su identidad y su conocimiento inicial.

La persistencia conserva esa representación inicial sin exigir que el conocimiento esté completo.

### Modificación de Aggregate existente

Ocurre cuando un Aggregate ya conservado evoluciona sin perder identidad.

La persistencia actualiza la representación del mismo hecho operativo, no la de un hecho nuevo.

Esto debe respetar el patrón de transición de Aggregate:

- primero existe el Aggregate en el dominio;
- después se persiste su representación válida;
- más tarde puede reconstituirse, evolucionar y volver a persistirse;
- la identidad permanece estable en todo el ciclo.

La escritura nunca debe convertir un cambio de conocimiento en un cambio de identidad.

## 6. Reconstitución

Reconstituir un Aggregate significa devolver a existir en el dominio un hecho operativo ya conservado.

La reconstitución no crea un viaje nuevo ni una jornada nueva.

Solo recupera la representación del mismo hecho con la identidad original y con el nivel de conocimiento que la persistencia pueda aportar en ese momento.

La reconstitución debe respetar estas condiciones:

- la identidad permanece inalterada;
- la información obligatoria vuelve como parte del Aggregate;
- la información opcional puede estar presente o no;
- los datos derivados no se reconstruyen como si fueran esenciales;
- el Aggregate recupera su coherencia de dominio antes de salir del repositorio.

La reconstitución es una operación de retorno al dominio, no una simple lectura técnica.

## 7. Evolución

La arquitectura de persistencia debe permitir evolucionar sin romper el dominio operativo.

### Sincronización

Cuando el producto incorpore sincronización, el modelo de persistencia actual no debe contaminarse con conceptos de sincronización si esos conceptos no pertenecen al dominio operativo.

La evolución deberá introducir el conocimiento específico en un dominio propio, manteniendo separado el núcleo operativo.

### Múltiples dispositivos

La existencia de varios dispositivos no cambia qué es un viaje ni qué es una jornada.

Si esa capacidad aparece en el producto, deberá organizarse sin alterar la semántica del dominio persistente actual.

### IA

La IA puede consumir viajes y jornadas, pero no redefine su persistencia.

Si aporta nueva capacidad, deberá hacerlo desde un dominio complementario o desde servicios de apoyo, nunca apropiándose de la definición persistente central.

### Nuevas funcionalidades

Toda nueva funcionalidad debe evaluarse con esta pregunta:

¿pertenece al núcleo persistente del viaje o de la jornada, o solo lo consume?

Si solo lo consume, no debe contaminar el esquema físico del dominio operativo.

Si lo redefine, debe justificarse como parte del dominio aprobado.

La arquitectura actual está preparada para crecer porque separa:

- identidad;
- representación persistente;
- conocimiento derivado;
- capacidades de apoyo;
- y responsabilidades técnicas.
