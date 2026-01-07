import { GeoRule } from "./GeoRule";

/**
 * GeoZone
 * -------
 * Define una zona geográfica lógica de la app.
 * 
 * Una zona:
 * - Tiene identidad estable
 * - Agrupa reglas
 * - No decide nada por sí misma
 */
export interface GeoZone {
  /**
   * Identificador único y estable de la zona
   * (ej: "AEROPUERTO_T4", "CENTRO_EXTENDIDO")
   */
  id: string;

  /**
   * Nombre legible para humanos
   */
  name: string;

  /**
   * Reglas que definen cuándo un punto
   * pertenece o no a esta zona
   */
  rules: GeoRule[];
}
