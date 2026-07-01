# Architecture Migration Roadmap v1.0

## Objetivo

Este documento define exclusivamente el proceso de migración arquitectónica del repositorio actual hacia TaxiGeo 1.0.

No sustituye al roadmap funcional del producto.

No planifica funcionalidades.

No introduce nuevas capacidades de negocio.

Su única función es definir el orden oficial de transformación de la arquitectura aprobada.

## Principios Generales

- La migración debe ser progresiva.
- No se realizará una reescritura completa del sistema.
- La migración se hará sobre el mismo repositorio.
- Debe mantenerse la paridad funcional durante toda la migración.
- No se añadirán funcionalidades nuevas durante la migración arquitectónica.
- No se modificará el comportamiento observable salvo para mantener la paridad funcional aprobada.
- No se mezclarán tareas de migración con mejoras visuales.
- No se modificará la arquitectura aprobada.
- Cada fase debe finalizar completamente antes de iniciar la siguiente.
- Cualquier contradicción arquitectónica debe detener la implementación hasta su resolución.
- Ninguna fase de la migración puede obligar a incumplir la arquitectura oficial.
- Si una contradicción entre roadmap y arquitectura es detectada, deberá modificarse el roadmap antes de continuar.
- La arquitectura aprobada prevalece siempre sobre el roadmap.

## ADR De Migración

### ADR-MIG-001 - Reordenación de la migración de persistencia y Application

#### Contexto

La arquitectura oficial establece que:

- Application define los contratos;
- Infrastructure implementa esos contratos;
- la persistencia vive en Infrastructure;
- las dependencias siempre apuntan hacia dentro.

La secuencia inicial del roadmap de migración colocaba la migración de Persistencia antes de la migración de Application y antes de la introducción de puertos.

Esa secuencia generaba una contradicción:

- la persistencia oficial necesita puertos para ser consumida de forma arquitectónicamente correcta;
- Application no puede depender directamente de Infrastructure;
- por tanto, no es posible migrar la persistencia sin preparar antes los contratos que la sostienen.

#### Decisión

Se modifica únicamente el orden de implantación de la migración.

La arquitectura oficial no cambia.

El roadmap de migración se ajusta para introducir primero la foundation de persistencia con los puertos necesarios y después migrar Application para consumirlos.

#### Consecuencia

- La arquitectura permanece íntegra en todo momento.
- El roadmap queda alineado con la arquitectura oficial.
- Se evita introducir dependencias temporales prohibidas.

## Fases De Migración

### Fase 0 — Functional Baseline

Objetivo:

Construir la línea base funcional del prototipo.

Entregable:

`docs/migration/Functional Baseline v1.0.md`

Estado:

Completada.

### Fase 0.5 — Tests De Caracterización

Objetivo:

Crear tests que capturen el comportamiento actual del prototipo antes de mover arquitectura.

Debe cubrir como mínimo:

- abrir jornada;
- cerrar jornada;
- iniciar viaje;
- finalizar viaje;
- crear viaje manual;
- editar viaje;
- borrar viaje.

Estado:

Pendiente.

### Fase 1 — Bootstrap

Objetivo:

Crear el composition root oficial.

Introducir Bootstrap.

Centralizar la inicialización.

Eliminar la inicialización técnica desde Presentation.

Estado:

Pendiente.

### Fase 2 — Foundation De Persistencia

Objetivo:

Preparar la persistencia oficial sin migrar todavía los casos de uso.

Debe incluir:

- creación de los puertos de persistencia definidos por Application;
- creación de las interfaces de repositorio;
- implementación de dichos repositorios en Infrastructure;
- registro de dependencias en Bootstrap;
- adaptación mínima necesaria para permitir la futura migración.

No deben migrarse todavía:

- `StartTrip`
- `FinishTrip`
- `UpdateTrip`
- `DeleteTrip`
- `OpenWorkday`
- `CloseWorkday`

Estado:

Completada.

### Fase 3 — Migración De Application

Objetivo:

Migrar todos los casos de uso.

Todos los casos de uso deberán consumir los puertos creados en la fase anterior.

Al finalizar esta fase:

- Application dejará completamente de conocer SQLite;
- todos los casos de uso dependerán exclusivamente de puertos;
- Infrastructure implementará dichos puertos;
- se eliminarán las dependencias legacy correspondientes.

Estado:

Completada.

### Fase 4 — Presentation

Objetivo:

Reducir Presentation a composición y representación.

Mover lógica fuera de UI.

Mantener exactamente la misma experiencia de usuario.

Estado:

Completada.

### Fase 5 — Eliminación Del Legado

Objetivo:

Eliminar definitivamente el código legacy del runtime.

Ejecutar la migración histórica definitiva.

Garantizar que toda la aplicación funciona únicamente con la arquitectura oficial.

Estado:

Completada.

## Criterios Para Avanzar De Fase

Cada fase solo puede darse por finalizada cuando:

- se alcanza el objetivo previsto;
- no existen regresiones funcionales;
- la APK continúa funcionando;
- la paridad funcional respecto al Functional Baseline se mantiene;
- el código legacy previsto para esa fase ha sido eliminado;
- las comprobaciones correspondientes han sido superadas.

No se puede comenzar una fase posterior sin cerrar completamente la anterior.

## Criterio Final De Migración

TaxiGeo 1.0 se considerará completamente migrado únicamente cuando:

- toda la arquitectura coincida con la documentación oficial;
- no exista código legacy formando parte del runtime;
- la aplicación mantenga paridad funcional con el Functional Baseline;
- la migración histórica haya finalizado;
- el repositorio pueda mantenerse íntegramente siguiendo la arquitectura oficial.

## Gobernanza Del Roadmap

Este documento tiene prioridad como roadmap oficial de migración arquitectónica.

Ante cualquier conflicto entre este roadmap y otros documentos de planificación funcional, debe prevalecer este documento para todo lo relativo al orden de migración arquitectónica.

Ante cualquier contradicción entre el estado real del repositorio y la arquitectura aprobada, la implementación debe detenerse hasta que la contradicción quede resuelta.
