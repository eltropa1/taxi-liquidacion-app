import * as Location from "expo-location";

/**
 * Resultado normalizado de localización GPS
 */
export type GeoLocationResult = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

/**
 * ExpoGeoLocationService
 * ----------------------
 * Servicio de obtención de GPS usando expo-location.
 *
 * - Aislado
 * - Reutilizable
 * - Sin lógica de negocio
 */
export class ExpoGeoLocationService {
  /**
   * Obtiene la localización actual del dispositivo.
   * Lanza error si no hay permisos o no se puede obtener.
   */
  async getCurrentLocation(): Promise<GeoLocationResult> {
    // 1️⃣ Permisos
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      throw new Error(
        "Permiso de localización denegado"
      );
    }

    // 2️⃣ Obtener posición
    const location =
      await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(
        location.timestamp
      ).toISOString(),
    };
  }
}
