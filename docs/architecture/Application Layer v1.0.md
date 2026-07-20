# Application Layer v1.0

## 0. Propósito

Este documento define la capa de Application de TaxiGeo 1.0.

Su función es establecer cómo se coordinan las intenciones completas del negocio sin mezclar reglas puras del dominio ni detalles técnicos de infraestructura.

Este documento debe leerse junto con:

- `docs/architecture/Project Structure v1.0.md`
- `docs/architecture/Domain Layer v1.0.md`
- `docs/persistence/Persistence Architecture v1.0.md`

---

## 1. Misión

Application representa lo que el usuario o el sistema quieren hacer.

No define el significado del negocio.

No implementa infraestructura.

No decide representación visual.

No contiene lógica de UI.

### 1.1. Responsabilidades

Application debe:

- coordinar casos de uso;
- orquestar reglas de dominio;
- solicitar lectura o persistencia mediante puertos;
- agrupar pasos de negocio en una intención completa;
- devolver resultados claros para Presentation o UI.

### 1.2. Responsabilidades que nunca tendrá

Application nunca debe:

- duplicar reglas del dominio;
- contener lógica de UI;
- depender de React;
- depender de Expo;
- depender de SQLite;
- conocer componentes visuales;
- conocer navegación;
- implementar accesos técnicos concretos;
- decidir cómo se almacena el estado.

---

## 2. Filosofía

Application existe entre el dominio y el mundo exterior.

Su tarea es coordinar, no inventar.

### 2.1. Principios

1. Cada caso de uso representa una intención completa.
2. La coordinación vive en Application, no en la UI.
3. El dominio valida significado; Application coordina ejecución.
4. Los detalles técnicos se resuelven fuera de Application.
5. Application depende de contratos, no de implementaciones.
6. Una intención debe tener un único lugar de ejecución.

### 2.2. Relación con el dominio

Application consume el dominio como fuente de verdad.

Puede:

- crear agregados;
- modificar agregados;
- reconstituir agregados mediante puertos;
- invocar services de dominio;
- decidir el orden de una operación.

No puede:

- reinterpretar el significado del dominio;
- redefinir reglas puras;
- absorber conocimiento visual;
- convertirse en una segunda capa de reglas.

---

## 3. Organización oficial

La estructura oficial de Application es:

```text
src/application/
├── trips/
├── workdays/
├── services/
├── ports/
├── dtos/
└── commands/
```

### 3.1. `trips/`

Casos de uso y coordinación relacionados con viajes.

Ejemplos:

- iniciar viaje;
- finalizar viaje;
- crear viaje manual;
- editar viaje;
- eliminar viaje.

### 3.2. `workdays/`

Casos de uso y coordinación relacionados con jornadas.

Ejemplos:

- abrir jornada;
- cerrar jornada;
- resolver jornada activa.
- la Home puede seguir "hoy" o una fecha histórica, pero la identidad de jornada sigue viniendo de `workdayId` y `startTime`.

### 3.3. `services/`

Application Services reutilizables.

Se usan cuando la coordinación no pertenece de forma natural a un solo caso de uso.

### 3.4. `ports/`

Contratos que Application necesita para hablar con el exterior.

Incluyen puertos de lectura, persistencia, APIs técnicas o cualquier dependencia invertida.

### 3.5. `dtos/`

Objetos de entrada y salida de Application.

No son dominio.

No son UI.

### 3.6. `commands/`

Modelos que expresan intención de escritura o modificación.

### 3.7. Cuándo crear carpetas nuevas

Solo se crea una nueva carpeta cuando exista una intención de negocio diferenciada o una capacidad reutilizable real.

No se crean carpetas por simetría estética.

No se crean carpetas vacías.

---

## 4. Casos de uso

Un caso de uso ejecuta una intención completa del negocio.

### 4.1. Propiedades

- tiene una única intención;
- coordina pasos de negocio;
- usa dominio y puertos;
- devuelve un resultado claro;
- no conoce la interfaz;
- no conoce el almacenamiento físico.

### 4.2. Qué no debe contener

- reglas puras duplicadas;
- presentación;
- acceso técnico directo;
- lógica de navegación;
- lógica de renderizado.

### 4.3. Reglas de diseño

- un caso de uso por intención;
- una responsabilidad por archivo;
- no mezclar lectura y escritura salvo que la intención lo requiera;
- no convertir un caso de uso en un servicio genérico.

---

## 5. Application Services

Un Application Service es una capacidad reutilizable de coordinación.

### 5.1. Cuándo existen

Existen cuando:

- la misma coordinación se repite en varios casos de uso;
- la lógica es de aplicación, no de dominio;
- la capacidad aporta claridad y reduce duplicación.

### 5.2. Cuándo no existen

No deben existir cuando:

- la coordinación pertenece a un solo caso de uso;
- la lógica es puramente del dominio;
- la reutilización solo añade abstracción.

### 5.3. Diferencia con Domain Services

Domain Service:

- vive en el dominio;
- expresa una regla pura.

Application Service:

- vive en `src/application/services/`;
- coordina pasos reutilizables;
- puede hablar con puertos.

---

## 6. Ports

Los puertos son contratos de Application.

### 6.1. Qué son

- abstracciones de entrada o salida;
- interfaces que permiten invertir dependencias;
- límites entre Application y el mundo exterior.

### 6.2. Qué no son

- implementaciones;
- repositorios concretos;
- mappers;
- servicios técnicos;
- adaptadores de infraestructura.

### 6.3. Reglas

- los puertos expresan necesidades de Application;
- Infrastructure los implementa;
- el dominio no define puertos de persistencia;
- la UI no define puertos de negocio.

---

## 7. Dependencias permitidas

```text
UI
  ↓
Presentation
  ↓
Application
  ↓
Domain

Infrastructure ───► implementa puertos de Application
```

Application puede depender de:

- Domain;
- sus propios puertos;
- servicios internos de Application;
- DTOs y commands propios.

Application no puede depender de:

- UI;
- Presentation;
- Infrastructure;
- React;
- Expo;
- SQLite;
- navegación;
- providers.

---

## 8. Evolución

Application debe crecer con el negocio.

### 8.1. Añadir capacidades

Se añade un nuevo caso de uso cuando aparece una nueva intención completa.

### 8.2. Dividir capacidades

Se divide cuando:

- una clase conoce demasiadas intenciones;
- una coordinación ya no tiene un propósito claro;
- el flujo se vuelve difícil de testear.

### 8.3. Evitar inflación

Application no debe absorber:

- presentación;
- dominio puro;
- infraestructura concreta;
- utilidades genéricas.
