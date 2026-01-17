import { TripGeoSnapshotRepository } from "../../../database/repositories/TripGeoSnapshotRepository";

export async function getTripGeoSnapshots(tripId: number) {
  return TripGeoSnapshotRepository.getByTripId(tripId);
}
