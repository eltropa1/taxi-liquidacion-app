import { getDatabase } from "../database";
import { TripGeoSnapshot } from "../../models/TripGeoSnapshot";
import {
  TRIP_GEO_SNAPSHOTS_TABLE,
} from "../schema";

/**
 * TripGeoSnapshotRepository
 * -------------------------
 * Acceso a datos para snapshots geográficos de viajes.
 *
 * Responsabilidad única:
 * - Persistencia SQLite
 * - Sin lógica de negocio
 */
export class TripGeoSnapshotRepository {
  /**
   * Inserta un nuevo snapshot GEO
   */
  static async insert(snapshot: TripGeoSnapshot): Promise<void> {
    const db = await getDatabase();

    const query = `
      INSERT INTO ${TRIP_GEO_SNAPSHOTS_TABLE}
      (tripId, type, latitude, longitude, timestamp, zoneId, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    await db.runAsync(query, [
      snapshot.tripId,
      snapshot.type,
      snapshot.latitude,
      snapshot.longitude,
      snapshot.timestamp,
      snapshot.zoneId ?? null,
      snapshot.createdAt,
    ]);
  }

  /**
   * Obtiene todos los snapshots GEO de un viaje
   */
  static async getByTripId(tripId: number): Promise<TripGeoSnapshot[]> {
    const db = await getDatabase();

    const query = `
      SELECT *
      FROM ${TRIP_GEO_SNAPSHOTS_TABLE}
      WHERE tripId = ?
      ORDER BY createdAt ASC;
    `;

    const rows = await db.getAllAsync<TripGeoSnapshot>(query, [tripId]);
    return rows;
  }
}
