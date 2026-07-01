import type { GeoLocationFix } from "./geoTypes";

export interface GeoLocationPort {
  getCurrentLocation(): Promise<GeoLocationFix>;
}
