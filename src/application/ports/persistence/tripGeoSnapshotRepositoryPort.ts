import type { GeoAddressSnapshot } from "../runtime/geoTypes";

export type TripGeoSnapshotRecord = Readonly<{
  tripId: number;
  kind: "START" | "END";
  snapshot: GeoAddressSnapshot;
  createdAt: string;
}>;

export interface TripGeoSnapshotRepositoryPort {
  insert(snapshot: TripGeoSnapshotRecord): Promise<void>;

  getSnapshotsForTrip(
    tripId: number,
  ): Promise<Array<TripGeoSnapshotRecord>>;

  getSnapshotsForWorkday(
    workdayId: number,
  ): Promise<Array<TripGeoSnapshotRecord>>;

  deleteSnapshotsForTrip(tripId: number): Promise<void>;
}
