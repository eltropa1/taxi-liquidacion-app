import type { TripGeoSnapshotRepositoryPort } from "../ports/persistence";
import type { ApplicationRuntime } from "../runtime";

export type TripGeoEnrichmentKind = "START" | "END";

export type TripGeoEnrichmentInput = Readonly<{
  tripId: number;
  kind: TripGeoEnrichmentKind;
  runtime: ApplicationRuntime;
  snapshotRepository: TripGeoSnapshotRepositoryPort;
  errorLabel: string;
}>;

/**
 * Camino de enriquecimiento GEO.
 *
 * No participa en la validez del registro crítico.
 * Solo intenta complementar el servicio con información espacial.
 */
export async function captureTripGeoEnrichment({
  tripId,
  kind,
  runtime,
  snapshotRepository,
  errorLabel,
}: TripGeoEnrichmentInput): Promise<boolean> {
  try {
    const location = await runtime.geoLocation.getCurrentLocation();
    const geoSnapshot = runtime.geoAdministrativeResolver.resolve(
      location.latitude,
      location.longitude,
    );

    await snapshotRepository.insert({
      tripId,
      kind,
      snapshot: geoSnapshot,
      createdAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error(errorLabel, error);
    return false;
  }
}
