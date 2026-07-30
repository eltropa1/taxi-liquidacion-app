# SQLite Connection Lifecycle v1.0

> Estado: Approved

## 0. Propósito

Este documento describe cómo se gestiona el ciclo de vida de la conexión SQLite nativa en TaxiGeo, y el bug de bloqueo ("database is locked") detectado y corregido en 2026-07 durante desarrollo con Fast Refresh.

Es un documento técnico de infraestructura; no describe el dominio ni el modelo persistente (ver `docs/persistence/Persistence Architecture v1.0.md` para eso).

## 1. El problema

`getDatabase()` (`infrastructure/persistence/database/database.ts`) y `initializePersistenceDatabase()` (`infrastructure/persistence/database/initializePersistenceDatabase.ts`) guardaban su estado — la conexión SQLite y la promesa de inicialización de migraciones — en variables `let` de ámbito de módulo.

Con Fast Refresh, Metro re-ejecuta el módulo cuando cambia código JS. Esto reinicia esas variables a su valor inicial (`null`), pero **no** cierra ni reinicia el proceso nativo: la conexión SQLite anterior sigue abierta. El resultado:

1. Fast Refresh dispara la re-ejecución del módulo.
2. `getDatabase()` ve `database === null` y llama a `SQLite.openDatabaseSync(...)` otra vez.
3. Se abre una **segunda** conexión nativa al mismo fichero `taxi_liquidation.db`, mientras la primera sigue viva.
4. Ambas conexiones compiten por el lock de escritura del fichero (SQLite en modo *rollback journal* solo permite un escritor).
5. Cualquier operación de escritura falla con `Error: Call to function 'NativeDatabase.execAsync' has been rejected. → Caused by: database is locked`.

El mismo patrón afectaba a `initializationPromise`: cada Fast Refresh podía disparar una segunda pasada de `runMigrations()` (con su propio `BEGIN IMMEDIATE TRANSACTION`) sin saber que ya había una migración en curso desde antes del reload.

## 2. El fix

`globalThis` sobrevive a la recarga de JS de Fast Refresh (solo se resetea en un reload completo del proceso nativo, o al cerrar la app). Ambos singletons se anclan ahí en vez de a un `let` de módulo:

```ts
// database.ts
declare global {
  var __taxiLiquidacionDatabase: SQLite.SQLiteDatabase | undefined;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!globalThis.__taxiLiquidacionDatabase) {
    globalThis.__taxiLiquidacionDatabase = SQLite.openDatabaseSync("taxi_liquidation.db");
  }
  return globalThis.__taxiLiquidacionDatabase;
}
```

El mismo patrón se aplica a `initializePersistenceDatabase()` con `globalThis.__taxiLiquidacionInitPromise`.

Con esto, un Fast Refresh normal reutiliza la conexión y la promesa de inicialización ya existentes en vez de crear unas nuevas — solo existe una conexión real durante toda la vida del proceso nativo, recargas de JS incluidas.

Adicionalmente, `runMigrations()` activa `PRAGMA journal_mode = WAL;` antes de `PRAGMA busy_timeout` y `BEGIN IMMEDIATE TRANSACTION`, para mayor tolerancia general a bloqueos (lectores y escritor no se bloquean mutuamente en modo WAL).

## 3. Qué hacer si el error ya ocurrió

El fix evita que el bug **vuelva a producirse**, pero no desbloquea retroactivamente un fichero que ya quedó con dos conexiones nativas compitiendo en el proceso actual. Si aparece el error:

1. Cerrar completamente la app en el emulador/dispositivo (no solo recargar con `r` en Metro) — p. ej. `adb shell am force-stop <applicationId>`.
2. Volver a abrirla. El proceso nativo arranca limpio, con una única conexión.

A partir de ahí, un Fast Refresh normal no debería reproducir el bloqueo.

## 4. Riesgo de fuga de estado en tests

Como el singleton ahora vive en `globalThis`, `jest.resetModules()` **no lo limpia** (solo limpia el registro de módulos, no propiedades de `globalThis`). El test `initializePersistenceDatabase.characterization.test.ts` limpia explícitamente `globalThis.__taxiLiquidacionInitPromise` en `afterEach` por este motivo — cualquier test nuevo que ejercite estos singletons directamente (sin mockear el módulo por completo, como sí hace `migrations.characterization.test.ts`) debe hacer la misma limpieza.
