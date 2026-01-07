import { GeoPoint } from "./GeoPoint";

/**
 * GeoRule
 * -------
 * Contrato que debe cumplir cualquier regla geográfica.
 * 
 * IMPORTANTE:
 * - No se implementa aquí
 * - No hay lógica
 * - Solo define el "shape" de una regla
 */
export interface GeoRule {
  /**
   * Tipo de regla
   * Permite al motor decidir cómo evaluarla
   */
  type: string;

  /**
   * Payload específico de la regla
   * (radio, polígono, bbox, etc.)
   */
  payload: unknown;
}
