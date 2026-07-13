import type {
  TripGeoSnapshotRecord,
  TripGeoSnapshotRepositoryPort,
} from "../../../application/ports/persistence";
import type { GeoAddressSnapshot } from "../../../application/ports/runtime/geoTypes";
import type { PersistenceDatabase } from "../database";

type StoredTripGeoSnapshotRow = {
  tripId: number;
  kind: "START" | "END";
  snapshot: string;
  createdAt: string;
};

export class SqliteTripGeoSnapshotRepository
  implements TripGeoSnapshotRepositoryPort
{
  constructor(private readonly database: PersistenceDatabase) {}

  async insert(snapshot: TripGeoSnapshotRecord): Promise<void> {
    await this.database.runAsync(
      `
      INSERT INTO trip_geo_snapshots
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

  async getSnapshotsForTrip(
    tripId: number,
  ): Promise<Array<TripGeoSnapshotRecord>> {
    const rows = await this.database.getAllAsync<StoredTripGeoSnapshotRow>(
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

  async getSnapshotsForWorkday(
    workdayId: number,
  ): Promise<Array<TripGeoSnapshotRecord>> {
    const rows = await this.database.getAllAsync<StoredTripGeoSnapshotRow>(
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

  async deleteSnapshotsForTrip(tripId: number): Promise<void> {
    await this.database.runAsync(
      `
      DELETE FROM trip_geo_snapshots
      WHERE tripId = ?
      `,
      [tripId],
    );
  }
}
