import { getDatabase } from "../database";
import { TripGeoSnapshot } from "../../models/TripGeoSnapshot";
import { TRIP_GEO_SNAPSHOTS_TABLE } from "../schema";
import { GeoAddressSnapshot } from "../../geo/geocoding/models";

export class TripGeoSnapshotRepository {
  static async insert(snapshot: TripGeoSnapshot): Promise<void> {
    const db = await getDatabase();

    await db.runAsync(
      `
      INSERT INTO ${TRIP_GEO_SNAPSHOTS_TABLE}
        (tripId, kind, snapshot, createdAt)
      VALUES (?, ?, ?, ?)
      `,
      [
        snapshot.tripId,
        snapshot.kind,
        JSON.stringify(snapshot.snapshot),
        snapshot.createdAt,
      ],
    );
  }

  /**
   * Devuelve los snapshots GEO de un viaje (START / END).
   * - Snapshot PARSEADO
   * - Ordenado por creación
   */
  static async getSnapshotsForTrip(tripId: number): Promise<
    Array<{
      tripId: number;
      kind: "START" | "END";
      snapshot: GeoAddressSnapshot;
      createdAt: string;
    }>
  > {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
      tripId: number;
      kind: "START" | "END";
      snapshot: string;
      createdAt: string;
    }>(
      `
    SELECT
      tripId,
      kind,
      snapshot,
      createdAt
    FROM trip_geo_snapshots
    WHERE tripId = ?
    ORDER BY createdAt ASC
    `,
      [tripId],
    );

    return rows.map((row) => ({
      tripId: row.tripId,
      kind: row.kind,
      snapshot: JSON.parse(row.snapshot) as GeoAddressSnapshot,
      createdAt: row.createdAt,
    }));
  }

  // =========================
  // EXISTENTE: insert(...)
  // =========================

  /**
   * Devuelve todos los snapshots GEO (START + END)
   * asociados a un día de trabajo concreto.
   *
   * - El snapshot JSON se devuelve PARSEADO
   * - Ordenado por fecha de creación
   */
  static async getSnapshotsForWorkday(workdayId: number): Promise<
    Array<{
      tripId: number;
      kind: "START" | "END";
      snapshot: GeoAddressSnapshot;
      createdAt: string;
    }>
  > {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
      tripId: number;
      kind: "START" | "END";
      snapshot: string;
      createdAt: string;
    }>(
      `
      SELECT
        s.tripId,
        s.kind,
        s.snapshot,
        s.createdAt
      FROM trip_geo_snapshots s
      INNER JOIN trips t ON t.id = s.tripId
      WHERE t.workdayId = ?
      ORDER BY s.createdAt ASC
      `,
      [workdayId],
    );

    return rows.map((row) => ({
      tripId: row.tripId,
      kind: row.kind,
      snapshot: JSON.parse(row.snapshot) as GeoAddressSnapshot,
      createdAt: row.createdAt,
    }));
  }
}
