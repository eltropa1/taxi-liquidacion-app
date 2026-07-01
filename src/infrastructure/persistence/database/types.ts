import { getDatabase as getInfrastructureDatabase } from "./database";

export type PersistenceDatabase = ReturnType<typeof getInfrastructureDatabase>;
