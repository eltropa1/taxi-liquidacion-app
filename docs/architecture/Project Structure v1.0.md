# Project Structure v1.0

## 0. Estado y propósito

Este documento define la estructura oficial, definitiva y recomendada para TaxiGeo 1.0 construido desde cero.

Su objetivo es fijar una organización profesional del proyecto que:

- proteja el dominio como fuente de verdad;
- mantenga la arquitectura independiente de la implementación histórica;
- preserve la separación entre negocio, coordinación, presentación e infraestructura;
- permita crecer sin mezclar responsabilidades;
- haga explícito dónde vive cada tipo de conocimiento.

Esta estructura no describe el prototipo existente.

Describe cómo debe organizarse TaxiGeo si se construyera correctamente hoy, con todo el conocimiento validado por el producto y por los documentos oficiales de dominio, persistencia y arquitectura.

---

## 1. Filosofía de organización

TaxiGeo se organiza alrededor del negocio, no alrededor de pantallas, librerías o tablas.

La pregunta central nunca es "¿en qué archivo cabe esto?".

La pregunta correcta es "¿a qué concepto pertenece este conocimiento?".

Cada pieza del sistema debe responder a una única responsabilidad y vivir en un único lugar.

La estructura del proyecto debe permitir:

- localizar rápidamente el propietario de cada regla;
- evitar duplicación de lógica;
- impedir que la UI conozca decisiones de negocio;
- impedir que la persistencia decida comportamiento;
- mantener el dominio pequeño, claro y protegido;
- añadir capacidades nuevas sin romper las existentes.

La estructura es una consecuencia de la arquitectura, no al revés.

---

## 2. Principios de organización

### 2.1. Principios base

1. El dominio es el centro del sistema.
2. La aplicación coordina intenciones completas del negocio.
3. La presentación transforma datos ya resueltos en contratos útiles para la interfaz.
4. La UI muestra y captura interacción, pero no decide reglas.
5. La infraestructura implementa detalles técnicos, pero no define el negocio.
6. La persistencia conserva hechos, no interpretaciones.
7. Los módulos compartidos existen solo cuando el conocimiento es realmente transversal y puro.
8. Una dependencia debe apuntar hacia dentro, nunca hacia fuera.
9. Una responsabilidad debe tener un solo propietario.
10. Si una capacidad no pertenece al dominio central, no debe infiltrarse en él.

### 2.2. Reglas de diseño

- Si algo cambia por motivos de negocio, pertenece al dominio o a la aplicación.
- Si algo cambia por motivos técnicos, pertenece a infraestructura.
- Si algo cambia por motivos de representación, pertenece a presentación o UI.
- Si algo solo reutiliza una transformación pura, puede ir a `shared`.
- Si algo necesita conocer una librería concreta, no pertenece a dominio ni a aplicación.

### 2.3. Regla de oro

Toda decisión de estructura debe poder justificarse así:

> "Si mañana cambiamos React, SQLite, Expo o la estrategia de persistencia, ¿seguiría teniendo sentido esta organización?"

Si la respuesta es no, la organización es incorrecta.

---

## 3. Capas oficiales

TaxiGeo debe organizarse siguiendo Clean Architecture con separación explícita de responsabilidades.

```text
UI / Routes
   ↓
Presentation
   ↓
Application
   ↓
Domain
   ↑
Infrastructure
```

### 3.1. UI / Routes

La UI es la capa visible para el usuario.

Incluye:

- pantallas;
- navegación;
- componentes React;
- composición visual;
- interacción.

La UI nunca debe contener reglas de negocio.

### 3.2. Presentation

Presentation convierte datos y reglas ya resueltas en contratos listos para la UI.

Incluye:

- proyecciones;
- view models;
- formateos de representación;
- adaptaciones visuales no interactivas.

Presentation no decide negocio.

### 3.3. Application

Application representa intenciones completas del negocio.

Incluye:

- casos de uso;
- orquestación;
- coordinación entre dominio e infraestructura;
- contratos de entrada y salida;
- puertos de lectura/escritura.

Application no contiene reglas puras que ya pertenezcan al dominio.

### 3.4. Domain

Domain contiene el conocimiento puro del negocio.

Incluye:

- agregados;
- entidades;
- value objects;
- reglas puras;
- invariantes;
- políticas;
- servicios de dominio;
- catálogos de significado.

Domain no conoce React, navegación, SQLite ni APIs técnicas.

### 3.5. Infrastructure

Infrastructure implementa detalles técnicos.

Incluye:

- persistencia;
- repositorios concretos;
- mappers físicos;
- geolocalización;
- sistema de archivos;
- APIs del dispositivo;
- servicios externos.

Infrastructure no define el negocio.

---

