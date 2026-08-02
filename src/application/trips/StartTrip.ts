import { TripSource } from "../../constants/enums";
import { Trip } from "../../domain/trips/canonical";
import { TripServiceClassification } from "../../domain/trips/canonical";
import { getApplicationRuntime } from "../runtime";
import { getApplicationPersistence } from "../ports/persistence";
import { captureTripGeoEnrichment } from "./tripGeoEnrichment";

/**
 * Caso de uso: iniciar un viaje.
 *
 * Coordina el ciclo completo sin exponer detalles de UI.
 */
export class StartTrip {
  static async execute(): Promise<void> {
    const { tripRepository, workdayRepository, tripGeoSnapshotRepository } =
      getApplicationPersistence();

    const workday = await workdayRepository.getOpenWorkday();
    if (!workday) {
      throw new Error("No hay un día de trabajo abierto");
    }

    const activeTrip = await tripRepository.findActiveTrip();
    if (activeTrip) {
      throw new Error(
        "Ya tienes un viaje en curso. Debes finalizarlo antes de iniciar otro.",
      );
    }

    const startedAt = new Date();
    const classification = TripServiceClassification.create({
      platformId: TripSource.TAXI,
      serviceLabel: TripSource.TAXI,
    });

    const insertResult = await tripRepository.createStartedTrip({
      startedAt,
      source: TripSource.TAXI,
      workdayId: workday.id,
      createdAt: startedAt,
    });

    const trip = Trip.start({
      id: String(insertResult.id),
      startedAt,
      workdayId: String(workday.id),
      classification,
    });

    void (async () => {
      await captureTripGeoEnrichment({
        tripId: Number(trip.id),
        kind: "START",
        runtime: getApplicationRuntime(),
        snapshotRepository: tripGeoSnapshotRepository,
        errorLabel: "Error capturando snapshot GEO de inicio",
      });
    })();
  }
}
