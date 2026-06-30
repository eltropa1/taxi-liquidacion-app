import { TripSource } from "../../constants/enums";
import { getDatabase } from "../../database/database";
import { TripGeoSnapshotRepository } from "../../database/repositories/TripGeoSnapshotRepository";
import { Trip } from "../../domain/trips/canonical";
import { TripServiceClassification } from "../../domain/trips/canonical";
import { GeoLocationFactory } from "../../geo-location";
import { GeoAdministrativeResolver } from "../../geo/geocoding/engine";
import { WorkdayService } from "../../services/WorkdayService";

const geoLocationService = GeoLocationFactory.create();

/**
 * Caso de uso: iniciar un viaje.
 *
 * Coordina el ciclo completo sin exponer detalles de UI.
 */
export class StartTrip {
  static async execute(): Promise<void> {
    const db = await getDatabase();

    const workday = await WorkdayService.getOpenWorkday();
    if (!workday) {
      throw new Error("No hay un día de trabajo abierto");
    }

    const startedAt = new Date();
    const classification = TripServiceClassification.create({
      platformId: TripSource.TAXI,
      serviceLabel: TripSource.TAXI,
    });

    // 1️⃣ Persistir la apertura del viaje
    const insertResult = await db.runAsync(
      `
      INSERT INTO trips (startTime, source, createdAt, workdayId)
      VALUES (?, ?, ?, ?)
      `,
      [
        startedAt.toISOString(),
        classification.platformId ?? TripSource.TAXI,
        startedAt.toISOString(),
        workday.id,
      ],
    );

    // 2️⃣ Representar el viaje ya persistido mediante el aggregate canónico
    const trip = Trip.start({
      id: String(insertResult.lastInsertRowId),
      startedAt,
      workdayId: String(workday.id),
      classification,
    });

    // El camino crítico termina aquí: la UI puede refrescar inmediatamente.
    // El snapshot GEO se captura en segundo plano para no bloquear la respuesta visual.
    void (async () => {
      try {
        const location = await geoLocationService.getCurrentLocation();
        const geoSnapshot = GeoAdministrativeResolver.resolve(
          location.latitude,
          location.longitude,
        );

        await TripGeoSnapshotRepository.insert({
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
