import { GeoPoint } from "./GeoPoint";

/**
 * GeoContext
 * ----------
 * Contexto completo que se entrega al motor
 * para evaluar ubicación.
 * 
 * A futuro podrá crecer sin romper nada.
 */
export interface GeoContext {
  /**
   * Posición actual del vehículo
   */
  point: GeoPoint;

  /**
   * Timestamp de la medición
   * (útil para reglas temporales futuras)
   */
  timestamp: Date;
}