## 4. Organización oficial del proyecto

La estructura oficial recomendada es la siguiente.

```text
/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── trip/
│   │   ├── new.tsx
│   │   └── edit.tsx
│   ├── workday/
│   │   ├── index.tsx
│   │   └── detail.tsx
│   ├── summary/
│   │   ├── index.tsx
│   │   └── detail.tsx
│   ├── goals/
│   │   └── index.tsx
│   └── settings/
│       └── index.tsx
├── assets/
│   ├── fonts/
│   ├── images/
│   ├── icons/
│   └── splash/
├── docs/
│   ├── architecture/
│   ├── domain/
│   ├── persistence/
│   ├── design/
│   ├── backlog/
│   └── reference/
├── scripts/
│   ├── data/
│   ├── geo/
│   ├── maintenance/
│   └── migration/
├── src/
│   ├── bootstrap/
│   │   ├── persistence/
│   │   ├── application/
│   │   ├── providers/
│   │   └── runtime/
│   ├── application/
│   │   ├── trips/
│   │   ├── workdays/
│   │   └── services/
│   ├── domain/
│   │   ├── trips/
│   │   ├── workdays/
│   │   ├── money/
│   │   ├── distance/
│   │   ├── platform/
│   │   ├── payment/
│   │   ├── visual/
│   │   ├── date-time/
│   │   └── identity/
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── database/
│   │   │   ├── mappers/
│   │   │   ├── repositories/
│   │   │   └── migrations/
│   │   ├── geolocation/
│   │   ├── filesystem/
│   │   └── device/
│   ├── presentation/
│   │   ├── trips/
│   │   ├── workdays/
│   │   ├── summaries/
│   │   ├── goals/
│   │   ├── geo/
│   │   └── visual/
│   ├── ui/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── layout/
│   │   └── providers/
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── types/
│   │   └── utils/
│   ├── config/
│   │   ├── env/
│   │   ├── di/
│   │   ├── feature-flags/
│   │   └── runtime/
│   └── resources/
│       ├── catalogs/
│       ├── seeds/
│       ├── locale/
│       └── generated/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
├── .gitignore
├── app.json
├── eas.json
├── eslint.config.js
├── jest.config.js
├── metro.config.js
├── package.json
├── tsconfig.json
└── README.md
```

### 4.1. Interpretación del árbol

- `app/` contiene solo las rutas y la composición mínima de pantalla.
- `src/` contiene el código de negocio, coordinación y soporte técnico.
- `assets/` contiene binarios y recursos estáticos.
- `docs/` contiene la documentación normativa y de referencia.
- `scripts/` contiene utilidades ejecutables y tareas de mantenimiento.
- `tests/` contiene la estrategia de verificación transversal.
- los archivos de configuración raíz describen cómo se ejecuta el proyecto.

---

## 5. Responsabilidad de cada carpeta

### 5.1. `app/`

Responsabilidad:

- exponer la aplicación a Expo Router;
- declarar rutas;
- componer pantallas;
- montar layouts;
- delegar la lógica real a `src/ui` y `src/bootstrap`.

Reglas:

- las rutas deben ser delgadas;
- no deben contener reglas de negocio;
- no deben hablar directamente con persistencia;
- no deben convertirse en una segunda capa de aplicación.

### 5.2. `assets/`

Responsabilidad:

- almacenar imágenes, iconos, fuentes y otros recursos binarios;
- servir como entrada estática para la UI.

Reglas:

- no contiene lógica;
- no contiene datos del dominio;
- no contiene configuraciones de negocio.

### 5.3. `docs/`

Responsabilidad:

- recoger las normas oficiales del producto;
- documentar arquitectura, dominio, persistencia y diseño;
- registrar decisiones aprobadas;
- servir como referencia para evolución futura.

Subcarpetas oficiales:

- `docs/architecture/`: reglas de estructura, capas, dependencias y evolución.
- `docs/domain/`: definiciones del dominio y sus subdominios.
- `docs/persistence/`: modelo persistente y arquitectura de persistencia.
- `docs/design/`: lenguaje visual y criterios de representación.
- `docs/backlog/`: trabajo pendiente o decisiones en cola.
- `docs/reference/`: material de apoyo no normativo.

### 5.4. `scripts/`

Responsabilidad:

- ejecutar tareas de apoyo fuera del runtime normal;
- generar datos;
- importar o transformar información;
- realizar mantenimiento puntual.

Subcarpetas recomendadas:

- `scripts/data/`: importaciones, normalizaciones y tareas de datos.
- `scripts/geo/`: generación y mantenimiento de catálogos geográficos.
- `scripts/maintenance/`: limpieza, validación y tareas administrativas.
- `scripts/migration/`: migraciones puntuales y utilidades de transición.

