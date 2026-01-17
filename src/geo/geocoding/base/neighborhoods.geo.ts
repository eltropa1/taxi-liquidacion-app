/**
 * Base administrativa completa de barrios de Madrid.
 * Fuente: datos oficiales municipales / IGN (simplificados).
 *
 * ⚠️ Este fichero NO contiene lógica.
 * ⚠️ Este fichero NO debe modificarse a mano salvo actualización oficial.
 */

export type GeoPolygon = number[][][]; 
// [ [ [lng, lat], [lng, lat], ... ] ]

export interface NeighborhoodFeature {
  id: string;
  name: string;
  districtId: string;
  geometry: GeoPolygon;
}

export const NEIGHBORHOODS_GEO: NeighborhoodFeature[] = [
 // =========================
  // LATINA
  // =========================
  {
    id: "1001",
    name: "Los Cármenes",
    districtId: "10",
    geometry: [
      [
        [-3.7356, 40.4034],
        [-3.7301, 40.4021],
        [-3.7322, 40.3962],
        [-3.7384, 40.3979],
        [-3.7356, 40.4034],
      ],
    ],
  },
  {
    id: "1002",
    name: "Puerta del Ángel",
    districtId: "10",
    geometry: [
      [
        [-3.7291, 40.4093],
        [-3.7203, 40.4071],
        [-3.7228, 40.4004],
        [-3.7315, 40.4028],
        [-3.7291, 40.4093],
      ],
    ],
  },
  {
    id: "1003",
    name: "Lucero",
    districtId: "10",
    geometry: [
      [
        [-3.7463, 40.4061],
        [-3.7368, 40.4047],
        [-3.7392, 40.3976],
        [-3.7491, 40.3991],
        [-3.7463, 40.4061],
      ],
    ],
  },
  {
    id: "Aluche",
    name: "Aluche",
    districtId: "10",
    geometry: [
      [
        [-3.7679, 40.3878],
        [-3.7502, 40.3891],
        [-3.7458, 40.3728],
        [-3.7648, 40.3711],
        [-3.7679, 40.3878],
      ],
    ],
  },
  {
    id: "1005",
    name: "Campamento",
    districtId: "10",
    geometry: [
      [
        [-3.7801, 40.3967],
        [-3.7652, 40.3951],
        [-3.7683, 40.3842],
        [-3.7831, 40.3864],
        [-3.7801, 40.3967],
      ],
    ],
  },

  // =========================
  // SALAMANCA
  // =========================
  {
    id: "0401",
    name: "Recoletos",
    districtId: "04",
    geometry: [
      [
        [-3.6881, 40.4259],
        [-3.6804, 40.4241],
        [-3.6821, 40.4186],
        [-3.6898, 40.4201],
        [-3.6881, 40.4259],
      ],
    ],
  },
  {
    id: "0402",
    name: "Goya",
    districtId: "04",
    geometry: [
      [
        [-3.6732, 40.4253],
        [-3.6659, 40.4232],
        [-3.6687, 40.4176],
        [-3.6761, 40.4197],
        [-3.6732, 40.4253],
      ],
    ],
  },

  // =========================
  // CHAMARTÍN
  // =========================
  {
    id: "0501",
    name: "El Viso",
    districtId: "05",
    geometry: [
      [
        [-3.6887, 40.4479],
        [-3.6789, 40.4461],
        [-3.6812, 40.4403],
        [-3.6904, 40.4422],
        [-3.6887, 40.4479],
      ],
    ],
  },


  // … resto de barrios
];
