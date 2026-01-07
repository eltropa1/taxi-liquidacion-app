import * as Location from "expo-location";
import { GeoLocationFix } from "../models/GeoLocationFix";
import { GeoLocationService } from "./GeoLocationService";

/**
 * Implementación de GeoLocationService usando expo-location
 */
export class ExpoGeoLocationService implements GeoLocationService {
  async getCurrentLocation(): Promise<GeoLocationFix> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permiso de localización denegado");
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy ?? undefined,
      timestamp: new Date(position.timestamp).toISOString(),
    };
  }
}