Reglas:

- un script no debe convertirse en lógica de negocio viva;
- no debe ser importado por la aplicación;
- no debe sustituir a un caso de uso.

### 5.5. `src/`

Responsabilidad:

- concentrar el código fuente del producto;
- organizar el sistema por capas y dominios;
- separar lo que es negocio de lo que es técnico.

---

## 6. Organización del dominio

El dominio se organiza por conceptos de negocio, no por pantallas.

### 6.1. `src/domain/trips/`

Responsabilidad:

- representar el viaje como hecho operativo conservado;
- proteger su identidad e invariantes;
- modelar cronología, clasificación y economía;
- contener reglas puras de viaje.

Subcarpetas recomendadas:

- `aggregates/`: agregados y entidades principales.
- `value-objects/`: cronología, importes, identificadores y clasificaciones.
- `services/`: reglas puras que no pertenecen a un solo objeto.
- `policies/`: decisiones de negocio basadas en invariantes.
- `events/`: eventos de dominio, solo si aportan valor real.

### 6.2. `src/domain/workdays/`

Responsabilidad:

- representar la jornada como unidad operativa de memoria;
- proteger su identidad propia;
- modelar apertura y cierre de jornada;
- contener reglas puras de jornada.

### 6.3. `src/domain/visual/`

Responsabilidad:

- definir el lenguaje visual oficial del producto;
- mantener la identidad visual de plataformas, servicios y métodos de pago;
- ofrecer catálogos visuales estables y reutilizables.

Importante:

- el dominio visual no pertenece a un componente;
- no pertenece a una pantalla;
- no pertenece a un hook;
- no pertenece a un tema visual improvisado.

### 6.4. `src/domain/money/`

Responsabilidad:

- representar importes, tarifas, cobros y cálculos monetarios puros;
- proteger el significado del dinero sin depender de redondeos técnicos;
- servir como base para viajes y liquidaciones.

### 6.5. `src/domain/distance/`

Responsabilidad:

- representar distancias, recorridos y medidas espaciales puras;
- servir como apoyo al core sin convertirse en geolocalización técnica;
- evitar mezclar distancia física con posición cruda.

### 6.6. `src/domain/platform/`

Responsabilidad:

- representar plataformas como identidad de negocio estable;
- sostener la clasificación operativa de los viajes;
- no confundir plataforma con integración técnica o proveedor.

### 6.7. `src/domain/payment/`

Responsabilidad:

- representar métodos de pago y reglas monetarias asociadas;
- mantener la semántica del cobro separada de la infraestructura financiera;
- servir de soporte al viaje y a sus proyecciones.

### 6.8. `src/domain/date-time/`

Responsabilidad:

- representar instantes, rangos, zonas horarias y operaciones temporales puras;
- sostener la cronología de viajes y jornadas;
- evitar mezclar tiempo de negocio con formatos de UI.

### 6.9. `src/domain/identity/`

Responsabilidad:

- representar identidades, claves y referencias estables;
- unificar primitives de identificación cuando sean verdaderamente transversales;
- no absorber catálogos, agregados ni detalles de persistencia.

### 6.10. Capas de dominio no core

No se crean como raíces permanentes del dominio inicial:

- `summaries/`
- `goals/`
- `geo/`

Si aparecen en el producto, deberán resolverse como:

- proyecciones;
- servicios de lectura;
- capacidades derivadas;
- infraestructura técnica;
- o futuros dominios aprobados de forma explícita.

Regla:

- si un concepto se puede nombrar con claridad dentro de un contexto concreto, no debe pasar a `src/shared/`.

---

## 7. Organización de la aplicación

Application se organiza por intención de negocio.

### 7.1. `src/application/trips/`

Responsabilidad:

- ejecutar casos de uso relacionados con viajes;
- coordinar dominio, validación y persistencia;
- exponer contratos de entrada y salida.

Subcarpetas recomendadas:

- `use-cases/`: casos de uso concretos.
- `ports/`: interfaces que la infraestructura debe implementar.
- `dtos/`: objetos de entrada y salida de la aplicación.
- `commands/`: modelos de intención mutante o escritura.

Ejemplos:

- `StartTrip`
- `FinishTrip`
- `CreateManualTrip`
- `UpdateTrip`
- `DeleteTrip`

### 7.2. `src/application/workdays/`

Responsabilidad:

- abrir y cerrar jornadas;
- coordinar la resolución de la jornada activa;
- definir la intención operativa alrededor del calendario de trabajo.

### 7.3. `src/application/services/`

Responsabilidad:

- concentrar capacidades reutilizables de aplicación;
- evitar duplicar flujo entre casos de uso;
- orquestar operaciones que no representan una intención completa del usuario.

