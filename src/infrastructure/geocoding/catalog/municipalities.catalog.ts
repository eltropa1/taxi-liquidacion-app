import { GeoAdministrativeType, GeoAdministrativeUnit } from "../models";
import { MUNICIPALITIES_GEO } from "../base";

/**
 * Catálogo de municipios de la Comunidad de Madrid, derivado de la
 * geometría oficial (`MUNICIPALITIES_GEO`) para no duplicar a mano
 * 179 nombres.
 */
export const MUNICIPALITIES_CATALOG: GeoAdministrativeUnit[] = MUNICIPALITIES_GEO.map(
  (municipality) => ({
    id: municipality.id,
    name: municipality.name,
    type: GeoAdministrativeType.MUNICIPALITY,
  }),
);

/**
 * Lista plana de municipios para uso en UI (selectores).
 *
 * IMPORTANTE:
 * - Derivada del catálogo oficial
 * - Solo lectura
 * - Sin lógica GEO
 * - Pensada exclusivamente para presentación
 */
export const MUNICIPALITIES_UI_LIST = MUNICIPALITIES_CATALOG.map((unit) => ({
  id: unit.id,
  label: unit.name,
})).sort((a, b) => a.label.localeCompare(b.label));
