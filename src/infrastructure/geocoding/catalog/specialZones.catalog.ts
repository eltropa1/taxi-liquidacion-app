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
  //
  // Coordenadas de referencia verificadas (Wikipedia / fuentes GPS):
  // - T1: 40.4641, -3.5704
  // - T2: 40.4681, -3.5703
  // - T4: 40.4918, -3.5936
  //
  // T1, T2 y T3 comparten el mismo complejo de edificio y viales de
  // recogida: no es fiable distinguirlos por GPS, así que se modelan
  // como una única zona.
  //
  // T4 y T4S comparten la misma parada de taxi (los pasajeros de T4S
  // llegan a ella vía people mover): se modelan como una única zona
  // anclada en las coordenadas reales de T4.

  {
    id: "MAD_AIRPORT_T1_T2_T3",
    name: "Aeropuerto T1 / T2 / T3",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.5760, 40.4720],
        [-3.5620, 40.4720],
        [-3.5620, 40.4600],
        [-3.5760, 40.4600],
        [-3.5760, 40.4720],
      ],
    ],
  },

  {
    id: "MAD_AIRPORT_T4",
    name: "Aeropuerto T4 / T4S",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6010, 40.4980],
        [-3.5850, 40.4980],
        [-3.5850, 40.4850],
        [-3.6010, 40.4850],
        [-3.6010, 40.4980],
      ],
    ],
  },

  // =========================
  // ESTACIONES
  // =========================
  //
  // - Atocha: 40.4065, -3.6893
  // - Chamartín: 40.4721, -3.6827

  {
    id: "MAD_ATOCHA",
    name: "Estación de Atocha",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6950, 40.4110],
        [-3.6820, 40.4110],
        [-3.6820, 40.3990],
        [-3.6950, 40.3990],
        [-3.6950, 40.4110],
      ],
    ],
  },

  {
    id: "MAD_CHAMARTIN",
    name: "Estación de Chamartín",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6890, 40.4780],
        [-3.6760, 40.4780],
        [-3.6760, 40.4660],
        [-3.6890, 40.4660],
        [-3.6890, 40.4780],
      ],
    ],
  },

  // - Nuevos Ministerios: 40.4466, -3.6925
  {
    id: "MAD_NUEVOS_MINISTERIOS",
    name: "Nuevos Ministerios",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6975, 40.4515],
        [-3.6875, 40.4515],
        [-3.6875, 40.4415],
        [-3.6975, 40.4415],
        [-3.6975, 40.4515],
      ],
    ],
  },

  // - Príncipe Pío: 40.4211, -3.7204
  {
    id: "MAD_PRINCIPE_PIO",
    name: "Estación de Príncipe Pío",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.7255, 40.4260],
        [-3.7155, 40.4260],
        [-3.7155, 40.4160],
        [-3.7255, 40.4160],
        [-3.7255, 40.4260],
      ],
    ],
  },

  // =========================
  // RECINTOS
  // =========================
  //
  // - IFEMA: 40.4678, -3.6172

  {
    id: "MAD_IFEMA",
    name: "IFEMA",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6260, 40.4730],
        [-3.6080, 40.4730],
        [-3.6080, 40.4620],
        [-3.6260, 40.4620],
        [-3.6260, 40.4730],
      ],
    ],
  },

  // =========================
  // HOSPITALES
  // =========================
  //
  // Coordenadas de referencia verificadas (infobox Wikipedia):
  // - La Paz: 40.4809, -3.6874
  // - Gregorio Marañón: 40.4195, -3.6712
  // - 12 de Octubre: 40.3762, -3.6985
  // - Ramón y Cajal: 40.4872, -3.6939
  //
  // La Paz y Ramón y Cajal están a poco más de 1 km entre sí: las cajas
  // se ajustan para no solaparse.

  {
    id: "MAD_HOSPITAL_LA_PAZ",
    name: "Hospital La Paz",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6915, 40.4835],
        [-3.6835, 40.4835],
        [-3.6835, 40.4780],
        [-3.6915, 40.4780],
        [-3.6915, 40.4835],
      ],
    ],
  },

  {
    id: "MAD_HOSPITAL_GREGORIO_MARANON",
    name: "Hospital Gregorio Marañón",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6760, 40.4240],
        [-3.6665, 40.4240],
        [-3.6665, 40.4150],
        [-3.6760, 40.4150],
        [-3.6760, 40.4240],
      ],
    ],
  },

  {
    id: "MAD_HOSPITAL_12_OCTUBRE",
    name: "Hospital 12 de Octubre",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.7035, 40.3810],
        [-3.6935, 40.3810],
        [-3.6935, 40.3715],
        [-3.7035, 40.3715],
        [-3.7035, 40.3810],
      ],
    ],
  },

  {
    id: "MAD_HOSPITAL_RAMON_Y_CAJAL",
    name: "Hospital Ramón y Cajal",
    type: GeoAdministrativeType.SPECIAL_ZONE,
    geometry: [
      [
        [-3.6985, 40.4910],
        [-3.6900, 40.4910],
        [-3.6900, 40.4845],
        [-3.6985, 40.4845],
        [-3.6985, 40.4910],
      ],
    ],
  },
];