Subcarpetas recomendadas:

- `reading/`: servicios de lectura y consulta reutilizable.
- `orchestration/`: coordinación de capacidades compartidas entre casos de uso.
- `reporting/`: composición de datos para salidas no interactivas.

Qué es un Application Service:

- una capacidad reutilizable de aplicación;
- puede coordinar dominio e infraestructura;
- no representa necesariamente una intención completa del usuario;
- se consume desde casos de uso cuando hay lógica compartida.

Qué no es:

- un caso de uso completo;
- una pantalla;
- una proyección de UI;
- una utilidad genérica sin semántica;
- una copia de un Domain Service.

### 7.4. Reglas de Services

Los casos de uso pueden consumir `src/application/services/` cuando:

- la lógica se repite entre varios casos de uso;
- la capacidad es reutilizable y estable;
- la coordinación no pertenece a un único flujo.

Qué es un Domain Service:

- una regla o coordinación pura que pertenece al dominio;
- no depende de infraestructura ni de UI;
- vive en `src/domain/<module>/services/`.

Qué es un Infrastructure Service:

- un adaptador técnico con comportamiento reutilizable;
- vive en `src/infrastructure/`;
- resuelve acceso, transporte o integración externa.

Qué no debe ir a `src/shared/`:

- casos de uso;
- reglas de negocio;
- orquestación de aplicación;
- adaptadores técnicos con semántica propia;
- proyecciones de presentación;
- catálogos de dominio.

Regla:

- `shared` solo guarda primitives y utilidades verdaderamente transversales.

---

## 8. Organización de la infraestructura

Infrastructure implementa los detalles técnicos.

### 8.1. `src/infrastructure/persistence/`

Responsabilidad:

- guardar y reconstruir hechos del dominio;
- implementar repositorios concretos;
- encapsular mappers físicos;
- aislar el motor de persistencia.

Subcarpetas recomendadas:

- `database/`: inicialización técnica, conexiones y acceso de bajo nivel.
- `mappers/`: traducción entre modelos del dominio y representaciones persistibles.
- `repositories/`: implementaciones concretas de los puertos.
- `migrations/`: evolución física del almacenamiento.

Reglas:

- la persistencia nunca decide negocio;
- la persistencia nunca inventa datos;
- la persistencia nunca se convierte en modelo de dominio paralelo.

### 8.2. `src/infrastructure/geolocation/`

Responsabilidad:

- integrar APIs de geolocalización;
- adaptar el entorno del dispositivo;
- devolver datos técnicos listos para ser consumidos por la aplicación.

### 8.3. `src/infrastructure/filesystem/`

Responsabilidad:

- leer y escribir archivos cuando el producto lo necesite;
- encapsular permisos, rutas y operaciones del sistema de archivos.

### 8.4. `src/infrastructure/device/`

Responsabilidad:

- agrupar adaptadores de capacidades del dispositivo;
- mantener fuera del dominio detalles como vibración, sensores o permisos.

## 9. Organización de la presentación

Presentation es la capa de proyección.

### 9.1. `src/presentation/trips/`

Responsabilidad:

- convertir viajes en contratos listos para UI;
- preparar orden, formato y estructura visual;
- no decidir negocio.

### 9.2. `src/presentation/workdays/`

Responsabilidad:

- proyectar jornadas para su consumo visual;
- adaptar estados y etiquetas para la interfaz.

### 9.3. `src/presentation/summaries/`

Responsabilidad:

- construir proyecciones de resúmenes;
- preparar datos agregados ya resueltos.

### 9.4. `src/presentation/goals/`

Responsabilidad:

- preparar contratos de representación de objetivos;
- no calcular objetivos.

### 9.5. `src/presentation/geo/`

Responsabilidad:

- transformar información geográfica en contratos de lectura;
- preparar mapas, zonas o listas para consumo visual.

### 9.6. `src/presentation/visual/`

Responsabilidad:

- exponer la identidad visual ya resuelta;
- convertir catálogos visuales en contratos reutilizables.

Regla:

- Presentation transforma, nunca decide.

---

## 10. Organización de la UI

La UI contiene React, navegación y composición visual.

### 10.1. `src/ui/screens/`

Responsabilidad:

- definir pantallas completas reutilizables;
- componer componentes, hooks y contratos de presentación;
- delegar toda decisión de negocio a capas inferiores.

### 10.2. `src/ui/components/`

Responsabilidad:

- ofrecer componentes reutilizables de interfaz;
- ser lo más tontos posible respecto al negocio;
- recibir datos ya resueltos.

### 10.3. `src/ui/hooks/`

Responsabilidad:

- coordinar estado de pantalla;
- conectar UI con Application;
- orquestar efectos de interacción;
- nunca contener reglas de negocio propias.

