# E2E Architecture

## Propósito

Describir la arquitectura de validación automática que se implementará para TaxiGeo.

## Alcance

Incluye el runner único, el modo rápido y el modo completo, preflight, emulador Android, build de desarrollo, Maestro smoke, capturas, logs e informe final.

## Estructura prevista

- `scripts/e2e/runner.ts`
- `scripts/e2e/preflight.ts`
- `scripts/e2e/android.ts`
- `scripts/e2e/contracts.ts`
- `scripts/e2e/maestro.ts`
- `tests/e2e/`
- `docs/testing/Test IDs.md`

## Estado actual

La infraestructura base ya existe y el runner puede:

- ejecutar TypeScript;
- ejecutar Jest;
- validar el entorno Android;
- arrancar o reutilizar un emulador;
- instalar la APK de desarrollo;
- lanzar TaxiGeo y comprobar que abre;
- ejecutar un smoke Maestro sobre la Home;
- generar captura, log y resumen persistido.

Los flows funcionales de negocio siguen fuera de alcance.
