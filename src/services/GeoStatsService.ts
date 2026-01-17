import { TripGeoSnapshotRepository } from "../database/repositories/TripGeoSnapshotRepository";
import { GeoAddressSnapshot } from "../geo/geocoding/models";

/**
 * Servicio de estadísticas GEO
 *
 * - SOLO lectura
 * - NO depende de UI
 * - NO modifica datos
 */
export class GeoStatsService {
  /**
   * Devuelve número de viajes agrupados por barrio
   * para un día de trabajo concreto.
   */
  static async getTripCountByNeighborhood(
    workdayId: number
  ): Promise<
    Array<{
      neighborhoodId: string;
      neighborhoodName: string;
      trips: number;
    }>
  > {
    const snapshots =
      await TripGeoSnapshotRepository.getSnapshotsForWorkday(workdayId);

    // Usamos SOLO snapshots START
    const startSnapshots = snapshots.filter(
      (s) => s.kind === "START"
    );

    const counter = new Map<
      string,
      { name: string; trips: number }
    >();

    for (const s of startSnapshots) {
      const neighborhood = s.snapshot.neighborhood;
      if (!neighborhood) continue;

      const key = neighborhood.id;

      if (!counter.has(key)) {
        counter.set(key, {
          name: neighborhood.name,
          trips: 1,
        });
      } else {
        counter.get(key)!.trips += 1;
      }
    }

    return Array.from(counter.entries()).map(
      ([neighborhoodId, data]) => ({
        neighborhoodId,
        neighborhoodName: data.name,
        trips: data.trips,
      })
    );
  }

  /**
   * Devuelve número de viajes agrupados por distrito
   * para un día de trabajo concreto.
   */
  static async getTripCountByDistrict(
    workdayId: number
  ): Promise<
    Array<{
      districtId: string;
      districtName: string;
      trips: number;
    }>
  > {
    const snapshots =
      await TripGeoSnapshotRepository.getSnapshotsForWorkday(workdayId);

    const startSnapshots = snapshots.filter(
      (s) => s.kind === "START"
    );

    const counter = new Map<
      string,
      { name: string; trips: number }
    >();

    for (const s of startSnapshots) {
      const district = s.snapshot.district;
      if (!district) continue;

      const key = district.id;

      if (!counter.has(key)) {
        counter.set(key, {
          name: district.name,
          trips: 1,
        });
      } else {
        counter.get(key)!.trips += 1;
      }
    }

    return Array.from(counter.entries()).map(
      ([districtId, data]) => ({
        districtId,
        districtName: data.name,
        trips: data.trips,
      })
    );
  }
}