### 10.4. `src/ui/navigation/`

Responsabilidad:

- encapsular navegación y rutas lógicas;
- evitar que el resto de la UI conozca detalles de enrutado.

### 10.5. `src/ui/layout/`

Responsabilidad:

- agrupar composición visual repetible;
- mantener consistencia de jerarquía y estructura.

### 10.6. `src/ui/providers/`

Responsabilidad:

- agrupar providers de React y composición visual global;
- consumir runtime y dependencias ya resueltas;
- no crear infraestructura;
- no resolver el grafo de dependencias;
- no actuar como composition root.

### 10.7. `app/`

Responsabilidad:

- actuar como entrada de Expo Router;
- montar rutas con el mínimo código posible;
- delegar en `src/ui/screens`, `src/ui/providers` y `src/bootstrap`.

Regla:

- una ruta no es un caso de uso;
- una pantalla no es un servicio;
- un componente no es una capa de negocio.

---

## 11. Módulos compartidos

Los módulos compartidos existen, pero son una excepción controlada.

`src/shared/` es el único espacio shared oficial del proyecto.

No existen carpetas `shared` por dominio, por presentación ni por infraestructura en la estructura oficial.

### 11.1. `src/shared/`

Debe contener solo:

- constantes técnicas o neutras;
- errores base;
- tipos genéricos;
- utilidades puras sin semántica de negocio;
- helpers de formato que no redefinan dominio.

No debe contener:

- lógica de viaje;
- lógica de jornada;
- decisiones visuales;
- reglas de persistencia;
- casos de uso.

### 11.2. Regla de uso de `shared`

Antes de crear una utilidad compartida, debe responderse:

1. ¿La lógica pertenece realmente a más de un módulo?
2. ¿La semántica es completamente neutra?
3. ¿Su reutilización mejora claridad y no la empeora?

Si alguna respuesta es no, la lógica debe quedarse en su módulo propietario.

### 11.3. Prioridad de los módulos propios

Siempre se prefiere:

1. módulo de dominio concreto;
2. módulo de aplicación concreto;
3. módulo de infraestructura concreto;
4. `shared` solo como último recurso.

---

## 12. Reglas de nombrado

### 12.1. Carpetas

- usar minúsculas;
- usar plural para áreas de negocio cuando representen colecciones de capacidades;
- usar nombres estables y semánticos;
- evitar abreviaturas opacas.

### 12.2. Archivos

- usar `PascalCase` para clases, casos de uso, servicios y agregados;
- usar `camelCase` para funciones puras y utilidades;
- usar `useXxx.ts` para hooks;
- usar `index.ts` solo como frontera de módulo;
- usar `*.test.ts` o `*.test.tsx` para pruebas.

### 12.3. Vocabulario

El código debe usar el vocabulario del producto:

- `Trip`
- `Workday`
- `Summary`
- `Goal`
- `Geo`
- `Visual`

Evitar nombres genéricos como:

- `Manager`
- `Helper`
- `Utils` cuando el contenido no sea realmente utilitario;
- `Common` como cajón de sastre.

### 12.4. Reglas de módulos

- cada módulo de negocio debe tener un límite claro;
- no se deben importar internals de otro módulo si existe una API pública;
- los `barrel files` deben ser pequeños y explícitos;
- no se deben crear exportaciones masivas si ocultan dependencias.

---

## 13. Ubicación de cada tipo de archivo

### 13.1. Dominio

- agregados: `src/domain/<module>/aggregates/`
- value objects: `src/domain/<module>/value-objects/`
- servicios de dominio: `src/domain/<module>/services/`
- políticas: `src/domain/<module>/policies/`
- errores de dominio: `src/domain/<module>/errors/`

### 13.2. Aplicación

- casos de uso: `src/application/<module>/use-cases/`
- puertos: `src/application/<module>/ports/`
- DTOs: `src/application/<module>/dtos/`
- comandos: `src/application/<module>/commands/`

### 13.3. Infraestructura

- repositorios concretos: `src/infrastructure/persistence/repositories/`
- mappers físicos: `src/infrastructure/persistence/mappers/`
- configuración técnica de base de datos: `src/infrastructure/persistence/database/`
- migraciones: `src/infrastructure/persistence/migrations/`
- adaptadores del dispositivo: `src/infrastructure/device/`
- adaptadores de geolocalización: `src/infrastructure/geolocation/`

### 13.4. Presentación

- proyecciones: `src/presentation/<module>/`
- view models: `src/presentation/<module>/`
- formateos de lectura: `src/presentation/<module>/`

### 13.5. UI

