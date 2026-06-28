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

    // 3️⃣ GPS real
    const location = await geoLocationService.getCurrentLocation();

    // 4️⃣ Resolver snapshot administrativo
    const geoSnapshot = GeoAdministrativeResolver.resolve(
      location.latitude,
      location.longitude,
    );

    // 5️⃣ Guardar snapshot START
    await TripGeoSnapshotRepository.insert({
      tripId: trip.id,
      kind: "START",
      snapshot: geoSnapshot,
      createdAt: new Date().toISOString(),
    });
  }
}
