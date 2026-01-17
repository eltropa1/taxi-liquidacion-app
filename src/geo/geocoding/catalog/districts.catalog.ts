import { GeoAdministrativeUnit } from "../models";
import { GeoAdministrativeType } from "../models";

/**
 * Catálogo de distritos administrativos.
 * ⚠️ No es un listado completo de Madrid:
 * solo los distritos que la app necesita.
 */
export const DISTRICTS_CATALOG: GeoAdministrativeUnit[] = [
  {
    id: "MAD_CENTRO",
    name: "Centro",
    type: GeoAdministrativeType.DISTRICT,
  },
  {
    id: "MAD_CHAMARTIN",
    name: "Chamartín",
    type: GeoAdministrativeType.DISTRICT,
  },
  {
    id: "MAD_SALAMANCA",
    name: "Salamanca",
    type: GeoAdministrativeType.DISTRICT,
  },
];