- rutas: `app/`
- pantallas: `src/ui/screens/`
- componentes: `src/ui/components/`
- hooks de coordinación visual: `src/ui/hooks/`

### 13.6. Recursos

- `assets/`: imágenes, iconos, tipografías y recursos binarios consumidos directamente por la UI.
- `src/resources/`: recursos estructurados no binarios que ayudan al runtime o a la presentación.
- `src/resources/seeds/`: datos iniciales, fixtures de arranque o conjuntos de apoyo para poblar el modelo.
- `src/resources/generated/`: artefactos generados por script, siempre reproducibles.

Catálogos de dominio:

- deben vivir en `src/domain/<module>/catalogs/` cuando su significado pertenece al negocio;
- no deben confundirse con `src/resources/`, que es una zona de soporte;
- no deben duplicarse entre dominio y recursos sin una razón explícita.

Regla sobre seeds y migraciones:

- `seeds` inicializa o apoya datos del nuevo sistema;
- las migraciones evolucionan el esquema técnico de TaxiGeo 1.0;
- la migración histórica importa datos del prototipo y no debe mezclarse con migraciones normales.

### 13.7. Tests

- tests unitarios puros: junto al módulo o en `tests/unit/`
- tests de integración: `tests/integration/`
- tests end-to-end: `tests/e2e/`
- fixtures: `tests/fixtures/`

---

## 14. Organización de tests

La estrategia de pruebas debe acompañar la arquitectura, no combatirla.

### 14.1. Unit tests

Responsabilidad:

- validar reglas puras;
- proteger invariantes;
- probar casos de uso aislados;
- verificar mappers y proyecciones simples.

Ubicación recomendada:

- cerca del código que protegen, o
- en `tests/unit/` si el conjunto es compartido.

### 14.2. Integration tests

Responsabilidad:

- validar interacción entre aplicación, infraestructura y persistencia;
- comprobar repositorios y mappers;
- verificar composición de módulos.

Ubicación:

- `tests/integration/`

### 14.3. E2E tests

Responsabilidad:

- validar flujos completos de usuario;
- comprobar la aplicación montada como sistema.

Ubicación:

- `tests/e2e/`

### 14.4. Fixtures

Responsabilidad:

- aportar datos de prueba reutilizables;
- centralizar casos representativos.

Ubicación:

- `tests/fixtures/`

### 14.5. Regla de pruebas

Todo test debe proteger una responsabilidad concreta.

No debe existir un test que intente validar "todo" a la vez.

---

## 15. Organización de configuración

### 15.1. Configuración raíz

Los archivos de configuración de la aplicación viven en la raíz porque son parte de la forma de ejecutar el proyecto.

Ejemplos:

- `package.json`
- `tsconfig.json`
- `eslint.config.js`
- `jest.config.js`
- `metro.config.js`
- `eas.json`
- `app.json`

### 15.2. `src/config/`

Responsabilidad:

- exponer configuración tipada en tiempo de ejecución;
- concentrar valores derivados de entorno;
- definir feature flags;
- organizar metadatos declarativos para composición técnica.

Subcarpetas recomendadas:

- `env/`: lectura y validación del entorno.
- `di/`: metadatos declarativos de dependencias consumidos por bootstrap.
- `feature-flags/`: activadores de comportamiento.
- `runtime/`: configuración calculada durante la inicialización.

Regla:

- la configuración no debe mezclar decisiones de negocio con detalles de despliegue.

### 15.3. Relación entre `assets/` y `src/resources/`

`assets/` se usa para material binario estático que la UI consume directamente.

`src/resources/` se usa para estructuras de soporte que pueden ser leídas, transformadas o generadas por la aplicación.

No deben duplicarse los mismos datos en ambas ubicaciones salvo que exista una razón técnica explícita y documentada.

### 15.4. Migración histórica del prototipo

La migración histórica de TaxiGeo vive fuera del dominio y fuera de las migraciones normales del esquema.

Convención oficial:

- las migraciones técnicas normales viven en `src/infrastructure/persistence/migrations/`;
- la importación única de históricos vive en `scripts/migration/historical-import/` o equivalente;
- el script histórico lee el modelo antiguo, transforma datos y escribe sobre el nuevo modelo;
- no introduce reglas de negocio nuevas;
- no se importa desde runtime;
- no se confunde con seeds ni con evolución normal de esquema.

---

## 16. Bootstrap de la aplicación

El bootstrap es el punto donde el sistema se ensambla.

### 16.1. Flujo oficial de arranque

```text
Expo runtime
   ↓
app/_layout.tsx
   ↓
src/bootstrap/
   ↓
src/config/
   ↓
src/infrastructure/
   ↓
src/application/
   ↓
src/presentation/
   ↓
src/ui/
```

