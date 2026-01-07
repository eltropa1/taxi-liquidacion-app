import { GeoLocationFix } from "../models/GeoLocationFix";

/**
 * GeoLocationService
 * ------------------
 * Contrato del servicio de captura de GPS.
 * NO depende de UI.
 * NO depende de TripService.
 */
export interface GeoLocationService {
  /**
   * Obtiene una posición GPS puntual.
   * Puede fallar (permisos, señal, etc.)
   */
  getCurrentLocation(): Promise<GeoLocationFix>;
}
