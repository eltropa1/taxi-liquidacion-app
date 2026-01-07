import { GeoLocationService } from "./services/GeoLocationService";
import { ExpoGeoLocationService } from "./services/ExpoGeoLocationService";

/**
 * Factory del servicio de localización
 */
export class GeoLocationFactory {
  static create(): GeoLocationService {
    return new ExpoGeoLocationService();
  }
}
