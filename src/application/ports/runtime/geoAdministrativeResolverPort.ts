import type { GeoAddressSnapshot } from "./geoTypes";

export interface GeoAdministrativeResolverPort {
  resolve(latitude: number, longitude: number): GeoAddressSnapshot;
}
