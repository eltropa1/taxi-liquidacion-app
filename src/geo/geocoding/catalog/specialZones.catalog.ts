import { GeoAdministrativeUnit } from "../models";
import { GeoAdministrativeType } from "../models";

/**
 * Zonas especiales relevantes para el taxi.
 * Ejemplos: aeropuerto, estaciones, paradas singulares.
 */
export const SPECIAL_ZONES_CATALOG: GeoAdministrativeUnit[] = [
  {
    id: "MAD_AIRPORT_T1_T2",
    name: "Aeropuerto Madrid T1 / T2",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geoZoneId: "ZONE_AIRPORT_T1_T2",
  },
  {
    id: "MAD_AIRPORT_T4",
    name: "Aeropuerto Madrid T4 / T4S",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geoZoneId: "ZONE_AIRPORT_T4",
  },
  {
    id: "MAD_ESTACION_ATOCHA",
    name: "Estación de Atocha",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geoZoneId: "ZONE_ATOCHA",
  },
];
