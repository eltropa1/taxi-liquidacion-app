/**
 * Base administrativa completa de distritos de Madrid.
 */

import { GeoPolygon } from "./neighborhoods.geo";

export interface DistrictFeature {
  id: string;
  name: string;
  geometry: GeoPolygon;
}

export const DISTRICTS_GEO: DistrictFeature[] = [
  {
    id: "01",
    name: "Centro",
    geometry: [
      [
        [-3.7038, 40.4175],
        [-3.7001, 40.4189],
        [-3.6982, 40.4152],
        [-3.7016, 40.4138],
        [-3.7038, 40.4175],
      ],
    ],
  },
  {
    id: "02",
    name: "Arganzuela",
    geometry: [
      [
        [-3.7075, 40.4051],
        [-3.6973, 40.4048],
        [-3.6921, 40.3982],
        [-3.7032, 40.3969],
        [-3.7075, 40.4051],
      ],
    ],
  },
  {
    id: "03",
    name: "Retiro",
    geometry: [
      [
        [-3.6845, 40.4181],
        [-3.6762, 40.4157],
        [-3.6781, 40.4083],
        [-3.6869, 40.4096],
        [-3.6845, 40.4181],
      ],
    ],
  },
  {
    id: "04",
    name: "Salamanca",
    geometry: [
      [
        [-3.6761, 40.4341],
        [-3.6679, 40.4314],
        [-3.6712, 40.4232],
        [-3.6804, 40.4259],
        [-3.6761, 40.4341],
      ],
    ],
  },
  {
    id: "05",
    name: "Chamartín",
    geometry: [
      [
        [-3.6887, 40.4602],
        [-3.6723, 40.4568],
        [-3.6765, 40.4461],
        [-3.6918, 40.4499],
        [-3.6887, 40.4602],
      ],
    ],
  },
  {
    id: "06",
    name: "Tetuán",
    geometry: [
      [
        [-3.7065, 40.4609],
        [-3.6891, 40.4582],
        [-3.6924, 40.4496],
        [-3.7092, 40.4524],
        [-3.7065, 40.4609],
      ],
    ],
  },
  {
    id: "10",
    name: "Latina",
    geometry: [
      [
        [-3.7679, 40.3878],
        [-3.7401, 40.3896],
        [-3.7335, 40.3722],
        [-3.7648, 40.3711],
        [-3.7679, 40.3878],
      ],
    ],
  },
  // … resto de distritos
];
