/**
 * Catálogo de ZONAS ESPECIALES de Madrid.
 *
 * Prioridad máxima en resolución GEO.
 * Fuente: delimitaciones funcionales (simplificadas).
 *
 * ⚠️ NO contiene lógica
 * ⚠️ Se amplía, no se modifica
 */

import { GeoPolygon } from "../base";
import { GeoAdministrativeType } from "../models";

export interface SpecialZone {
  id: string;
  name: string;
  type: GeoAdministrativeType.SPECIAL_ZONE;
  geometry: GeoPolygon;
}

export const SPECIAL_ZONES_CATALOG: SpecialZone[] = [
  // =========================
  // AEROPUERTO MADRID-BARAJAS
  // =========================

  {
    id: "MAD_AIRPORT_T4",
    name: "Aeropuerto T4 / T4S",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.5935, 40.4978],
        [-3.5750, 40.4978],
        [-3.5750, 40.4800],
        [-3.5935, 40.4800],
        [-3.5935, 40.4978],
      ],
    ],
  },

  {
    id: "MAD_AIRPORT_T1",
    name: "Aeropuerto T1",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.5705, 40.4765],
        [-3.5570, 40.4765],
        [-3.5570, 40.4690],
        [-3.5705, 40.4690],
        [-3.5705, 40.4765],
      ],
    ],
  },

  {
    id: "MAD_AIRPORT_T2",
    name: "Aeropuerto T2",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.5705, 40.4690],
        [-3.5570, 40.4690],
        [-3.5570, 40.4630],
        [-3.5705, 40.4630],
        [-3.5705, 40.4690],
      ],
    ],
  },

  // =========================
  // ESTACIONES
  // =========================

  {
    id: "MAD_ATOCHA",
    name: "Estación de Atocha",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6915, 40.4075],
        [-3.6810, 40.4075],
        [-3.6810, 40.4000],
        [-3.6915, 40.4000],
        [-3.6915, 40.4075],
      ],
    ],
  },

  {
    id: "MAD_CHAMARTIN",
    name: "Estación de Chamartín",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6820, 40.4730],
        [-3.6710, 40.4730],
        [-3.6710, 40.4660],
        [-3.6820, 40.4660],
        [-3.6820, 40.4730],
      ],
    ],
  },

  // =========================
  // RECINTOS
  // =========================

  {
    id: "MAD_IFEMA",
    name: "IFEMA",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6180, 40.4680],
        [-3.6030, 40.4680],
        [-3.6030, 40.4590],
        [-3.6180, 40.4590],
        [-3.6180, 40.4680],
      ],
    ],
  },
];
