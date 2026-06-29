import { TripSource } from "../../constants/enums";
import { getDatabase } from "../../database/database";
import { TripGeoSnapshotRepository } from "../../database/repositories/TripGeoSnapshotRepository";
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

    const startTime = new Date().toISOString();
    const createdAt = startTime;

    const workday = await WorkdayService.getOpenWorkday();
    if (!workday) {
      throw new Error("No hay un día de trabajo abierto");
    }

    // 1️⃣ Crear viaje
    await db.runAsync(
      `
      INSERT INTO trips (startTime, source, createdAt, workdayId)
      VALUES (?, ?, ?, ?)
      `,
      [startTime, TripSource.TAXI, createdAt, workday.id],
    );

    // 2️⃣ Obtener viaje activo
    const trip = await db.getFirstAsync<{ id: number }>(
      `
      SELECT id
      FROM trips
      WHERE endTime IS NULL
      ORDER BY startTime DESC
      LIMIT 1
      `,
    );

    if (!trip) return;

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
          tripId: trip.id,
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
