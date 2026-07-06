# E2E Validation Base

Este directorio alberga la infraestructura base de validación automática de TaxiGeo.

## Objetivo

Preparar el proyecto para ejecutar validación automática de extremo a extremo sin alterar el comportamiento funcional de la app.

## Estructura prevista

- `flows/`: flows declarativos de Maestro.
- `helpers/`: utilidades compartidas.
- `fixtures/`: datos reproducibles.
- `config/`: configuración E2E.
- `reports/`: informes de ejecución.
- `screenshots/`: capturas de evidencia.
- `logs/`: salidas y trazas.

## Filosofía

- un runner único;
- pocos flujos, críticos y mantenibles;
- evidencia clara y reproducible;
- selectores estables como contrato del proyecto;
- estado de prueba controlado por seed y reset lógico.

## Estado actual

La base estructural ya está preparada y existe un único smoke Maestro para validar arranque y Home.

Artefactos actuales:

- `flows/smoke.app-launch.yaml`
- `config/maestro.yaml`
- `reports/latest/`
- `screenshots/latest/`
- `logs/latest/`

Los flows funcionales de negocio siguen pendientes.
