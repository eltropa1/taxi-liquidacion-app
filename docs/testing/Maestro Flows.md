# Maestro Flows

## Propósito

Documentar los flows mínimos de Maestro que validarán los flujos críticos de TaxiGeo.

## Alcance

En esta fase solo existe un smoke de arranque:

- `smoke.app-launch.yaml`

El resto de flows funcionales siguen fuera de alcance hasta fases posteriores.

## Estructura prevista

- `tests/e2e/flows/`
- `tests/e2e/helpers/`
- `tests/e2e/fixtures/`

## Estado actual

El smoke de arranque ya está definido y se usa para verificar que:

- TaxiGeo abre correctamente;
- la Home aparece;
- la app responde;
- se genera una captura de pantalla asociada.

No hay todavía flows funcionales de negocio.
