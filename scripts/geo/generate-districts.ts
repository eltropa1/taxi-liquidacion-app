/**
 * Generador oficial de distritos del municipio de Madrid
 *
 * Fuente:
 * - data/barrios_madrid.geojson
 *
 * Estrategia:
 * - Agrupar barrios por CODDIS
 * - Disolver geometrías (union real)
 * - Generar districts.geo.ts
 *
 * ⚠️ Reproducible
 * ⚠️ Sin datos inventados
 */

import * as turf from "@turf/turf";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =============================
// CONFIGURACIÓN
// =============================

const INPUT_GEOJSON = path.resolve(
  __dirname,
  "../../data/barrios_madrid.geojson",
);

const OUTPUT_GEO = path.resolve(
  __dirname,
  "../../src/geo/geocoding/base/districts.geo.ts",
);

// =============================
// LECTURA
// =============================

const raw = fs.readFileSync(INPUT_GEOJSON, "utf-8");
const geojson = JSON.parse(raw);

// =============================
// AGRUPACIÓN POR DISTRITO
// =============================

const districtsMap: Record<string, { name: string; features: any[] }> = {};

for (const feature of geojson.features) {
  const codDis = feature.properties.CODDIS.padStart(2, "0");
  const name = feature.properties.NOMDIS;

  if (!districtsMap[codDis]) {
    districtsMap[codDis] = { name, features: [] };
  }

  districtsMap[codDis].features.push(feature);
}

// =============================
// DISOLUCIÓN GEOMÉTRICA
// =============================

const districts = Object.entries(districtsMap).map(([id, data]) => {
  let merged: any;

if (data.features.length === 1) {
  merged = data.features[0];
} else {
  merged = turf.union(
    turf.featureCollection(data.features)
  ) as any;
}


  const geometry =
    merged.geometry.type === "Polygon"
      ? [merged.geometry.coordinates]
      : merged.geometry.coordinates;

  return {
    id,
    name: data.name,
    geometry,
  };
});

// =============================
// ESCRITURA districts.geo.ts
// =============================

const fileContent = `/**
 * Base administrativa oficial de distritos del municipio de Madrid.
 *
 * Fuente:
 * - Ayuntamiento de Madrid
 * - Generado a partir de barrios oficiales (disolución geométrica)
 *
 * ⚠️ Este fichero NO contiene lógica.
 * ⚠️ NO modificar a mano.
 */

import { GeoPolygon } from "./neighborhoods.geo";

export interface DistrictFeature {
  id: string;   // CODDIS
  name: string; // NOMDIS
  geometry: GeoPolygon;
}

export const DISTRICTS_GEO: DistrictFeature[] = ${JSON.stringify(
  districts,
  null,
  2,
)};
`;

fs.writeFileSync(OUTPUT_GEO, fileContent, "utf-8");

// =============================
// FINAL
// =============================

console.log("✔ Distritos generados correctamente");
console.log(`✔ Total distritos: ${districts.length}`);
console.log(`→ ${OUTPUT_GEO}`);
