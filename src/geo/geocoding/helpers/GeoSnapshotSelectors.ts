
import { TripGeoSnapshot } from "../../../models/TripGeoSnapshot"
import { GeoAddressSnapshot } from "../models";

/**
 * Helpers semánticos para snapshots GEO
 * ------------------------------------
 * NO contienen lógica de negocio
 * SOLO expresan intención
 */

/**
 * Snapshot de ORIGEN (pickup)
 */
export function getPickupSnapshot(
  snapshots: TripGeoSnapshot[]
): GeoAddressSnapshot | null {
  return (
    snapshots.find((s) => s.kind === "START")?.snapshot ?? null
  );
}

/**
 * Snapshot de DESTINO (dropoff)
 */
export function getDropoffSnapshot(
  snapshots: TripGeoSnapshot[]
): GeoAddressSnapshot | null {
  return (
    snapshots.find((s) => s.kind === "END")?.snapshot ?? null
  );
}
