/**
 * Generador oficial de barrios del municipio de Madrid
 *
 * Fuente:
 * Ayuntamiento de Madrid – Límites administrativos (Barrios municipales)
 *
 * Entrada:
 * - data/barrios_madrid.geojson (EPSG:4326 / CRS84)
 *
 * Salida:
 * - src/geo/geocoding/base/neighborhoods.geo.ts
 * - src/geo/geocoding/catalog/neighborhoods.catalog.ts
 *
 * ⚠️ NO inventa datos
 * ⚠️ Reproducible
 */

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
  "../../data/barrios_madrid.geojson"
);

const OUTPUT_GEO = path.resolve(
  __dirname,
  "../../src/geo/geocoding/base/neighborhoods.geo.ts"
);

const OUTPUT_CATALOG = path.resolve(
  __dirname,
  "../../src/geo/geocoding/catalog/neighborhoods.catalog.ts"
);

// =============================
// TIPOS
// =============================

interface Feature {
  properties: {
    COD_BAR: string;
    NOMBRE: string;
    CODDIS: string;
  };
  geometry: {
    type: "MultiPolygon" | "Polygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: Feature[];
}

// =============================
// LECTURA
// =============================

const raw = fs.readFileSync(INPUT_GEOJSON, "utf-8");
const geojson: FeatureCollection = JSON.parse(raw);

// =============================
// TRANSFORMACIÓN
// =============================

const neighborhoodsGeo = geojson.features.map((feature) => {
  const id = feature.properties.COD_BAR;
  const name = feature.properties.NOMBRE;
  const districtId = feature.properties.CODDIS.padStart(2, "0");

  const geometry =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;

  return {
    id,
    name,
    districtId,
    geometry,
  };
});

// =============================
// ESCRITURA neighborhoods.geo.ts
// =============================

const geoFile = `/**
 * Base administrativa oficial de barrios del municipio de Madrid.
 *
 * Fuente:
 * Ayuntamiento de Madrid – Límites administrativos (Barrios municipales).
 *
 * ⚠️ Este fichero NO contiene lógica.
 * ⚠️ NO modificar a mano salvo actualización oficial.
 */

export type GeoPolygon = number[][][];

export interface NeighborhoodFeature {
  id: string;         // COD_BAR
  name: string;       // NOMBRE
  districtId: string; // CODDIS
  geometry: GeoPolygon;
}

export const NEIGHBORHOODS_GEO: NeighborhoodFeature[] = ${JSON.stringify(
  neighborhoodsGeo,
  null,
  2
)};
`;

fs.writeFileSync(OUTPUT_GEO, geoFile, "utf-8");

// =============================
// ESCRITURA neighborhoods.catalog.ts
// =============================

const catalogFile = `import { GeoAdministrativeUnit } from "../models";
import { GeoAdministrativeType } from "../models";

/**
 * Catálogo oficial de barrios administrativos del municipio de Madrid.
 *
 * Fuente:
 * Ayuntamiento de Madrid – Límites administrativos (Barrios municipales).
 */
export const NEIGHBORHOODS_CATALOG: GeoAdministrativeUnit[] = [
${neighborhoodsGeo
  .map(
    (b) =>
      `  { id: "${b.id}", name: "${b.name}", type: GeoAdministrativeType.NEIGHBORHOOD },`
  )
  .join("\n")}
];
`;

fs.writeFileSync(OUTPUT_CATALOG, catalogFile, "utf-8");

// =============================
// FINAL
// =============================

console.log("✔ Barrios generados correctamente");
console.log(`✔ Total barrios: ${neighborhoodsGeo.length}`);
console.log(`→ ${OUTPUT_GEO}`);
console.log(`→ ${OUTPUT_CATALOG}`);