`src/config/` forma parte de la entrada de configuración del arranque; no es un composition root ni un segundo bootstrap.

### 16.2. Responsabilidad de `app/_layout.tsx`

`app/_layout.tsx` debe:

- montar los providers globales de React;
- envolver la navegación;
- delegar la creación del runtime a `src/bootstrap/`;
- no instanciar repositorios, servicios ni casos de uso.

No debe:

- contener lógica de negocio;
- crear repositorios directamente;
- resolver persistencia de forma dispersa.

### 16.3. Responsabilidad de `src/bootstrap/`

Responsabilidad:

- actuar como composition root único del proyecto;
- inicializar la base de datos y el motor de persistencia;
- instanciar repositorios concretos;
- conectar puertos con adaptadores;
- crear casos de uso y servicios reutilizables;
- exponer el runtime listo para consumir por UI.

Subcarpetas o piezas recomendadas:

- `src/bootstrap/persistence/`: inicialización de base de datos y registro de repositorios.
- `src/bootstrap/application/`: creación de casos de uso y servicios de aplicación.
- `src/bootstrap/providers/`: ensamblado final de providers de React a partir del runtime ya compuesto; no crea el grafo de dependencias.
- `src/bootstrap/runtime/`: objeto runtime final consumible por la UI.

### 16.4. Secuencia de composición

1. Cargar configuración.
2. Inicializar persistencia técnica.
3. Crear implementaciones concretas.
4. Vincular puertos a adaptadores.
5. Exponer servicios y casos de uso.
6. Montar pantallas.

Regla:

- la composición solo debe ocurrir en el bootstrap;
- el resto del código consume dependencias ya resueltas.
- los componentes React no deben crear infraestructura ni resolver composición.

---

## 17. Composición de dependencias

La composición de dependencias sigue el principio de inversión.

### 17.1. Regla central

Los módulos internos definen contratos.

Los módulos externos implementan esos contratos.

La aplicación consume abstracciones, no concreciones.

### 17.2. Diagrama de dependencias

```text
UI
  ↓
Presentation
  ↓
Application
  ↓
Domain

Infrastructure ───► implementa puertos definidos por Application o Domain
```

### 17.3. Dependencias permitidas

- `app/` → `src/ui/`
- `app/` → `src/bootstrap/`
- `src/ui/` → `src/presentation/`
- `src/ui/` → `src/application/` a través de hooks o composición
- `src/presentation/` → `src/domain/` cuando solo proyecta conocimiento
- `src/application/` → `src/domain/`
- `src/infrastructure/` → `src/application/` o `src/domain/` solo para implementar puertos

### 17.4. Dependencias prohibidas

- `src/domain/` → `src/infrastructure/`
- `src/domain/` → `src/ui/`
- `src/domain/` → `src/presentation/`
- `src/application/` → `src/ui/`
- `src/application/` → `src/bootstrap/`
- `src/presentation/` → `src/infrastructure/`
- `src/ui/` → `src/infrastructure/`
- `app/` → `src/infrastructure/` directamente

---

## 18. Clean Architecture aplicada

### 18.1. Núcleo

El núcleo del sistema está formado por:

- `src/domain/`
- `src/application/`

Estas capas deben permanecer independientes de detalles técnicos y de interfaz.

### 18.2. Adaptadores

Las capas adaptadoras son:

- `src/presentation/`
- `src/ui/`
- `src/infrastructure/`
- `app/`

Su papel es comunicar el núcleo con el mundo exterior.

### 18.3. Regla de independencia

Si un detalle técnico desaparece, el dominio debe sobrevivir sin reescritura conceptual.

Si una pantalla desaparece, el negocio debe permanecer intacto.

Si cambia la persistencia, la estructura del dominio no debe romperse.

---

## 19. SOLID aplicado

### 19.1. Single Responsibility

Una carpeta, un archivo y un módulo deben tener una responsabilidad claramente identificable.

### 19.2. Open/Closed

Las ampliaciones deben introducir nuevos módulos o nuevos casos de uso, no mutar responsabilidades ajenas hasta volverlas ambiguas.

### 19.3. Liskov Substitution

Las implementaciones técnicas deben respetar los contratos definidos por la aplicación o el dominio.

### 19.4. Interface Segregation

Los puertos deben ser pequeños y específicos.

No se deben crear interfaces gigantes para "ahorrar" archivos.

### 19.5. Dependency Inversion

Las capas exteriores dependen de abstracciones interiores.

La infraestructura no gobierna al negocio.

---

## 20. DDD aplicado solo donde aporta valor

TaxiGeo no debe convertir todo en DDD pesado.

DDD se aplica donde el lenguaje del negocio es importante y la evolución del concepto lo justifica.

### 20.1. Dónde sí aporta valor

