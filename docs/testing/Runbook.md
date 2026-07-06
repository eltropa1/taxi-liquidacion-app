# Runbook

## Propósito

Definir el uso operativo de la validación automática por parte de desarrolladores y Codex.

## Alcance

Describe el modo rápido, el modo completo y la evolución futura del runner único.

## Estructura prevista

- `validate`
- `validate:full`
- documentación de ejecución y troubleshooting

## Estado actual

La Fase 3.3 deja operativo este flujo:

- `validate`: TypeScript + Jest.
- `validate:full`: TypeScript + Jest + preflight Android y Maestro + emulador + instalación + launch + smoke + captura + reporte.

El smoke de Maestro ya está integrado y se usa solo como validación de arranque.
