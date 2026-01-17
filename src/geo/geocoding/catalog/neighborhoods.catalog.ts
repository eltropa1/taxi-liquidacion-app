import { GeoAdministrativeUnit } from "../models";
import { GeoAdministrativeType } from "../models";

/**
 * Catálogo de barrios.
 * Solo se incluyen barrios relevantes
 * para análisis o reglas GEO.
 */
export const NEIGHBORHOODS_CATALOG: GeoAdministrativeUnit[] = [
  {
    id: "MAD_SOL",
    name: "Sol",
    type: GeoAdministrativeType.NEIGHBORHOOD,
    geoZoneId: "ZONE_SOL",
  },
  {
    id: "MAD_RECOLETOS",
    name: "Recoletos",
    type: GeoAdministrativeType.NEIGHBORHOOD,
    geoZoneId: "ZONE_RECOLETOS",
  },
];
