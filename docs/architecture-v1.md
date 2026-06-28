# Arquitectura v1.0 de TaxiGeo

## 1. Introducción

TaxiGeo se organiza para que el negocio no dependa de la interfaz ni de la infraestructura.

La arquitectura existe para mantener separadas las intenciones del producto, las reglas del dominio y los detalles técnicos.

Cada capa tiene una responsabilidad única.

La UI presenta y coordina interacción visual.

Presentation transforma modelos ya resueltos en contratos reutilizables para la UI.

Los hooks coordinan el flujo entre UI y Application.

Application representa intenciones completas del negocio.

Domain contiene reglas puras del negocio.

Services exponen capacidades reutilizables.

Infrastructure resuelve persistencia y detalles técnicos.

Esta separación evita duplicaciones, acoplamientos innecesarios y lógica de negocio dispersa.

## 2. Principios Arquitectónicos

1. Separación por responsabilidades.
2. Una responsabilidad por capa.
3. Una intención por caso de uso.
4. Una regla por módulo de dominio.
5. La UI nunca contiene reglas de negocio.
6. Los Services representan capacidades.
7. Application representa intenciones.
8. Domain representa conocimiento del negocio.
9. Infrastructure representa detalles técnicos.

Estos principios son obligatorios para el código nuevo.

## 3. Modelo Arquitectónico

Flujo principal:

```text
Domain
    ↓
Application / Services
    ↓
Presentation
    ↓
UI
```

Responsabilidad de cada nivel:

- Domain: validar, normalizar y calcular reglas puras.
- Application: ejecutar una intención completa del negocio.
- Services: ofrecer capacidades reutilizables de lectura, agregación o acceso.
- Presentation: transformar modelos ya resueltos en contratos reutilizables para UI.
- UI: mostrar datos, recoger entradas, disparar eventos.

Hooks coordinan UI con Application sin sustituir a ninguna de las dos capas.

## 4. Definición de cada capa

### UI

Responsabilidad:

- Presentación.
- Composición visual.
- Gestión de estado visual.
- Navegación.

Qué puede hacer:

- Renderizar pantallas y componentes.
- Recibir interacción del usuario.
- Mostrar errores o confirmaciones.
- Delegar acciones a hooks.

Qué no puede hacer:

- Decidir reglas de negocio.
- Escribir en SQLite.
- Normalizar datos del negocio.
- Coordinar persistencia.
- Llamar a infraestructura directamente para resolver una intención.

### Presentation

Responsabilidad:

- Transformar modelos ya resueltos en contratos reutilizables para la UI.
- Reorganizar información para facilitar el renderizado.

Qué puede hacer:

- Proyectar datos.
- Reorganizar información.
- Construir modelos reutilizables para UI.
- Adaptar estructuras para facilitar el renderizado.

Qué no puede hacer:

- Decidir reglas de negocio.
- Calcular colores.
- Decidir iconos.
- Consultar SQLite.
- Ejecutar casos de uso.
- Utilizar componentes React.
- Utilizar hooks.
- Mantener estado.
- Generar conocimiento nuevo.

Presentation únicamente proyecta.

### Hooks

Responsabilidad:

- Coordinar la pantalla con Application.
- Gestionar estado de pantalla.
- Encadenar refresh, carga y acciones de usuario.

Qué pueden hacer:

- Llamar a casos de uso.
- Llamar a Services cuando sea necesario para leer capacidades.
- Actualizar estado local.
- Orquestar secuencias simples de UI.

Qué no pueden hacer:

- Contener reglas de negocio propias.
- Repetir validaciones del dominio.
- Acceder directamente a SQLite.
- Sustituir a Application.

### Application

Responsabilidad:

- Representar casos de uso.
- Encapsular intenciones completas del negocio.
- Coordinar Domain y Services.

Cada fichero de Application responde a una única intención.

Ejemplos reales del proyecto:

- `StartTrip`
- `FinishTrip`
- `CreateManualTrip`
- `UpdateTrip`
- `DeleteTrip`
- `OpenWorkday`
- `CloseWorkday`

Qué puede hacer:

- Orquestar una operación de negocio completa.
- Reutilizar reglas del dominio.
- Reutilizar capacidades de Services.

Qué no puede hacer:

- Convertirse en lógica de presentación.
- Resolver UI.
- Depender de React.
- Contener reglas duplicadas que ya existan en Domain.

### Domain

Responsabilidad:

- Contener conocimiento puro del negocio.
- Validar, normalizar y calcular reglas del dominio.

Ejemplos actuales:

- `tripEconomics`
- `tripSavePreparation`
- `tripEditPreparation`

Qué puede hacer:

- Calcular importes.
- Preparar datos para persistencia.
- Aplicar reglas puras sin efectos secundarios.

Qué no puede hacer:

- Depender de React.
- Depender de navegación.
- Escribir en base de datos.
- Conocer componentes o pantallas.

### Services

Responsabilidad:

- Exponer capacidades reutilizables.
- Concentrar lecturas, agregaciones y operaciones técnicas repetibles.

Ejemplos:

- `TripQueryService`
- `SummaryService`
- `WorkdayService`

Otros servicios existentes del proyecto también siguen esta idea de capacidad reutilizable cuando no representan una intención de usuario.

Qué pueden hacer:

- Leer datos.
- Agregar información.
- Resolver capacidades técnicas compartidas.

Qué no pueden hacer:

- Representar una intención del usuario.
- Sustituir un caso de uso.
- Mezclar presentación con persistencia.

Presentation puede consumir resultados de Domain, Application y Services, pero nunca sustituirlos.

### Infrastructure

Responsabilidad:

