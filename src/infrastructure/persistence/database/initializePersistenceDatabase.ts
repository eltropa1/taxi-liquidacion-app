import { runMigrations } from "./migrations";
import { getPersistenceDatabase } from "./getPersistenceDatabase";
import { PersistenceDatabase } from "./types";

/**
 * Igual que en database.ts: anclado a `globalThis` para que Fast Refresh
 * no dispare una segunda pasada de migraciones (BEGIN IMMEDIATE) contra
 * la misma conexión mientras la primera pudiera seguir en curso.
 */
declare global {
  // eslint-disable-next-line no-var
  var __taxiLiquidacionInitPromise: Promise<PersistenceDatabase> | undefined;
}

export function initializePersistenceDatabase(): Promise<PersistenceDatabase> {
  if (!globalThis.__taxiLiquidacionInitPromise) {
    globalThis.__taxiLiquidacionInitPromise = (async () => {
      await runMigrations();
      return getPersistenceDatabase();
    })().catch((error) => {
      globalThis.__taxiLiquidacionInitPromise = undefined;
      throw error;
    });
  }

  return globalThis.__taxiLiquidacionInitPromise;
}
