import { GeoAdministrativeType } from "./GeoAdministrativeType";

/**
 * Unidad administrativa resoluble por geocodificación.
 * Ejemplos: barrio, distrito, aeropuerto, estación.
 */
export interface GeoAdministrativeUnit {
  /** Identificador interno estable */
  id: string;

  /** Nombre legible */
  name: string;

  /** Tipo administrativo */
  type: GeoAdministrativeType;

  /**
   * ID de zona GEO asociada (opcional).
   * Permite enlazar con el motor GEO sin acoplarlos.
   */
  geoZoneId?: string;
}
