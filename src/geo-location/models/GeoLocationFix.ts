/**
 * GeoLocationFix
 * --------------
 * Representa una captura puntual de localización GPS.
 * Es un dato técnico, no de negocio.
 */
export interface GeoLocationFix {
  latitude: number;
  longitude: number;

  /**
   * Precisión estimada en metros (si está disponible)
   */
  accuracy?: number;

  /**
   * Timestamp exacto del fix
   */
  timestamp: string;
}
