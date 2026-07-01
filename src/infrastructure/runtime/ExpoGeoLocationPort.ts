import * as Location from "expo-location";
import type { GeoLocationPort } from "../../application/ports/runtime";

export class ExpoGeoLocationPort implements GeoLocationPort {
  async getCurrentLocation() {
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
