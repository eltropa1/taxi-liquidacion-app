import { getApplicationPersistence } from "../ports/persistence";
import { TripQueryService } from "./TripQueryService";

export class TripService {
  static async getTripById(id: number) {
    return TripQueryService.getTripById(id);
  }

  static async getCanonicalTripById(id: number) {
    return TripQueryService.getCanonicalTripById(id);
  }

  static async getTripGeoSnapshots(tripId: number) {
    return getApplicationPersistence().tripGeoSnapshotRepository.getSnapshotsForTrip(
      tripId,
    );
  }
}
