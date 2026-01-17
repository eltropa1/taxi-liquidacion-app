import { GeoAddressSnapshot } from "../geo/geocoding/models";

/**
 * Snapshot GEO asociado a un viaje
 * (inicio o fin).
 *
 * - No guarda GPS crudo
 * - Guarda resolución administrativa completa
 */
export type TripGeoSnapshot = {
  id?: number;
  tripId: number;

  /**
   * START | END
   */
  kind: "START" | "END";

  /**
   * Snapshot administrativo completo
   * (barrio, distrito, zona especial, etc.)
   */
  snapshot: GeoAddressSnapshot;

  createdAt: string;
};
