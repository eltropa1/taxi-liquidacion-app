import { GeoAdministrativeUnit } from "../models";
import { GeoAdministrativeType } from "../models";

/**
 * Catálogo oficial de distritos administrativos del municipio de Madrid.
 *
 * Fuente: Ayuntamiento de Madrid (Portal de Datos Abiertos).
 * Dataset: “Delimitación de los distritos del municipio de Madrid”.
 *
 * Decisión de mapeo:
 * - `id` = `COD_DIS` oficial (string con cero a la izquierda).
 * - `name` = nombre oficial del distrito.
 * - `type` = DISTRICT (cerrado por diseño).
 *
 * Motivo:
 * - IDs oficiales, estables y reutilizados por cartografía y estadísticas municipales.
 * - Evita prefijos arbitrarios y garantiza trazabilidad con datos oficiales.
 */
export const DISTRICTS_CATALOG: GeoAdministrativeUnit[] = [
  { id: "01", name: "Centro", type: GeoAdministrativeType.DISTRICT },
  { id: "02", name: "Arganzuela", type: GeoAdministrativeType.DISTRICT },
  { id: "03", name: "Retiro", type: GeoAdministrativeType.DISTRICT },
  { id: "04", name: "Salamanca", type: GeoAdministrativeType.DISTRICT },
  { id: "05", name: "Chamartín", type: GeoAdministrativeType.DISTRICT },
  { id: "06", name: "Tetuán", type: GeoAdministrativeType.DISTRICT },
  { id: "07", name: "Chamberí", type: GeoAdministrativeType.DISTRICT },
  { id: "08", name: "Fuencarral-El Pardo", type: GeoAdministrativeType.DISTRICT },
  { id: "09", name: "Moncloa-Aravaca", type: GeoAdministrativeType.DISTRICT },
  { id: "10", name: "Latina", type: GeoAdministrativeType.DISTRICT },
  { id: "11", name: "Carabanchel", type: GeoAdministrativeType.DISTRICT },
  { id: "12", name: "Usera", type: GeoAdministrativeType.DISTRICT },
  { id: "13", name: "Puente de Vallecas", type: GeoAdministrativeType.DISTRICT },
  { id: "14", name: "Moratalaz", type: GeoAdministrativeType.DISTRICT },
  { id: "15", name: "Ciudad Lineal", type: GeoAdministrativeType.DISTRICT },
  { id: "16", name: "Hortaleza", type: GeoAdministrativeType.DISTRICT },
  { id: "17", name: "Villaverde", type: GeoAdministrativeType.DISTRICT },
  { id: "18", name: "Villa de Vallecas", type: GeoAdministrativeType.DISTRICT },
  { id: "19", name: "Vicálvaro", type: GeoAdministrativeType.DISTRICT },
  { id: "20", name: "San Blas-Canillejas", type: GeoAdministrativeType.DISTRICT },
  { id: "21", name: "Barajas", type: GeoAdministrativeType.DISTRICT },
];
