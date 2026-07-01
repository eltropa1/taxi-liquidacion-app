import { getDatabase as getInfrastructureDatabase } from "./database";
import { PersistenceDatabase } from "./types";

export function getPersistenceDatabase(): PersistenceDatabase {
  return getInfrastructureDatabase();
}
