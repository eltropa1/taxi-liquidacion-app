import type { TripGeoSnapshotRepositoryPort } from "./tripGeoSnapshotRepositoryPort";
import type { TripRepositoryPort } from "./tripRepositoryPort";
import type { WorkdayRepositoryPort } from "./workdayRepositoryPort";

export type ApplicationPersistence = Readonly<{
  tripRepository: TripRepositoryPort;
  workdayRepository: WorkdayRepositoryPort;
  tripGeoSnapshotRepository: TripGeoSnapshotRepositoryPort;
}>;

let currentApplicationPersistence: ApplicationPersistence | null = null;

export function configureApplicationPersistence(
  persistence: ApplicationPersistence,
): void {
  currentApplicationPersistence = persistence;
}

export function getApplicationPersistence(): ApplicationPersistence {
  if (!currentApplicationPersistence) {
    throw new Error("Application persistence has not been configured");
  }

  return currentApplicationPersistence;
}

export function resetApplicationPersistence(): void {
  currentApplicationPersistence = null;
}
