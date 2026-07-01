import type {
  TripGeoSnapshotRepositoryPort,
  TripRepositoryPort,
  WorkdayRepositoryPort,
} from "../../application/ports/persistence";
import { SqliteTripGeoSnapshotRepository } from "../../infrastructure/persistence/repositories/SqliteTripGeoSnapshotRepository";
import { SqliteTripRepository } from "../../infrastructure/persistence/repositories/SqliteTripRepository";
import { SqliteWorkdayRepository } from "../../infrastructure/persistence/repositories/SqliteWorkdayRepository";
import type { PersistenceDatabase } from "../../infrastructure/persistence/database";

export type PersistenceDependencies = Readonly<{
  tripRepository: TripRepositoryPort;
  workdayRepository: WorkdayRepositoryPort;
  tripGeoSnapshotRepository: TripGeoSnapshotRepositoryPort;
}>;

export async function createPersistenceDependencies(
  database: PersistenceDatabase,
): Promise<PersistenceDependencies> {
  return Object.freeze({
    tripRepository: new SqliteTripRepository(database),
    workdayRepository: new SqliteWorkdayRepository(database),
    tripGeoSnapshotRepository: new SqliteTripGeoSnapshotRepository(database),
  });
}
