import { TripSource } from "../../constants/enums";
import { getApplicationRuntime } from "../runtime";
import { getApplicationPersistence } from "../ports/persistence";
import { captureTripGeoEnrichment } from "./tripGeoEnrichment";

export type CloseTripResult = Readonly<{
  finalized: boolean;
  enrichmentSaved: boolean;
  tripId: number | null;
}>;

function resolvePersistedSource(source: string | null | undefined) {
  if (source === TripSource.UBER) return TripSource.UBER;
  if (source === TripSource.CABIFY) return TripSource.CABIFY;
  if (source === TripSource.FREE_NOW) return TripSource.FREE_NOW;
  if (source === TripSource.CUSTOM) return TripSource.CUSTOM;
  return TripSource.TAXI;
}

/**
 * Cierra el viaje activo sin completar todavía la información del servicio.
 *
 * El viaje pasa a estado cerrado con información pendiente y el enriquecimiento
 * GEO sigue siendo best effort.
 */
export class CloseTrip {
  static async execute(): Promise<CloseTripResult> {
    const { tripRepository, tripGeoSnapshotRepository } =
      getApplicationPersistence();

    const active = await tripRepository.findActiveTrip();
    if (!active) {
      return { finalized: false, enrichmentSaved: true, tripId: null };
    }

    const trip = await tripRepository.findCanonicalTripById(active.id);
    if (!trip) {
      return { finalized: false, enrichmentSaved: true, tripId: null };
    }

    const endedAt = new Date();
    const persistedSource = resolvePersistedSource(
      trip.classification?.platformId ?? null,
    );
    const persistedCustomSource =
      persistedSource === TripSource.CUSTOM
        ? trip.classification?.serviceLabel ?? null
        : trip.classification?.serviceLabel &&
            trip.classification?.platformId &&
            trip.classification.serviceLabel !== trip.classification.platformId
          ? trip.classification.serviceLabel
          : null;

    // Camino crítico: el viaje finaliza y queda listo para completar el servicio.
    trip.finish(endedAt);

    await tripRepository.runInTransaction(async () => {
      // Camino crítico: fijar el servicio pendiente de completar.
      await tripRepository.updateTripTimes({
        id: Number(trip.id),
        startTime: trip.chronology.startedAt,
        endTime: endedAt,
      });

      await tripRepository.updateTripService({
        id: Number(trip.id),
        serviceStatus: "incomplete",
        source: persistedSource,
        customSource: persistedCustomSource,
        amount: null,
        payment: null,
        chargedAmount: null,
        cashTip: null,
      });
    });

    // Camino de enriquecimiento: snapshot GEO posterior al cierre.
    void captureTripGeoEnrichment({
      tripId: Number(trip.id),
      kind: "END",
      runtime: getApplicationRuntime(),
      snapshotRepository: tripGeoSnapshotRepository,
      errorLabel: "Error capturando snapshot GEO de fin de viaje",
    });

    return {
      finalized: true,
      enrichmentSaved: true,
      tripId: Number(trip.id),
    };
  }
}
