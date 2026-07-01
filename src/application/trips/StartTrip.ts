import { TripSource } from "../../constants/enums";
import { Trip } from "../../domain/trips/canonical";
import { TripServiceClassification } from "../../domain/trips/canonical";
import { getApplicationRuntime } from "../runtime";
import { getApplicationPersistence } from "../ports/persistence";

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

    const startedAt = new Date();
    const classification = TripServiceClassification.create({
      platformId: TripSource.TAXI,
      serviceLabel: TripSource.TAXI,
    });

    // 1️⃣ Persistir la apertura del viaje
    const insertResult = await tripRepository.createStartedTrip({
      startedAt,
      source: TripSource.TAXI,
      workdayId: workday.id,
      createdAt: startedAt,
    });

    // 2️⃣ Representar el viaje ya persistido mediante el aggregate canónico
    const trip = Trip.start({
      id: String(insertResult.id),
      startedAt,
      workdayId: String(workday.id),
      classification,
    });

    // El camino crítico termina aquí: la UI puede refrescar inmediatamente.
    // El snapshot GEO se captura en segundo plano para no bloquear la respuesta visual.
    void (async () => {
      try {
        const runtime = getApplicationRuntime();
        const location = await runtime.geoLocation.getCurrentLocation();
        const geoSnapshot = runtime.geoAdministrativeResolver.resolve(
          location.latitude,
          location.longitude,
        );

        await tripGeoSnapshotRepository.insert({
          tripId: Number(trip.id),
          kind: "START",
          snapshot: geoSnapshot,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error capturando snapshot GEO de inicio", error);
      }
    })();
  }
}
