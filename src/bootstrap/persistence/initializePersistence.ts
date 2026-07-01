import type { PersistenceDatabase } from "../../infrastructure/persistence/database";
import { initializePersistenceDatabase } from "../../infrastructure/persistence/database";

/**
 * Inicialización técnica de persistencia.
 *
 * La responsabilidad de esta capa es dejar la base de datos lista
 * antes de que la UI empiece a funcionar.
 */
export async function initializePersistence(): Promise<PersistenceDatabase> {
  return initializePersistenceDatabase();
}
