import { GeoAdministrativeType } from "./GeoAdministrativeType";

/**
 * Resultado de la geocodificación administrativa
 * para un punto concreto.
 */
export interface GeoAddressSnapshot {
  /** Timestamp de resolución */
  resolvedAt: string;

  /** Coordenadas originales */
  latitude: number;
  longitude: number;

  /** Distrito asignado (si existe) */
  district?: {
    id: string;
    name: string;
  };

  /** Barrio asignado (si existe) */
  neighborhood?: {
    id: string;
    name: string;
  };

  /** Zona especial asignada (si existe) */
  specialZone?: {
    id: string;
    name: string;
    type: GeoAdministrativeType.SPECIAL_ZONE;
  };
}
