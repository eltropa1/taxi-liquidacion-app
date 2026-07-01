import { runMigrations } from "./migrations";
import { getPersistenceDatabase } from "./getPersistenceDatabase";
import { PersistenceDatabase } from "./types";

export async function initializePersistenceDatabase(): Promise<PersistenceDatabase> {
  await runMigrations();
  return getPersistenceDatabase();
}
