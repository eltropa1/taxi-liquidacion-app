# Emulator

## Propósito

Documentar el uso estándar del Android Emulator para validación automática.

## Alcance

Incluye AVD recomendado, API objetivo, orientación, locale, timezone, permisos y uso de `adb`.

## Estructura prevista

- definición del AVD;
- reglas de arranque;
- checks de disponibilidad;
- políticas de estabilidad.

## Estado actual

La infraestructura Android ya puede:

- localizar Android SDK y `adb`;
- detectar AVDs disponibles;
- arrancar un emulador existente;
- esperar `boot_completed`;
- instalar la APK de desarrollo;
- lanzar la app y verificar que queda visible.

Todavía no se integra Maestro ni los flows E2E.