- `Trip`
- `Workday`
- `Visual`
- `Geo` cuando modela reglas del negocio

### 20.2. Dónde no hace falta sobrediseño

- utilidades puras;
- formateos;
- componentes visuales simples;
- scripts puntuales;
- adaptadores técnicos triviales.

### 20.3. Regla práctica

Si una pieza no necesita identidad, invariantes o lenguaje ubicuo, no la fuerces a parecer un aggregate.

---

## 21. Reglas para futuras ampliaciones

### 21.1. Si nace una nueva capacidad del negocio

Crear la estructura completa en las capas que correspondan:

- `src/domain/<nuevo-modulo>/`
- `src/application/<nuevo-modulo>/`
- `src/presentation/<nuevo-modulo>/`
- `src/infrastructure/<nuevo-modulo>/` si hace falta
- `app/<nuevo-modulo>/` si necesita UI

### 21.2. Si la capacidad solo consume datos existentes

No debe invadir el dominio central.

Debe resolverse en:

- `presentation`;
- `application`;
- o `ui`, según el caso.

### 21.3. Si solo es una nueva representación

Permanecer en `presentation` o `ui`.

No crear dominio nuevo por simple visualización.

### 21.4. Si introduce una nueva fuente técnica

Crear un adaptador en `infrastructure` y mantener el contrato hacia dentro.

### 21.5. Si se amplía la persistencia

Actualizar `src/infrastructure/persistence/` y, si es necesario, los puertos de aplicación.

La persistencia no debe arrastrar al dominio a nuevas dependencias técnicas.

---

## 22. Ejemplos de organización de nuevos módulos

### 22.1. Nuevo módulo de negocio: `expenses`

```text
src/
├── domain/
│   └── expenses/
├── application/
│   └── expenses/
├── presentation/
│   └── expenses/
├── infrastructure/
│   └── expenses/
└── ui/
    └── screens/
        └── expenses/
```

Usar este patrón cuando el concepto tenga identidad propia, reglas propias o ciclo de vida propio.

### 22.2. Nueva capacidad de lectura: `trip-history-analytics`

Si solo interpreta viajes ya existentes:

```text
src/
├── application/
│   └── summaries/
├── presentation/
│   └── summaries/
└── ui/
    └── screens/
        └── summary/
```

No hace falta crear un dominio nuevo si no existe identidad de negocio nueva.

### 22.3. Nueva integración técnica: exportación a archivo

```text
src/
├── application/
│   └── exports/
├── infrastructure/
│   └── filesystem/
└── scripts/
    └── maintenance/
```

La capacidad se coordina en la aplicación y la escritura real vive en infraestructura.

### 22.4. Nueva regla geográfica

```text
src/
├── domain/
│   └── geo/
├── application/
│   └── geo/
├── infrastructure/
│   └── geolocation/
└── presentation/
    └── geo/
```

La regla espacial pertenece al dominio; la API del dispositivo pertenece a infraestructura.

---

## 23. Criterios de evolución

La estructura oficial debe evolucionar sin perder disciplina.

### 23.1. Se puede añadir

- nuevos módulos de negocio;
- nuevas rutas;
- nuevos puertos;
- nuevas proyecciones;
- nuevos adaptadores técnicos;
- nuevos tests;
- nuevos recursos.

### 23.2. No se debe añadir

- carpetas genéricas como `misc`, `helpers`, `stuff` o `temp`;
- duplicados de capas;
- lógica de negocio en `shared`;
- acceso a persistencia desde UI;
- servicios que acumulen demasiadas responsabilidades.

### 23.3. Señales de que la estructura está degradándose

- un módulo conoce demasiadas cosas;
- una pantalla contiene decisiones de negocio;
- un servicio mezcla lectura, escritura y presentación;
- `shared` empieza a crecer sin límite;
- infraestructura dicta comportamiento;
- los casos de uso dejan de ser intenciones claras.

---

## 24. Resumen operativo

La estructura definitiva de TaxiGeo 1.0 debe cumplir estas reglas:

- el dominio manda;
- la aplicación coordina;
- la presentación proyecta;
- la UI compone;
- la infraestructura implementa;
- la persistencia conserva hechos;
- los módulos compartidos son mínimos;
- el bootstrap centraliza la composición;
- las dependencias apuntan hacia dentro;
- DDD se aplica con disciplina y solo donde aporta valor real.

Si una carpeta no puede explicarse con una responsabilidad única, no debe existir.

Si una dependencia no puede justificarse con el flujo del negocio, no debe permitirse.

Si una ampliación rompe la claridad del mapa, la estructura es incorrecta.

TaxiGeo 1.0 debe construirse para durar, no para sobrevivir al siguiente cambio inmediato.
