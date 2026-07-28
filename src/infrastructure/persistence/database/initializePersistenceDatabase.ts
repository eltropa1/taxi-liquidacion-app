import { runMigrations } from "./migrations";
import { getPersistenceDatabase } from "./getPersistenceDatabase";
import { PersistenceDatabase } from "./types";

let initializationPromise: Promise<PersistenceDatabase> | null = null;

export function initializePersistenceDatabase(): Promise<PersistenceDatabase> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await runMigrations();
      return getPersistenceDatabase();
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}