- Resolver SQLite.
- Resolver persistencia.
- Resolver repositorios.
- Resolver acceso técnico a APIs del entorno.

Incluye:

- `src/database`
- Repositorios.
- Esquema y migraciones.
- Adaptadores técnicos.
- Acceso a geolocalización y detalles equivalentes.

Qué puede hacer:

- Ejecutar consultas.
- Guardar o leer información.
- Adaptar APIs técnicas.

Qué no puede hacer:

- Contener reglas del negocio.
- Decidir intenciones.
- Conocer pantallas.

## 5. Dependencias permitidas

### UI → Hooks

La UI puede depender de hooks para coordinar acciones y datos.

Ejemplo:

- `app/index.tsx` usa `useTodayScreen` y `useTripActions`.
- `app/trip/edit.tsx` prepara datos de pantalla y delega la edición.

### UI → Presentation

La UI puede depender de Presentation para convertir datos ya resueltos en contratos reutilizables para renderizado.

Ejemplo:

- `app/index.tsx` convierte viajes en `TripVisualProjection` antes de renderizar el historial.

### Hooks → Application

Los hooks pueden llamar a casos de uso para ejecutar intenciones.

Ejemplo:

- `useTripActions` llama a `StartTrip`, `FinishTrip`, `CreateManualTrip`, `UpdateTrip`, `DeleteTrip`, `OpenWorkday`, `CloseWorkday`.

### Application → Domain

Los casos de uso pueden usar módulos de dominio para validar o preparar datos.

Ejemplo:

- La preparación del guardado de viajes usa `tripSavePreparation`.
- La preparación de edición usa `tripEditPreparation`.

### Application → Services

Los casos de uso pueden usar Services cuando necesitan capacidades compartidas o acceso coordinado.

Ejemplo:

- `StartTrip` usa `WorkdayService` para resolver la jornada.
- `FinishTrip` usa `WorkdayService` cuando necesita la jornada activa.
- `CreateManualTrip` usa `WorkdayService` para asociar el viaje a la jornada.

### Services → Infrastructure

Los Services pueden depender de infraestructura para leer o escribir datos.

Ejemplo:

- `TripQueryService` usa la base de datos.
- `SummaryService` usa la base de datos.
- `WorkdayService` usa la base de datos.

## 6. Dependencias prohibidas

- UI → SQLite.
- UI → infraestructura.
- UI → reglas de negocio.
- UI → persistencia directa.
- Hooks → SQLite.
- Hooks → infraestructura.
- Hooks → reglas de negocio propias.
- Domain → React.
- Domain → navegación.
- Domain → UI.
- Domain → infraestructura.
- Services → UI.
- Services → React.
- Domain → Presentation.
- Application → Presentation.
- Services → Presentation.
- Presentation → SQLite.
- Presentation → infraestructura.
- Presentation → Hooks.
- Presentation → UI.
- Infrastructure → Domain.
- Infrastructure → UI.
- Infrastructure → Application.
- Infrastructure → Hooks.

Las dependencias siempre deben ir desde la capa más alta hacia una capa más baja o equivalente en responsabilidad.

Nunca al revés.

## 7. Organización del proyecto

Estructura actual relevante:

- `app/`
- `src/application/`
- `src/domain/`
- `src/hooks/`
- `src/services/`
- `src/database/`
- `src/components/`
- `src/presentation/`
- `src/constants/`
- `src/utils/`
- `src/geo/`
- `src/geo-location/`

Contenido actual principal:

- `app/index.tsx`
- `app/trip/edit.tsx`
- `app/trip/new.tsx`
- `app/goals/index.tsx`
- `app/summary/index.tsx`
- `app/summary/detail.tsx`
- `src/application/trips/*`
- `src/application/workdays/*`
- `src/domain/trips/*`
- `src/hooks/useTodayScreen.ts`
- `src/hooks/useTripActions.ts`
- `src/services/TripQueryService.ts`
- `src/services/SummaryService.ts`
- `src/services/WorkdayService.ts`
- `src/services/TripService.ts`
- `src/presentation/*`

`TripService` permanece como compatibilidad y lectura heredada.

## 8. Cómo añadir una nueva funcionalidad

Proceso oficial:

1. Identificar la intención del negocio.
2. Crear un caso de uso en `Application` si no existe.
3. Crear o ampliar reglas puras en `Domain` si hace falta.
4. Reutilizar `Services` existentes cuando la capacidad ya existe.
5. Proyectar los datos con `Presentation` si hace falta un contrato reutilizable.
6. Conectar la intención desde `Hooks`.
7. Mostrarla en `UI`.

Regla práctica:

- Si la necesidad es una intención completa, va a `Application`.
- Si la necesidad es una regla pura, va a `Domain`.
- Si la necesidad es lectura o capacidad reutilizable, va a `Services`.
- Si la necesidad es un contrato de representación reutilizable, va a `Presentation`.
- Si la necesidad es visual, queda en `UI`.

## 9. Cómo NO desarrollar en TaxiGeo

- Nunca escribir reglas de negocio en una pantalla.
- Nunca acceder a SQLite desde la UI.
- Nunca usar un Service para representar una intención de usuario.
- Nunca duplicar reglas del dominio.
- Nunca saltar capas.
- Nunca mover lógica de negocio a un hook por comodidad.
- Nunca crear un servicio nuevo si ya existe una capacidad equivalente.
- Nunca mezclar presentación y persistencia.
- Nunca mezclar cálculo de negocio y renderizado.

## 10. Estado actual

La migración al Modelo Arquitectónico v1.0 está completada.

El proyecto actual ya responde a este contrato.

Las siguientes tareas del producto deben construirse sobre esta base, sin romper estas reglas.
